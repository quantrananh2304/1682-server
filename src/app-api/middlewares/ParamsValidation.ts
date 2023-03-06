import { Request, Response } from "@app-helpers/http.extends";
import CONSTANTS from "@app-utils/Constants";
import { NextFunction } from "express";
import { matchedData, validationResult } from "express-validator";

function preventUnknownData(req: Request, res: Response, next: NextFunction) {
  const requiredData = matchedData(req, { includeOptionals: false });

  if (Object.keys(req.body).length > Object.keys(requiredData).length) {
    return res.send(CONSTANTS.SERVER_ERROR.UNKNOWN_DATA);
  }

  next();
}

function validationRequest(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req).formatWith((error) => error);

  if (!errors.isEmpty()) {
    return res.errorRes({ errors: errors.array() });
  }

  next();
}

const ParamsValidations = {
  preventUnknownData,
  validationRequest,
};

export default ParamsValidations;
