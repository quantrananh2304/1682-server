import { GET_LIST_POST_SORT } from "@app-services/interface";
import CONSTANTS from "@app-utils/Constants";
import { body, param, query } from "express-validator";
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

  getListPost: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_POST_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),
  ],

  comment: [
    param("postId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((postId: string) => isValidObjectId(postId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("content").exists({ checkFalsy: true, checkNull: true }).isString(),
  ],
};

export default PostMiddleware;
