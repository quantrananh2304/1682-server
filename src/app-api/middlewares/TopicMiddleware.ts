import { body } from "express-validator";

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
};

export default TopicMiddleware;
