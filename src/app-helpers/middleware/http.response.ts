import { Request as RequestEX } from "express";
import {
  Response,
  ErrorResParamType,
  BadRequestParamType,
  ForbiddenRequestParamType,
  UnauthorizedRequestParamType,
  InternalRequestParamType,
} from "../http.extends";
import CONSTANTS from "@app-utils/Constants";

const httpResponse = (req: RequestEX, res: Response, next) => {
  res.successRes = function ({
    data = {},
    errorCode = 0,
    message = CONSTANTS.SUCCESS,
  }) {
    //discordLogger(req as any, "success");
    return res.json({
      errorCode,
      message,
      data,
      errors: [],
    });
  };

  res.errorRes = function ({
    errorCode,
    message,
    data,
    errors,
  }: ErrorResParamType = {}) {
    errorCode = errorCode || "-1";
    message = message || CONSTANTS.ERROR;
    data = data || {};
    errors = errors || [];

    return res.json({
      errorCode,
      message,
      data,
      errors,
    });
  };

  res.badRequest = function ({
    message = CONSTANTS.BAD_REQUEST,
  }: BadRequestParamType = {}) {
    return res.status(400).errorRes({ errorCode: "400", message: message });
  };

  res.forbidden = function ({
    message = CONSTANTS.FORBIDDEN,
  }: ForbiddenRequestParamType = {}) {
    return res.status(403).errorRes({ errorCode: "403", message: message });
  };

  res.unauthorize = function ({
    message = CONSTANTS.UNAUTHORIZED,
  }: UnauthorizedRequestParamType = {}) {
    return res.status(401).errorRes({ errorCode: "401", message: message });
  };

  res.internal = function ({
    message = CONSTANTS.INTERNAL_ERROR,
  }: InternalRequestParamType = {}) {
    return res.status(500).errorRes({ errorCode: "500", message: message });
  };

  next();
};

export default httpResponse;
