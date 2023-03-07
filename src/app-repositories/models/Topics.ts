import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";

export const TOPIC_COLLECTION_NAME = "topics";

export interface TopicModelInterface extends BaseModelInterface {
  name: string;
  note: string;
}

const topicSchema = new Schema({
  name: {
    type: String,
    default: "",
    required: true,
  },

  note: {
    type: String,
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
    ref: "users",
  },
});

export default model<TopicModelInterface>(TOPIC_COLLECTION_NAME, topicSchema);
