import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { EVENT_SCHEMA } from "./Events";
import { USER_COLLECTION_NAME } from "./Users";

export const NOTIFICATION_COLLECTION_NAME = "notifications";

export enum NOTIFICATION_TYPE {
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
  COMMENT = "COMMENT",
  VIEW = "VIEW",
  FOLLOW = "FOLLOW",
}

export interface NotificationModelInterface extends BaseModelInterface {
  content: string;
  schema: EVENT_SCHEMA;
  schemaId: Types.ObjectId | string;
  read: boolean;
  receiver: Types.ObjectId | string;
  notiType: NOTIFICATION_TYPE;
}

const notificationSchema = new Schema({
  content: {
    type: String,
    required: true,
    default: "",
  },

  schema: {
    type: EVENT_SCHEMA,
    required: true,
  },

  schemaId: {
    type: Types.ObjectId,
    required: true,
  },

  read: {
    type: Boolean,
    required: true,
    default: false,
  },

  receiver: {
    type: Types.ObjectId,
    required: true,
    ref: USER_COLLECTION_NAME,
  },

  notiType: {
    type: {
      NOTIFICATION_TYPE,
      required: true,
    },
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
    type: Types.ObjectId,
    ref: "users",
  },

  createdBy: {
    type: Types.ObjectId,
    ref: "users",
  },
});

export default model<NotificationModelInterface>(
  NOTIFICATION_COLLECTION_NAME,
  notificationSchema
);
