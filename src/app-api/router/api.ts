import UserController from "@app-api/controllers/UserController";
import ParamsValidations from "@app-api/middlewares/ParamsValidation";
import UserMiddleware from "@app-api/middlewares/UserMiddleware";
import container from "@app-repositories/ioc";
import express = require("express");

const router = express.Router();

const UserControllerInstance = container.get<UserController>(UserController);

router.get("/test", (req, res) => res.send({ status: "OK" }));

// user
router.post(
  "/user/register",
  UserMiddleware.register,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  UserControllerInstance.register.bind(UserControllerInstance)
);

export default router;
