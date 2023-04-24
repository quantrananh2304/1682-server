import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";

export const EVENT_COLLECTION_NAME = "events";

export enum EVENT_SCHEMA {
  USER = "USER",
  TOPIC = "TOPIC",
  BOOK = "BOOK",
  REPORT = "REPORT",
  POST = "POST",
  PAYMENT_METHOD = "PAYMENT_METHOD",
  PAYMENT = "PAYMENT",
}

export enum EVENT_ACTION {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export interface EventModelInterface extends BaseModelInterface {
  schema: EVENT_SCHEMA;
  action: EVENT_ACTION;
  schemaId: string | Types.ObjectId;
  actor: string | Types.ObjectId | null;
  description: string;
}

const eventSchema = new Schema({
  schema: {
    type: EVENT_SCHEMA,
    required: true,
  },
  action: {
    type: EVENT_ACTION,
    required: true,
  },
  schemaId: {
    type: String && Types.ObjectId,
    required: false,
  },
  actor: {
    type: String && Types.ObjectId,
    ref: "users",
    default: null,
  },
  description: {
    type: String,
    required: true,
    default: "",
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

export default model<EventModelInterface>(EVENT_COLLECTION_NAME, eventSchema);
