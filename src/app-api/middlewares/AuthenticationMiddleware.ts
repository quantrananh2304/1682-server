import CONSTANTS from "@app-utils/Constants";
import { body } from "express-validator";

const AuthenticationMiddleware = {
  login: [
    body("email")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((email: string) => {
        if (email === "admin") {
          return true;
        }

        if (email.length > 50) {
          return false;
        }

        return new RegExp(
          /^[a-z0-9-](\.?-?_?[a-z0-9]){5,}@(gmail\.com)?(fpt\.edu\.vn)?$/
        ).test(email);
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.EMAIL_FORMAT_NOT_VALID),

    body("password").exists({ checkFalsy: true, checkNull: true }).isString(),
  ],
};

export default AuthenticationMiddleware;
