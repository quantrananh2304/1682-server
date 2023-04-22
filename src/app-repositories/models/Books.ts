import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { TOPIC_COLLECTION_NAME } from "./Topics";
import { UserModelInterface } from "./Users";

export const BOOK_COLLECTION_NAME = "books";

export interface BookModelInterface extends BaseModelInterface {
  title: string;
  chapters: Array<{
    _id: string | Types.ObjectId;
    name: string;
    content: string;
    createdAt: Date;
  }>;
  like: Array<{
    user: string | Types.ObjectId;
    createdAt: Date;
  }>;
  dislike: Array<{
    user: string | Types.ObjectId;
    createdAt: Date;
  }>;
  views: Array<{
    user: string | Types.ObjectId;
    createdAt: Date;
  }>;
  comments: Array<{
    _id: string | Types.ObjectId;
    content: string;
    createdBy: string | Types.ObjectId | UserModelInterface;
    createdAt: Date;
    editHistory: Array<{
      content: string;
      createdAt: Date;
    }>;
  }>;
  topics: Array<string | Types.ObjectId | any>;
  subscribedUsers: Array<{
    user: string | Types.ObjectId;
    createdAt: Date;
  }>;
  hidden: {
    isHidden: Boolean;
    hiddenBy: string | Types.ObjectId;
    hiddenUntil: Date;
  };
}

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
    default: "",
  },

  chapters: {
    type: [
      {
        name: String,
        content: String,
        createdAt: Date,
      },
    ],
    default: [],
  },

  like: {
    type: [
      {
        user: {
          type: Types.ObjectId,
          ref: "users",
        },
        createdAt: Date,
      },
    ],
    default: [],
    _id: false,
  },

  dislike: {
    type: [
      {
        user: {
          type: Types.ObjectId,
          ref: "users",
        },
        createdAt: Date,
      },
    ],
    default: [],
    _id: false,
  },

  views: {
    type: [
      {
        user: {
          type: Types.ObjectId,
          ref: "users",
        },
        createdAt: Date,
      },
    ],
    default: [],
    _id: false,
  },

  comments: {
    type: [
      {
        content: String,
        createdAt: Date,
        createdBy: {
          type: Types.ObjectId,
          ref: "users",
        },
        editHistory: {
          type: [
            {
              content: String,
              updatedAt: Date,
              createdAt: Date,
            },
          ],
          default: [],
        },
      },
    ],
    default: [],
  },

  topics: [
    {
      type: Types.ObjectId,
      ref: TOPIC_COLLECTION_NAME,
      default: [],
      _id: false,
    },
  ],

  subscribedUsers: {
    type: [
      {
        user: {
          type: Types.ObjectId,
          ref: "users",
        },
        createdAt: Date,
      },
    ],
    default: [],
    _id: false,
  },

  hidden: {
    type: {
      isHidden: Boolean,
      hiddenBy: Types.ObjectId,
      hiddenUntil: Date,
    },
    default: { isHidden: false, hiddenBy: null, hiddenUntil: null },
    required: true,
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

export default model<BookModelInterface>(BOOK_COLLECTION_NAME, bookSchema);
