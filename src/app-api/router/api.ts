import AuthenticationController from "@app-api/controllers/AuthenticationController";
import UserController from "@app-api/controllers/UserController";
import AuthenticationMiddleware from "@app-api/middlewares/AuthenticationMiddleware";
import ParamsValidations from "@app-api/middlewares/ParamsValidation";
import TokenValidation from "@app-api/middlewares/Token";
import UserMiddleware from "@app-api/middlewares/UserMiddleware";
import container from "@app-repositories/ioc";
import express = require("express");

const router = express.Router();

const UserControllerInstance = container.get<UserController>(UserController);
const AuthenticationControllerInstance =
  container.get<AuthenticationController>(AuthenticationController);

router.get("/test", (req, res) => res.send({ status: "OK" }));

// user
router.post(
  "/user/register",
  UserMiddleware.register,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  UserControllerInstance.register.bind(UserControllerInstance)
);

router.put(
  "/user/:userId/change-password",
  UserMiddleware.changePassword,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  UserControllerInstance.changePassword.bind(UserControllerInstance)
);

router.put(
  "/user/:email/request-reset-password",
  UserMiddleware.requestResetPassword,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  UserControllerInstance.requestResetPasswordCode.bind(UserControllerInstance)
);

router.put(
  "/user/:email/reset-password/:code",
  UserMiddleware.resetPassword,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  UserControllerInstance.resetPassword.bind(UserControllerInstance)
);

router.get(
  "/user/list",
  UserMiddleware.getListUser,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  UserControllerInstance.getListUser.bind(UserControllerInstance)
);

// auth
router.post(
  "/auth/login",
  AuthenticationMiddleware.login,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  AuthenticationControllerInstance.login.bind(AuthenticationControllerInstance)
);

export default router;
