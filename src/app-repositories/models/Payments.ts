import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { USER_COLLECTION_NAME } from "./Users";
import { BOOK_COLLECTION_NAME, BOOK_CURRENCY } from "./Books";

export const PAYMENT_COLLECTION_NAME = "payments";

export enum PAYMENT_STATUS {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

export enum PAYMENT_TYPE {
  BOOK = "BOOK",
  SUBSCRIPTION_PLAN = "SUBSCRIPTION_PLAN",
}

export interface PaymentModelInterface extends BaseModelInterface {
  method: string | Types.ObjectId;
  status: PAYMENT_STATUS;
  amount: string;
  paymentFor: { paymentType: PAYMENT_TYPE; bookId: string | Types.ObjectId };
  currency: BOOK_CURRENCY;
}

const paymentModelSchema = new Schema({
  paymentFor: {
    type: {
      paymentType: PAYMENT_TYPE,
      bookId: { type: Types.ObjectId, ref: BOOK_COLLECTION_NAME },
    },
  },

  method: {
    type: Types.ObjectId,
    required: true,
    ref: "paymentmethods",
  },

  amount: {
    type: String,
    required: true,
    default: "0",
  },

  currency: {
    type: BOOK_CURRENCY,
    required: true,
    default: BOOK_CURRENCY.VND,
  },

  status: {
    type: PAYMENT_STATUS,
    required: true,
    default: PAYMENT_STATUS.PENDING,
  },

  createdBy: {
    type: Types.ObjectId,
    ref: USER_COLLECTION_NAME,
  },

  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },

  updatedAt: {
    type: Date,
    required: true,
    default: new Date(),
  },

  updatedBy: {
    type: Types.ObjectId && String,
    ref: USER_COLLECTION_NAME,
  },
});

export default model<PaymentModelInterface>(
  PAYMENT_COLLECTION_NAME,
  paymentModelSchema
);
