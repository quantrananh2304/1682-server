import { Schema, Types, model } from "mongoose";
import { BaseModelInterface } from "./BaseModelInterface";
import { BOOK_COLLECTION_NAME } from "./Books";

export const USER_COLLECTION_NAME = "users";

export enum USER_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED",
  LOCKED = "LOCKED",
}

export enum USER_GENDER {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum USER_ROLE {
  ADMIN = "ADMIN",
  AUTHOR = "AUTHOR",
  USER = "USER",
}

export interface UserModelInterface extends BaseModelInterface {
  firstName: string;
  lastName: string;
  email: string;
  avatar: { name: string; url: string; contentType: string };
  password: string;
  status: USER_STATUS;
  role: USER_ROLE;
  address: string;
  dob: Date;
  phoneNumber: string;
  gender: USER_GENDER | string;
  favorites: Array<{ book: string | Types.ObjectId; createdAt: Date }>;
  following: Array<{ user: string | Types.ObjectId; createdAt: Date }>;
  followers: Array<{ user: string | Types.ObjectId; createdAt: Date }>;
  resetPasswordCode: string;
  warning: Array<{ message: string; createdAt: Date }>;
  messages: Array<{
    receiver: string | Types.ObjectId;
    messages: Array<{
      from: string | Types.ObjectId;
      content: string;
      createdAt: Date;
    }>;
  }>;
}

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    default: "",
  },

  lastName: {
    type: String,
    required: true,
    default: "",
  },

  username: {
    type: String,
    default: "",
  },

  email: {
    type: String,
    required: true,
    default: "",
  },

  avatar: {
    type: {
      name: String,
      url: String,
      contentType: String,
    },
    default: {},
  },

  password: {
    type: String,
    required: true,
    default: "",
  },

  status: {
    type: USER_STATUS,
    required: true,
    default: USER_STATUS.ACTIVE,
  },

  role: {
    type: USER_ROLE,
    required: true,
    default: USER_ROLE.USER,
  },

  address: {
    type: String,
    default: "",
  },

  dob: {
    type: Date,
    required: true,
    default: new Date(),
  },

  phoneNumber: {
    type: String,
    required: true,
    default: "",
  },

  gender: {
    type: USER_GENDER && String,
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

  favorites: {
    type: [
      {
        book: {
          type: Types.ObjectId,
          ref: BOOK_COLLECTION_NAME,
        },
        createdAt: Date,
      },
    ],
    default: [],
    _id: false,
  },

  following: {
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

  followers: {
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

  resetPasswordCode: {
    type: String,
    default: "",
  },

  warning: {
    type: [
      {
        message: String,
        createdAt: Date,
        createdBy: {
          type: Types.ObjectId,
          ref: "users",
        },
      },
    ],
    default: [],
  },

  messages: {
    type: [
      {
        receiver: {
          type: Types.ObjectId,
          ref: "users",
        },
        messages: {
          type: [
            {
              content: String,
              from: {
                type: Types.ObjectId,
                ref: "users",
              },
              createdAt: Date,
            },
          ],
        },
      },
    ],
    default: [],
  },
});

export default model<UserModelInterface>(USER_COLLECTION_NAME, userSchema);
