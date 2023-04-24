import CONSTANTS from "@app-utils/Constants";
import { body } from "express-validator";
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

  createOrder: [
    body("amount")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((amount) => Number(amount))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.AMOUNT_INVALID),

    body("method")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((method) => isValidObjectId(method))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),
  ],
};

export default PaymentMiddleware;
