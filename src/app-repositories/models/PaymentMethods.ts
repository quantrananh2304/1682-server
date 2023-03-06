import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { USER_COLLECTION_NAME } from "./Users";

export const PAYMENT_METHOD_COLLECTION_NAME = "paymentmethods";

export enum PAYMENT_METHOD_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface PaymentMethodModelInterface extends BaseModelInterface {
  name: string;
  note: string;
  status: PAYMENT_METHOD_STATUS;
  discount: number;
}

const paymentMethodSchema = new Schema({
  name: {
    type: String,
    required: true,
    default: "",
  },

  note: {
    type: String,
    required: true,
    default: "",
  },

  status: {
    type: PAYMENT_METHOD_STATUS,
    required: true,
    default: PAYMENT_METHOD_STATUS.ACTIVE,
  },

  discount: {
    type: Number,
    required: true,
    default: 0,
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

export default model<PaymentMethodModelInterface>(
  PAYMENT_METHOD_COLLECTION_NAME,
  paymentMethodSchema
);
