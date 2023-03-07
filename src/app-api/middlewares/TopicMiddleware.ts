import { GET_LIST_TOPIC_SORT } from "@app-services/interface";
import CONSTANTS from "@app-utils/Constants";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "mongoose";

const TopicMiddleware = {
  create: [
    body("name")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ min: 1, max: 50 }),

    body("note")
      .exists({ checkNull: true })
      .isString()
      .isLength({ min: 0, max: 50 }),
  ],

  getListTopic: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_TOPIC_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),
  ],

  updateTopic: [
    param("topicId")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((topicId: string) => isValidObjectId(topicId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("name")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ min: 1, max: 50 }),

    body("note")
      .exists({ checkNull: true })
      .isString()
      .isLength({ min: 0, max: 50 }),
  ],
};

export default TopicMiddleware;
