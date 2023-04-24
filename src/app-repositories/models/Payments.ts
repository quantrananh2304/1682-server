import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { USER_COLLECTION_NAME } from "./Users";

export const PAYMENT_COLLECTION_NAME = "payments";

export enum PAYMENT_STATUS {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

export enum PAYMENT_TYPE {}

export interface PaymentModelInterface extends BaseModelInterface {
  method: string | Types.ObjectId;
  status: PAYMENT_STATUS;
  amount: string;
}

const paymentModelSchema = new Schema({
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
