import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { USER_COLLECTION_NAME } from "./Users";

export const SUBSCRIPTION_COLLECTION_NAME = "subscriptions";

export enum SUBSCRIPTION_PLAN {
  BASIC = "BASIC",
  AUTHOR = "AUTHOR",
  PREMIUM = "PREMIUM",
}

export interface SubscriptionModelInterface extends BaseModelInterface {
  user: string | Types.ObjectId;
  type: SUBSCRIPTION_PLAN;
  length: number;
  cost: string;
}

const subscriptionSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: USER_COLLECTION_NAME,
    required: true,
  },

  type: {
    type: SUBSCRIPTION_PLAN,
    required: true,
    default: SUBSCRIPTION_PLAN.BASIC,
  },

  length: {
    type: Number,
    required: true,
    default: 1,
  },

  cost: {
    type: String,
    required: true,
    default: "",
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

export default model<SubscriptionModelInterface>(
  SUBSCRIPTION_COLLECTION_NAME,
  subscriptionSchema
);
