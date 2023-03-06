import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { USER_COLLECTION_NAME } from "./Users";

export const REPORT_COLLECTION_NAME = "reports";

export enum REPORT_TYPE {
  REPORT = "REPORT",
  FEEDBACK = "FEEDBACK",
}

export enum REPORT_SCHEMA {
  BOOKS = "BOOKS",
  POSTS = "POSTS",
  TOPICS = "TOPICS",
  USERS = "USERS",
}

export interface ReportModelInterface extends BaseModelInterface {
  title: string;
  content: string;
  type: REPORT_TYPE;
  schema: REPORT_SCHEMA;
  schemaId: string | Types.ObjectId;
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
    type: Types.ObjectId && String,
    ref: USER_COLLECTION_NAME,
  },
});

export default model<ReportModelInterface>(
  REPORT_COLLECTION_NAME,
  reportSchema
);
