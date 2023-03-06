import { Response as ResponseEX, Request as RequestEX } from "express";
import { validationResult, Result } from "express-validator";
import { Types } from "mongoose";

export type SuccessParamType = {
  data: any;
  errorCode?: 0;
  message?: string;
};

export type ErrorResParamType = {
  errorCode?: number;
  message?: string;
  data?: any;
  errors?: Array<any>;
};

export type BadRequestParamType = {
  message?: string;
  data?: any;
  errors?: Array<any>;
};

export type ForbiddenRequestParamType = {
  message?: string;
  data?: any;
};

export type UnauthorizedRequestParamType = {
  message?: string;
  data?: any;
};

export type InternalRequestParamType = {
  message?: string;
  error?: Error;
};

export interface FileMulterFormat {
  fieldName: "files" | string;
  originalName: string;
  encoding: "7bit" | string;
  mimetype: "image/png" | string;
  buffer: any;
  size: number;
}

export type ErrorParamType = {
  errors: any;
  errorCode: number;
  message: string;
  data: any;
};

export interface Response extends ResponseEX {
  /**
   * Success request
   * @param {Object} data - The data of response.
   * @param {Number} errorCode - The error must be 0.
   * @param {String} message - The message is empty string.
   * @param {Array<Object>} errors - The error array is empty.
   * @return Response
   */
  successRes: (params: SuccessParamType) => void;

  /**
   * Business error request
   * @param {Object} data - The data is empty array.
   * @param {Number} errorCode - The error must be -1.
   * @param {string} message - The message.
   * @param {Array<Object>} errors - The error.
   * @return Response
   */
  errorRes: (params?: ErrorResParamType) => void;

  /**
   * Bad request
   * @param {string} message - The message of response.
   * @param {Object} data - The data of response.
   * @param {Array} errors - The error messages of response for fields.
   * @return Response
   */
  badRequest: (params?: BadRequestParamType) => void;
  error: (params: ErrorParamType) => void;
  forbidden: (params: ForbiddenRequestParamType) => void;
  unauthorize: (params?: UnauthorizedRequestParamType) => void;
  internal: (params: InternalRequestParamType) => void;

  status: any;
  json: any;
}

export interface Request extends RequestEX {
  busboy(busboy: any): unknown;
  auth: {
    userId?: number;
  };
  file: any;
  files: any[];
  userRoleId: Types.ObjectId;
  body: any;
  query: any;
  headers: any;
  params: any;
  method: string;

  route: any;

  signedCookies: any;

  originalUrl: string;

  url: string;

  baseUrl: string;
}

const errorFormatter = (error) => {
  return error;
};

export function validationRequest(req: Request): Result {
  const errors = validationResult(req).formatWith(errorFormatter);

  return errors;
}
