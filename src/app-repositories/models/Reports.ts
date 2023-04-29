import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { USER_COLLECTION_NAME } from "./Users";

export const REPORT_COLLECTION_NAME = "reports";

export enum REPORT_TYPE {
  REPORT = "REPORT",
  FEEDBACK = "FEEDBACK",
  REGISTER_FOR_AUTHOR = "REPORT_FOR_AUTHOR",
}

export enum REPORT_SCHEMA {
  books = "books",
  posts = "posts",
  users = "users",
}

export enum REPORT_STATUS {
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface ReportModelInterface extends BaseModelInterface {
  title: string;
  content: string;
  type: REPORT_TYPE;
  schema: REPORT_SCHEMA;
  schemaId: string | Types.ObjectId;
  status: REPORT_STATUS;
}

const reportSchema = new Schema({
  title: {
    type: String,
    required: true,
    default: "",
  },

  content: {
    type: String,
    required: true,
    default: "",
  },

  type: {
    type: REPORT_TYPE,
    required: true,
  },

  schema: {
    type: REPORT_SCHEMA,
    required: true,
  },

  schemaId: {
    type: Types.ObjectId,
    refPath: "schema",
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
    ref: USER_COLLECTION_NAME,
  },

  createdBy: {
    type: Types.ObjectId,
    ref: USER_COLLECTION_NAME,
  },

  status: {
    type: REPORT_STATUS,
    required: true,
    default: REPORT_STATUS.PENDING,
  },
});

export default model<ReportModelInterface>(
  REPORT_COLLECTION_NAME,
  reportSchema
);
