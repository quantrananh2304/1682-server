import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { USER_COLLECTION_NAME, UserModelInterface } from "./Users";

export const POST_COLLECTION_NAME = "posts";

export interface PostModelInterface extends BaseModelInterface {
  content: string;
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
  editHistory: Array<{ content: string; createdAt: Date }>;
  images: Array<string>;
  hidden: {
    isHidden: Boolean;
    hiddenBy: string | Types.ObjectId;
    hiddenUntil: Date;
  };
}

const postSchema = new Schema({
  content: {
    type: String,
    required: true,
  },

  like: {
    type: [
      {
        user: {
          type: Types.ObjectId,
          ref: USER_COLLECTION_NAME,
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
          ref: USER_COLLECTION_NAME,
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
          ref: USER_COLLECTION_NAME,
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
          ref: USER_COLLECTION_NAME,
        },
        editHistory: {
          type: [
            {
              content: String,
              createdAt: Date,
            },
          ],
          default: [],
        },
      },
    ],
    default: [],
  },

  editHistory: {
    type: [
      {
        content: String,
        createdAt: Date,
      },
    ],
    default: [],
    _id: false,
  },

  images: [
    {
      type: String,
      default: [],
    },
  ],

  createdAt: {
    type: Date,
    default: new Date(),
    required: true,
  },

  updatedAt: {
    type: Date,
    default: new Date(),
    required: true,
  },

  createdBy: {
    type: Types.ObjectId,
    required: true,
    ref: USER_COLLECTION_NAME,
  },

  updatedBy: {
    type: Types.ObjectId,
    required: true,
    ref: USER_COLLECTION_NAME,
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
});

export default model<PostModelInterface>(POST_COLLECTION_NAME, postSchema);
