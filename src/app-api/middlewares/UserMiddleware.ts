import { GET_LIST_USER_SORT } from "@app-services/interface";
import CONSTANTS from "@app-utils/Constants";
import { body, param, query } from "express-validator";
import { isValidObjectId } from "mongoose";

const UserMiddleware = {
  register: [
    body("firstName")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("lastName")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("username")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("email")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((email: string) => {
        if (email.length > 50) {
          return false;
        }

        return new RegExp(
          /^[a-z0-9-](\.?-?_?[a-z0-9]){5,}@(gmail\.com)?(fpt\.edu\.vn)?$/
        ).test(email);
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.EMAIL_FORMAT_NOT_VALID),

    body("address")
      .exists({ checkNull: true })
      .isString()
      .isLength({ max: 255 }),

    body("dob")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((dob: string) => !isNaN(Date.parse(dob)))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.DATE_FORMAT_NOT_VALID),

    body("phoneNumber")
      .exists({ checkFalsy: true, checkNull: true })
      .isString(),

    body("gender").exists({ checkFalsy: true, checkNull: true }).isString(),

    body("password")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({
        min: CONSTANTS.PASSWORD_MIN_LENGTH,
        max: CONSTANTS.PASSWORD_MAX_LENGTH,
      })
      .custom((newPassword: string) =>
        new RegExp(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d#@$!%*?&()]{8,16}$/
        ).test(newPassword)
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.PASSWORD_NOT_VALID),

    body("confirmPassword")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom(
        (confirmPassword: string, { req }) =>
          confirmPassword === req.body.password
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.CONFIRM_PASSWORD_DIFFERENT),
  ],

  changePassword: [
    param("userId")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((userId: string) => isValidObjectId(userId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("oldPassword")
      .exists({ checkFalsy: true, checkNull: true })
      .isString(),

    body("newPassword")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({
        min: CONSTANTS.PASSWORD_MIN_LENGTH,
        max: CONSTANTS.PASSWORD_MAX_LENGTH,
      })
      .custom((newPassword: string) =>
        new RegExp(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d#@$!%*?&()]{8,16}$/
        ).test(newPassword)
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.PASSWORD_NOT_VALID),

    body("confirmPassword")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom(
        (confirmPassword: string, { req }) =>
          confirmPassword === req.body.newPassword
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.CONFIRM_PASSWORD_DIFFERENT),
  ],

  requestResetPassword: [
    param("email")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((email: string) => {
        if (email.length > 50) {
          return false;
        }

        return new RegExp(
          /^[a-z0-9-](\.?-?_?[a-z0-9]){5,}@(gmail\.com)?(fpt\.edu\.vn)?$/
        ).test(email);
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.EMAIL_FORMAT_NOT_VALID),
  ],

  resetPassword: [
    param("email")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((email: string) => {
        if (email.length > 50) {
          return false;
        }

        return new RegExp(
          /^[a-z0-9-](\.?-?_?[a-z0-9]){5,}@(gmail\.com)?(fpt\.edu\.vn)?$/
        ).test(email);
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.EMAIL_FORMAT_NOT_VALID),

    param("code")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({
        min: CONSTANTS.RESET_PASSWORD_CODE_LENGTH,
        max: CONSTANTS.RESET_PASSWORD_CODE_LENGTH,
      }),

    body("password")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({
        min: CONSTANTS.PASSWORD_MIN_LENGTH,
        max: CONSTANTS.PASSWORD_MAX_LENGTH,
      })
      .custom((newPassword: string) =>
        new RegExp(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d#@$!%*?&()]{8,16}$/
        ).test(newPassword)
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.PASSWORD_NOT_VALID),

    body("confirmPassword")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom(
        (confirmPassword: string, { req }) =>
          confirmPassword === req.body.password
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.CONFIRM_PASSWORD_DIFFERENT),
  ],

  getListUser: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_USER_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),
  ],

  warnUser: [
    param("userId")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((userId: string) => isValidObjectId(userId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("message").exists({ checkFalsy: true, checkNull: true }).isString(),
  ],

  addFavorite: [
    param("bookId")
      .exists({ checkFalsy: true, checkNull: true })
      .custom((bookId: string) => isValidObjectId(bookId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),
  ],
};

export default UserMiddleware;
