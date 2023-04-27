import { body, param, query } from "express-validator";
import { isValidObjectId } from "mongoose";
import _ = require("lodash");
import CONSTANTS from "@app-utils/Constants";
import { GET_LIST_BOOK_SORT } from "@app-services/interface";
import { isBefore } from "date-fns";

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

    body("price")
      .exists({ checkFalsy: true, checkNull: true })
      .isNumeric()
      .custom((price) => price >= 10000)
      .withMessage(
        CONSTANTS.VALIDATION_MESSAGE.BOOK_PRICE_MINIMUM.replace(
          "${MINIMUM_PRICE}",
          String(CONSTANTS.MINIMUM_PRICE)
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

    query("topics").custom((topics) => {
      if (!topics) {
        return true;
      }

      if (Array.isArray(topics)) {
        if (!topics.length) {
          return true;
        } else {
          return topics.every((item) => isValidObjectId(item));
        }
      }

      return false;
    }),
  ],

  hide: [
    param("bookId")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((bookId: string) => isValidObjectId(bookId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("hiddenUntil")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom(
        (hiddenUntil: string) =>
          !isNaN(Date.parse(hiddenUntil)) &&
          isBefore(new Date(), new Date(hiddenUntil))
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.DATE_FORMAT_NOT_VALID),
  ],

  comment: [
    param("bookId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((postId: string) => isValidObjectId(postId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("content").exists({ checkFalsy: true, checkNull: true }).isString(),
  ],

  editComment: [
    param("bookId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((bookId: string) => isValidObjectId(bookId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    param("commentId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((commentId: string) => isValidObjectId(commentId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("content").exists({ checkFalsy: true, checkNull: true }).isString(),
  ],

  deleteComment: [
    param("bookId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((bookId: string) => isValidObjectId(bookId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    param("commentId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((commentId: string) => isValidObjectId(commentId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),
  ],

  likeDislikeBook: [
    param("bookId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((bookId: string) => isValidObjectId(bookId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    param("action")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((action: string) => action === "like" || action === "dislike")
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.ACTION_INVALID),
  ],

  viewBook: [
    param("bookId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((bookId: string) => isValidObjectId(bookId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),
  ],

  getDetail: [
    query("bookId")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((bookId: string) => isValidObjectId(bookId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),
  ],
};

export default BookMiddleware;
