import CONSTANTS from "@app-utils/Constants";
import { param } from "express-validator";
import { isValidObjectId } from "mongoose";

const NotificationMiddleware = {
  markAsRead: [
    param("notificationId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((notificationId) => isValidObjectId(notificationId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),
  ],
};

export default NotificationMiddleware;
