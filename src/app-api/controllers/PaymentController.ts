import {
  vnp_HashSecret,
  vnp_ReturnUrl,
  vnp_TmnCode,
  vnp_Url,
} from "@app-configs";
import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { PaymentMethodModelInterface } from "@app-repositories/models/PaymentMethods";
import { PaymentModelInterface } from "@app-repositories/models/Payments";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import PaymentService from "@app-services/PaymentService";
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

  async createOrder(req: Request, res: Response) {
    try {
      const { userId } = req.headers;
      const { amount, method } = req.body;

      const paymentMethod: PaymentMethodModelInterface =
        await this.paymentService.getPaymentMethodById(method);

      if (!paymentMethod) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.PAYMENT_METHOD_NOT_EXIST);
      }

      const payment: PaymentModelInterface =
        await this.paymentService.createOrder(userId, method, amount);

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
      const currCode = "VND";
      let vnp_Params: any = {};

      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = "Payment for order:" + orderId;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = amount * 100;
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

      return res.successRes({ data: vnpUrl });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default PaymentController;
