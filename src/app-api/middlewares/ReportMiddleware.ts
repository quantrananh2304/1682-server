import {
  REPORT_SCHEMA,
  REPORT_STATUS,
  REPORT_TYPE,
} from "@app-repositories/models/Reports";
import { GET_LIST_REPORT_SORT } from "@app-services/interface";
import CONSTANTS from "@app-utils/Constants";
import { body, param, query } from "express-validator";
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

  getList: [
    query("page").exists({ checkNull: true }).isInt({ min: 1 }),

    query("limit")
      .exists({ checkFalsy: true, checkNull: true })
      .isInt({ min: 5 }),

    query("sort")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((sort: string) => {
        if (!GET_LIST_REPORT_SORT[sort]) {
          return false;
        }

        return true;
      })
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.SORT_OPTION_INVALID),
  ],

  updateReportStatus: [
    param("reportId")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((reportId) => isValidObjectId(reportId))
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.OBJECTID_INVALID),

    body("status")
      .exists({ checkFalsy: true, checkNull: true })
      .isString()
      .custom((status) => REPORT_STATUS[status])
      .withMessage(CONSTANTS.VALIDATION_MESSAGE.STATUS_INVALID),
  ],
};

export default ReportMiddleware;
