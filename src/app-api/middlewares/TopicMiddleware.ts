import { GET_LIST_TOPIC_SORT } from "@app-services/interface";
import CONSTANTS from "@app-utils/Constants";
import { body, query } from "express-validator";

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
};

export default TopicMiddleware;
