import AuthenticationController from "@app-api/controllers/AuthenticationController";
import BookController from "@app-api/controllers/BookController";
import PostController from "@app-api/controllers/PostController";
import ReportController from "@app-api/controllers/ReportController";
import TopicController from "@app-api/controllers/TopicController";
import UserController from "@app-api/controllers/UserController";
import AuthenticationMiddleware from "@app-api/middlewares/AuthenticationMiddleware";
import BookMiddleware from "@app-api/middlewares/BookMiddleware";
import ParamsValidations from "@app-api/middlewares/ParamsValidation";
import PostMiddleware from "@app-api/middlewares/PostMiddleware";
import ReportMiddleware from "@app-api/middlewares/ReportMiddleware";
import TokenValidation from "@app-api/middlewares/Token";
import TopicMiddleware from "@app-api/middlewares/TopicMiddleware";
import UserMiddleware from "@app-api/middlewares/UserMiddleware";
import container from "@app-repositories/ioc";
import express = require("express");

const router = express.Router();

const UserControllerInstance = container.get<UserController>(UserController);
const AuthenticationControllerInstance =
  container.get<AuthenticationController>(AuthenticationController);
const TopicControllerInstance = container.get<TopicController>(TopicController);
const BookControllerInstance = container.get<BookController>(BookController);
const ReportControllerInstance =
  container.get<ReportController>(ReportController);
const PostControllerInstance = container.get<PostController>(PostController);

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

router.put(
  "/admin/user/:userId/warn",
  UserMiddleware.warnUser,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  TokenValidation.checkAdmin,
  UserControllerInstance.warnUser.bind(UserControllerInstance)
);

router.put(
  "/user/add-favorite/:bookId",
  UserMiddleware.addFavorite,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  UserControllerInstance.addFavoriteBook.bind(UserControllerInstance)
);

// auth
router.post(
  "/auth/login",
  AuthenticationMiddleware.login,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  AuthenticationControllerInstance.login.bind(AuthenticationControllerInstance)
);

//topic
router.post(
  "/admin/topic/create",
  TopicMiddleware.create,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  TokenValidation.checkAdmin,
  TopicControllerInstance.createTopic.bind(TopicControllerInstance)
);

router.get(
  "/topic/list",
  TopicMiddleware.getListTopic,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  TopicControllerInstance.getListTopic.bind(TopicControllerInstance)
);

router.put(
  "/admin/topic/:topicId/update",
  TopicMiddleware.updateTopic,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  TokenValidation.checkAdmin,
  TopicControllerInstance.updateTopic.bind(TopicControllerInstance)
);

// book
router.post(
  "/author/book/create",
  BookMiddleware.create,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  TokenValidation.checkAuthor,
  BookControllerInstance.createBook.bind(BookControllerInstance)
);

router.get(
  "/book/list",
  BookMiddleware.getListBook,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  BookControllerInstance.getListBook.bind(BookControllerInstance)
);

router.put(
  "/author/book/:bookId/hide",
  BookMiddleware.hide,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  TokenValidation.checkAuthor,
  BookControllerInstance.hideBook.bind(BookControllerInstance)
);

// report
router.post(
  "/report/create",
  ReportMiddleware.create,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  ReportControllerInstance.createReport.bind(ReportControllerInstance)
);

router.get(
  "/admin/report/list",
  ReportMiddleware.getList,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  TokenValidation.checkAdmin,
  ReportControllerInstance.getListReport.bind(ReportControllerInstance)
);

// post
router.post(
  "/post/create",
  PostMiddleware.create,
  ParamsValidations.validationRequest,
  ParamsValidations.preventUnknownData,
  TokenValidation.checkToken,
  PostControllerInstance.createPost.bind(PostControllerInstance)
);

router.put(
  "/post/:postId/update",
  PostMiddleware.update,
  ParamsValidations.validationRequest,
  ParamsValidations.validationRequest,
  TokenValidation.checkToken,
  PostControllerInstance.editPost.bind(PostControllerInstance)
);

export default router;
