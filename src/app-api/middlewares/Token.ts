import { RANDOM_TOKEN_SECRET } from "@app-configs";
import { Request, Response } from "@app-helpers/http.extends";
import { USER_ROLE } from "@app-repositories/models/Users";
import CONSTANTS from "@app-utils/Constants";
import { NextFunction } from "express";
import jwt = require("jsonwebtoken");

async function checkToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, RANDOM_TOKEN_SECRET, (err: Error, payload: any) => {
      if (payload) {
        req.headers["userId"] = payload.userId;
        req.headers["userRole"] = payload.userRole;
        next();
      } else {
        if (err.name === "TokenExpiredError") {
          return res.forbidden(CONSTANTS.SERVER_ERROR.AUTHORIZATION_FORBIDDEN);
        }
        return res.unauthorize({
          message: CONSTANTS.SERVER_ERROR.AUTHORIZATION_UNAUTHORIZED.message,
        });
      }
    });
  } catch (err) {
    return res.forbidden(CONSTANTS.SERVER_ERROR.AUTHORIZATION_FORBIDDEN);
  }
}

async function checkAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, RANDOM_TOKEN_SECRET, (err: Error, payload: any) => {
      if (payload) {
        const { userRole } = payload;

        if (USER_ROLE[userRole] === USER_ROLE.ADMIN) {
          next();
        } else {
          return res.forbidden(CONSTANTS.SERVER_ERROR.ADMIN_ONLY);
        }
      }
    });
  } catch (error) {
    return res.forbidden(CONSTANTS.SERVER_ERROR.ADMIN_ONLY);
  }
}

const TokenValidation = {
  checkAdmin,
  checkToken,
};

export default TokenValidation;
