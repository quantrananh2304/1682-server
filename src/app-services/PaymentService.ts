import { inject, injectable } from "inversify";
import { GET_LIST_PAYMENT_SORT, IPaymentService } from "./interface";
import PaymentMethods, {
  PAYMENT_METHOD_STATUS,
  PaymentMethodModelInterface,
} from "@app-repositories/models/PaymentMethods";
import { Types } from "mongoose";
import Payments, {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  PaymentModelInterface,
} from "@app-repositories/models/Payments";
import {
  BOOK_CURRENCY,
  BookModelInterface,
} from "@app-repositories/models/Books";
import TYPES from "@app-repositories/types";
import BookService from "./BookService";

@injectable()
class PaymentService implements IPaymentService {
  @inject(TYPES.BookService) private readonly bookService: BookService;

  async createPaymentMethod(
    userId: string,
    name: string,
    note: string
  ): Promise<PaymentMethodModelInterface> {
    const paymentMethod: PaymentMethodModelInterface =
      await PaymentMethods.create({
        name,
        note,
        status: PAYMENT_METHOD_STATUS.ACTIVE,
        discount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: Types.ObjectId(userId),
      });

    return paymentMethod;
  }

  async getPaymentMethod(): Promise<PaymentMethodModelInterface[]> {
    const paymentMethods: Array<PaymentMethodModelInterface> =
      await PaymentMethods.find({}).lean();

    return paymentMethods;
  }

  async getPaymentMethodByName(
    name: string
  ): Promise<PaymentMethodModelInterface> {
    const paymentMethod: PaymentMethodModelInterface =
      await PaymentMethods.findOne({ name });

    return paymentMethod;
  }

  async getAvailablePaymentMethod(): Promise<PaymentMethodModelInterface[]> {
    const paymentMethods: Array<PaymentMethodModelInterface> =
      await PaymentMethods.find({
        status: PAYMENT_METHOD_STATUS.ACTIVE,
      }).lean();

    return paymentMethods;
  }

  async createOrderForBook(
    userId: string,
    method: string,
    amount: string,
    bookId: string
  ): Promise<PaymentModelInterface> {
    const payment: PaymentModelInterface = await Payments.create({
      method: Types.ObjectId(method),
      amount,
      status: PAYMENT_STATUS.PENDING,
      createdBy: Types.ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: Types.ObjectId(userId),
      paymentFor: {
        paymentType: PAYMENT_TYPE.BOOK,
        bookId: Types.ObjectId(bookId),
      },
    });

    return payment;
  }

  async createOrderForSubscriptionPlan(
    userId: string,
    method: string,
    amount: string
  ): Promise<PaymentModelInterface> {
    const payment: PaymentModelInterface = await Payments.create({
      method: Types.ObjectId(method),
      amount,
      status: PAYMENT_STATUS.PENDING,
      createdBy: Types.ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: Types.ObjectId(userId),
      paymentFor: {
        paymentType: PAYMENT_TYPE.SUBSCRIPTION_PLAN,
        bookId: null,
      },
    });

    return payment;
  }

  async getPaymentMethodById(
    paymentMethodId: string
  ): Promise<PaymentMethodModelInterface> {
    const paymentMethod: PaymentMethodModelInterface =
      await PaymentMethods.findById(paymentMethodId).lean();

    return paymentMethod;
  }

  async updateOrderStatus(
    paymentId: string,
    status: PAYMENT_STATUS,
    userId: string
  ): Promise<PaymentModelInterface> {
    const payment: PaymentModelInterface = await Payments.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          status,
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(userId),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return payment;
  }

  async getListPayment(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_PAYMENT_SORT;
    keyword: string;
    filteredBy: {
      status: PAYMENT_STATUS[];
      currency: BOOK_CURRENCY[];
      paymentType: PAYMENT_TYPE[];
    };
  }): Promise<{
    total: number;
    page: number;
    payments: any[];
    totalPage: number;
  }> {
    const { page, limit, keyword, filteredBy } = filter;

    // const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_PAYMENT_SORT.AMOUNT_ASC:
        sort = { amount: 1 };
        break;

      case GET_LIST_PAYMENT_SORT.AMOUNT_DESC:
        sort = { amount: -1 };
        break;

      case GET_LIST_PAYMENT_SORT.DATE_CREATED_ASC:
        sort = { createdAt: 1 };
        break;

      case GET_LIST_PAYMENT_SORT.DATE_CREATED_DESC:
        sort = { createdAt: -1 };
        break;

      default:
        break;
    }

    const matcher: any = {};

    if (filteredBy.currency && filteredBy.currency.length) {
      matcher.$and = [
        {
          currency: {
            $in: filteredBy.currency,
          },
        },
      ];
    }

    if (filteredBy.paymentType && filteredBy.paymentType.length) {
      if (matcher.$and) {
        matcher.$and.push({
          "paymentFor.paymentType": {
            $in: filteredBy.paymentType,
          },
        });
      } else {
        matcher.$and = [
          {
            "paymentFor.paymentType": {
              $in: filteredBy.paymentType,
            },
          },
        ];
      }
    }

    if (filteredBy.status && filteredBy.status.length) {
      if (matcher.$and) {
        matcher.$and.push({
          status: {
            $in: filteredBy.status,
          },
        });
      } else {
        matcher.$and = [
          {
            status: {
              $in: filteredBy.status,
            },
          },
        ];
      }
    }

    const payments: Array<any> = await Payments.find(matcher)
      .populate({ path: "method", select: "-_v -updatedBy" })
      .populate({ path: "createdBy", select: "_id firstName lastName avatar" })
      .sort(sort)
      .lean();

    const handlePopulateArray = (arr: any) => {
      const promises = arr.map(async (item: any) => {
        if (item.paymentFor) {
          const { paymentType, bookId } = item.paymentFor;

          if (paymentType === PAYMENT_TYPE.BOOK && bookId) {
            const book: BookModelInterface = await this.bookService.getBookById(
              String(bookId)
            );

            return {
              ...item,
              paymentFor: { ...item.paymentFor, bookId: book },
            };
          } else {
            return item;
          }
        } else {
          return item;
        }
      });

      return Promise.all(promises);
    };

    const modifiedPayment = await handlePopulateArray(payments);

    const matchedPayment = modifiedPayment.filter((item: any) => {
      const { paymentFor } = item;

      if (!paymentFor.bookId) {
        return true;
      } else {
        return (
          item.paymentFor.bookId.title.includes(keyword) ||
          (item.createdBy.firstName + " " + item.createdBy.lastName).includes(
            keyword
          )
        );
      }
    });

    return {
      payments: matchedPayment.slice(
        (page - 1) * limit,
        (page - 1) * limit + limit
      ),
      total: matchedPayment.length,
      page: page,
      totalPage:
        matchedPayment.length % limit === 0
          ? matchedPayment.length / limit
          : Math.floor(matchedPayment.length / limit) + 1,
    };
  }

  async getListPaymentForAuthor(
    bookIds: string[],
    filter: {
      page: number;
      limit: number;
      sort: GET_LIST_PAYMENT_SORT;
      keyword: string;
      filteredBy: {
        currency: BOOK_CURRENCY[];
      };
    }
  ): Promise<{
    total: number;
    page: number;
    payments: any[];
    totalPage: number;
  }> {
    const { page, limit, keyword, filteredBy } = filter;

    // const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_PAYMENT_SORT.AMOUNT_ASC:
        sort = { amount: 1 };
        break;

      case GET_LIST_PAYMENT_SORT.AMOUNT_DESC:
        sort = { amount: -1 };
        break;

      case GET_LIST_PAYMENT_SORT.DATE_CREATED_ASC:
        sort = { createdAt: 1 };
        break;

      case GET_LIST_PAYMENT_SORT.DATE_CREATED_DESC:
        sort = { createdAt: -1 };
        break;

      default:
        break;
    }

    const matcher: any = {
      $and: [
        {
          "paymentFor.paymentType": PAYMENT_TYPE.BOOK,
          "paymentFor.bookId": {
            $in: bookIds.map((item) => Types.ObjectId(item)),
          },
          status: PAYMENT_STATUS.SUCCESS,
        },
      ],
    };

    if (filteredBy.currency && filteredBy.currency.length) {
      matcher.$and.push({
        currency: {
          $in: filteredBy.currency,
        },
      });
    }

    const payments: Array<any> = await Payments.find(matcher)
      .populate({ path: "method", select: "-_v -updatedBy" })
      .populate({ path: "createdBy", select: "_id firstName lastName avatar" })
      .sort(sort)
      .lean();

    const handlePopulateArray = (arr: any) => {
      const promises = arr.map(async (item: any) => {
        const book: BookModelInterface = await this.bookService.getBookById(
          String(item.paymentFor.bookId)
        );

        return {
          ...item,
          paymentFor: { ...item.paymentFor, bookId: book },
        };
      });

      return Promise.all(promises);
    };

    const modifiedPayment = await handlePopulateArray(payments);

    const matchedPayment = modifiedPayment.filter((item: any) => {
      return (
        item.paymentFor.bookId.title.includes(keyword) ||
        (item.createdBy.firstName + " " + item.createdBy.lastName).includes(
          keyword
        )
      );
    });

    return {
      payments: matchedPayment.slice(
        (page - 1) * limit,
        (page - 1) * limit + limit
      ),
      total: matchedPayment.length,
      page: page,
      totalPage:
        matchedPayment.length % limit === 0
          ? matchedPayment.length / limit
          : Math.floor(matchedPayment.length / limit) + 1,
    };
  }
}

export default PaymentService;
