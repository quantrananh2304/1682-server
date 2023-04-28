import { BOOK_CURRENCY } from "@app-repositories/models/Books";
import {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
} from "@app-repositories/models/Payments";
import { GET_LIST_PAYMENT_SORT } from "@app-services/interface";
import CONSTANTS from "@app-utils/Constants";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "mongoose";

const PaymentMiddleware = {
  createPaymentMethod: [
    body("name")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("note")
      .exists({ checkFalsy: false, checkNull: true })
      .isString()
      .isLength({ min: 0, max: 255 }),
  ],

  createOrderForBook: [
    body("method")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((method) => isValidObjectId(method))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("bookId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((bookId) => isValidObjectId(bookId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),
  ],

  createOrderForSubscriptionPlan: [
    body("method")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((method) => isValidObjectId(method))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("amount")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((amount) => Number(amount) && Number(amount) >= 10000)
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.AMOUNT_INVALID),

    body("validTime")
      .exists({ checkFalsy: true, checkNull: true })
      .isNumeric()
      .custom((validTime) => validTime >= 1)
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.VALID_TIME_INVALID),

    body("currency")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((currency) => BOOK_CURRENCY[currency])
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.CURRENCY_INVALID),
  ],

  updateOrderStatus: [
    param("paymentId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((paymentId) => isValidObjectId(paymentId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("status")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((status) => PAYMENT_STATUS[status])
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.PAYMENT_STATUS_INVALID),
  ],

  getListPayment: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_PAYMENT_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),

    query("status").custom((status) => {
      if (!status) {
        return true;
      }

      if (Array.isArray(status)) {
        if (!status.length) {
          return true;
        } else {
          return status.every((item) => PAYMENT_STATUS[item]);
        }
      }

      return false;
    }),

    query("currency").custom((currency) => {
      if (!currency) {
        return true;
      }

      if (Array.isArray(currency)) {
        if (!currency.length) {
          return true;
        } else {
          return currency.every((item) => BOOK_CURRENCY[item]);
        }
      }

      return false;
    }),

    query("paymentType").custom((paymentType) => {
      if (!paymentType) {
        return true;
      }

      if (Array.isArray(paymentType)) {
        if (!paymentType.length) {
          return true;
        } else {
          return paymentType.every((item) => PAYMENT_TYPE[item]);
        }
      }

      return false;
    }),
  ],

  getListPaymentForAuthor: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_PAYMENT_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),

    query("currency").custom((currency) => {
      if (!currency) {
        return true;
      }

      if (Array.isArray(currency)) {
        if (!currency.length) {
          return true;
        } else {
          return currency.every((item) => BOOK_CURRENCY[item]);
        }
      }

      return false;
    }),
  ],
};

export default PaymentMiddleware;
