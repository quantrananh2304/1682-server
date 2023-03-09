import { body } from "express-validator";
import _ = require("lodash");

const PostMiddleware = {
  create: [
    body("content").exists({ checkFalsy: true, checkNull: true }).isString(),

    body("images")
      .exists({})
      .isArray({ min: 0 })
      .custom((images: Array<any>) => images.every((item) => _.isString(item))),
  ],
};

export default PostMiddleware;
