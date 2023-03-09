import CONSTANTS from "@app-utils/Constants";
import { body, param } from "express-validator";
import _ = require("lodash");
import { isValidObjectId } from "mongoose";

const PostMiddleware = {
  create: [
    body("content").exists({ checkFalsy: true, checkNull: true }).isString(),

    body("images")
      .exists({})
      .isArray({ min: 0 })
      .custom((images: Array<any>) => images.every((item) => _.isString(item))),
  ],

  update: [
    param("postId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((postId: string) => isValidObjectId(postId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("content").exists({ checkFalsy: true, checkNull: true }).isString(),

    body("images")
      .exists({})
      .isArray({ min: 0 })
      .custom((images: Array<any>) => images.every((item) => _.isString(item))),
  ],
};

export default PostMiddleware;
