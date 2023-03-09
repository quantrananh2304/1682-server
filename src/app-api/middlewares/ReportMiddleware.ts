import { REPORT_SCHEMA, REPORT_TYPE } from "@app-repositories/models/Reports";
import CONSTANTS from "@app-utils/Constants";
import { body } from "express-validator";
import { isValidObjectId } from "mongoose";

const ReportMiddleware = {
  create: [
    body("title")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .isLength({ max: 50 }),

    body("content").exists({ checkFalsy: true, checkNull: true }).isString(),

    body("type")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((type: string) => {
        if (!REPORT_TYPE[type]) {
          return false;
        }

        return true;
      }),

    body("schema")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((schema: string) => {
        if (!REPORT_SCHEMA[schema]) {
          return false;
        }

        return true;
      }),

    body("schemaId")
      .exists()
      .custom(
        (schemaId: string) => isValidObjectId(schemaId) || schemaId === null
      )
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),
  ],
};

export default ReportMiddleware;
