import { body, query } from "express-validator";
import { isValidObjectId } from "mongoose";
import _ = require("lodash");
import CONSTANTS from "@app-utils/Constants";
import { GET_LIST_BOOK_SORT } from "@app-services/interface";

const BookMiddleware = {
  create: [
    body("title")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("topics")
      .exists({ checkFalsy: true, checkNull: true })
      .isArray({ min: 1 })
      .custom((topics: Array<string>) =>
        topics.every((item) => isValidObjectId(item) && _.isString(item))
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("chapters")
      .exists({ checkFalsy: true, checkNull: true })
      .isArray({ min: 1 })
      .custom((chapters: Array<{ name: string; content: string }>) =>
        chapters.every(
          (item) => item.name && item.content && item.name.length <= 50
        )
      ),
  ],

  getListBook: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_BOOK_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),
  ],
};

export default BookMiddleware;
