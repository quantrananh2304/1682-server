import {
  vnp_HashSecret,
  vnp_ReturnUrl,
  vnp_TmnCode,
  vnp_Url,
} from "@app-configs";
import { Request, Response } from "@app-helpers/http.extends";
import { BookModelInterface } from "@app-repositories/models/Books";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { PaymentMethodModelInterface } from "@app-repositories/models/PaymentMethods";
import {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  PaymentModelInterface,
} from "@app-repositories/models/Payments";
import { USER_ROLE, UserModelInterface } from "@app-repositories/models/Users";
import TYPES from "@app-repositories/types";
import BookService from "@app-services/BookService";
import EventService from "@app-services/EventService";
import PaymentService from "@app-services/PaymentService";
import UserService from "@app-services/UserService";
import CONSTANTS from "@app-utils/Constants";
import { sortObject } from "@app-utils/utils";
import { format } from "date-fns";
import { inject, injectable } from "inversify";
// eslint-disable-next-line
const QueryString = require("qs");
// eslint-disable-next-line
const crypto = require("crypto");

@injectable()
class PaymentController {
  @inject(TYPES.PaymentService) private readonly paymentService: PaymentService;
  @inject(TYPES.EventService) private readonly eventService: EventService;
  @inject(TYPES.BookService) private readonly bookService: BookService;
  @inject(TYPES.UserService) private readonly userService: UserService;

  async createPaymentMethod(req: Request, res: Response) {
    try {
      const { userId } = req.headers;
      const { name, note } = req.body;

      const existPaymentMethod: PaymentMethodModelInterface =
        await this.paymentService.getPaymentMethodByName(name);

      if (existPaymentMethod) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.PAYMENT_METHOD_EXISTED);
      }

      const paymentMethod: PaymentMethodModelInterface =
        await this.paymentService.createPaymentMethod(userId, name, note);

      if (!paymentMethod) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.PAYMENT_METHOD,
        action: EVENT_ACTION.CREATE,
        schemaId: String(paymentMethod._id),
        actor: userId,
        description: "/payment/create-payment-method",
      });

      return res.successRes({ data: paymentMethod });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async getAvailablePaymentMethods(req: Request, res: Response) {
    try {
      const paymentMethods: Array<PaymentMethodModelInterface> =
        await this.paymentService.getAvailablePaymentMethod();

      if (!paymentMethods) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.PAYMENT_METHOD,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: req.headers.userId,
        description: "/payment/available-payment-method",
      });

      return res.successRes({ data: paymentMethods });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  buildVNPayParams(
    currency: string,
    vnpOrderInfo: string,
    amount: number,
    paymentMethodName: string
  ): string {
    const date = new Date();
    const createDate = format(date, "yyyyMMddHHmmss");
    const ipAddr = "::1";
    const tmnCode = vnp_TmnCode;
    const secretKey = vnp_HashSecret;
    let vnpUrl = vnp_Url;
    const returnUrl = vnp_ReturnUrl;
    const orderId = format(date, "ddHHmmss");
    const locale = "en";
    const currCode = currency;
    let vnp_Params: any = {};

    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = vnpOrderInfo;

    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params["vnp_BankCode"] = paymentMethodName;

    vnp_Params = sortObject(vnp_Params);

    const signData = QueryString.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + QueryString.stringify(vnp_Params, { encode: false });

    return vnpUrl;
  }

  async createOrderForSubscription(req: Request, res: Response) {
    try {
      const { userId } = req.headers;
      const { method, amount, validTime, currency } = req.body;

      const paymentMethod: PaymentMethodModelInterface =
        await this.paymentService.getPaymentMethodById(method);

      if (!paymentMethod) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.PAYMENT_METHOD_NOT_EXIST);
      }

      const payment: PaymentModelInterface =
        await this.paymentService.createOrderForSubscriptionPlan(
          userId,
          method,
          amount
        );

      if (!payment) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.PAYMENT,
        action: EVENT_ACTION.CREATE,
        schemaId: String(payment._id),
        actor: userId,
        description: "/payment/create-order-for-subscription",
      });

      const vnpUrl = this.buildVNPayParams(
        currency,
        `{userId:${userId},paymentId:${String(
          payment._id
        )},validTime:${validTime}},amount:${amount}`,
        Number(amount),
        paymentMethod.name
      );

      if (!vnpUrl.length) {
        return res.internal({});
      }

      return res.successRes({ data: { vnpUrl, paymentId: payment._id } });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async createOrderForBook(req: Request, res: Response) {
    try {
      const { userId } = req.headers;
      const { method, bookId } = req.body;

      const book: BookModelInterface = await this.bookService.getBookById(
        bookId
      );

      if (!book || (book && book.hidden.isHidden)) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
      }

      const { price } = book;

      if (
        book.purchaser.map((item: any) => String(item.user)).includes(userId)
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_ALR_PURCHASED_BOOK);
      }

      const paymentMethod: PaymentMethodModelInterface =
        await this.paymentService.getPaymentMethodById(method);

      if (!paymentMethod) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.PAYMENT_METHOD_NOT_EXIST);
      }

      const payment: PaymentModelInterface =
        await this.paymentService.createOrderForBook(
          userId,
          method,
          String(price.amount),
          bookId
        );

      if (!payment) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.PAYMENT,
        action: EVENT_ACTION.CREATE,
        schemaId: String(payment._id),
        actor: userId,
        description: "/payment/create-order",
      });

      const date = new Date();
      const createDate = format(date, "yyyyMMddHHmmss");
      const ipAddr = "::1";
      const tmnCode = vnp_TmnCode;
      const secretKey = vnp_HashSecret;
      let vnpUrl = vnp_Url;
      const returnUrl = vnp_ReturnUrl;
      const orderId = format(date, "ddHHmmss");
      const locale = "en";
      const currCode = price.currency;
      let vnp_Params: any = {};

      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      // vnp_Params["vnp_OrderInfo"] = "Payment for order:" + orderId;
      vnp_Params[
        "vnp_OrderInfo"
      ] = `User ${userId} paid for order ${payment._id}`;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = price.amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      vnp_Params["vnp_BankCode"] = paymentMethod.name;

      vnp_Params = sortObject(vnp_Params);

      const signData = QueryString.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + QueryString.stringify(vnp_Params, { encode: false });

      return res.successRes({ data: { vnpUrl, paymentId: payment._id } });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { userId } = req.headers;
      const { paymentId } = req.params;
      const { status, validTime } = req.body;

      const payment: PaymentModelInterface =
        await this.paymentService.updateOrderStatus(paymentId, status, userId);

      if (!payment) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.PAYMENT_NOT_EXIST);
      }

      if (
        payment.paymentFor.paymentType === PAYMENT_TYPE.BOOK &&
        status === PAYMENT_STATUS.SUCCESS
      ) {
        const { bookId } = payment.paymentFor;
        const { amount, currency } = payment;

        const book: BookModelInterface = await this.bookService.addPurchaser(
          String(bookId),
          userId,
          {
            amount: Number(amount),
            currency,
          }
        );

        if (!book) {
          return res.internal({});
        }
      } else if (
        payment.paymentFor.paymentType === PAYMENT_TYPE.SUBSCRIPTION_PLAN &&
        status === PAYMENT_STATUS.SUCCESS
      ) {
        if (!validTime) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.VALID_TIME_REQUIRED);
        }

        const { createdBy } = payment;

        const user: UserModelInterface = await this.userService.getUserById(
          String(createdBy)
        );

        if (!user) {
          return res.internal({});
        }

        const updatedUser: UserModelInterface =
          await this.userService.updateUserSubscriptionPlan(
            String(createdBy),
            validTime
          );

        if (!updatedUser) {
          return res.internal({});
        }
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.PAYMENT,
        action: EVENT_ACTION.UPDATE,
        schemaId: paymentId,
        actor: userId,
        description: "/payment/update-order-status",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async getListPayment(req: Request, res: Response) {
    try {
      const { page, limit, sort, keyword, status, currency, paymentType } =
        req.query;

      const payment = await this.paymentService.getListPayment({
        page: Number(page),
        limit: Number(limit),
        sort,
        keyword: keyword || "",
        filteredBy: {
          status: status || [],
          currency: currency || [],
          paymentType: paymentType || [],
        },
      });

      if (!payment) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.PAYMENT,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: String(req.headers.userId),
        description: "/payment/list",
      });

      return res.successRes({ data: payment });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async getListPaymentForAuthor(req: Request, res: Response) {
    try {
      const { page, limit, sort, keyword, currency } = req.query;
      const { userId, userRole } = req.headers;

      if (userRole !== USER_ROLE.AUTHOR) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.AUTHOR_ONLY);
      }

      const books: Array<BookModelInterface> =
        await this.bookService.getBookListByUserId(userId);

      if (!books) {
        return res.internal({});
      }

      const payment = await this.paymentService.getListPaymentForAuthor(
        books.map((item) => String(item._id)),
        {
          page: Number(page),
          limit: Number(limit),
          sort,
          keyword: keyword || "",
          filteredBy: {
            currency: currency || [],
          },
        }
      );

      if (!payment) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.PAYMENT,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: userId,
        description: "/payment/list-for-author",
      });

      return res.successRes({ data: payment });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default PaymentController;
