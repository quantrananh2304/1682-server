import { body } from "express-validator";

const AuthenticationMiddleware = {
  login: [
    body("username").exists({ checkFalsy: true, checkNull: true }).isString(),
    body("password").exists({ checkFalsy: true, checkNull: true }).isString(),
  ],
};

export default AuthenticationMiddleware;
