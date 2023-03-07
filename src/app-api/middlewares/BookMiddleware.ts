import { body } from "express-validator";
import { isValidObjectId } from "mongoose";
import _ = require("lodash");
import CONSTANTS from "@app-utils/Constants";

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
};

export default BookMiddleware;
