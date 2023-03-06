import { Types } from "mongoose";

export interface BaseModelInterface {
  _id: string | Types.ObjectId;
  createdAt: Date;
  createdBy?: string | Types.ObjectId;
  updatedAt: Date;
  updatedBy?: string | Types.ObjectId;
}
