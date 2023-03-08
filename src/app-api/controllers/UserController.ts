import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { USER_ROLE, UserModelInterface } from "@app-repositories/models/Users";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import UserService from "@app-services/UserService";
import CONSTANTS from "@app-utils/Constants";
import { inject, injectable } from "inversify";
import bcrypt = require("bcryptjs");
import jwt = require("jsonwebtoken");
import { RANDOM_TOKEN_SECRET } from "@app-configs";

@injectable()
class UserController {
  @inject(TYPES.UserService) private readonly userService: UserService;
  @inject(TYPES.EventService) private readonly eventService: EventService;
  @inject(TYPES.NodeMailer) private readonly nodeMailer: any;

  async register(req: Request, res: Response) {
    try {
      const {
        email,
        username,
        phoneNumber,
        firstName,
        lastName,
        password,
        address,
        dob,
        gender,
      } = req.body;

      const isExisted: boolean = await this.userService.checkUserExisted({
        email,
        username,
        phoneNumber,
      });

      if (isExisted) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_EXISTED);
      }

      const user: UserModelInterface = await this.userService.createUser({
        firstName,
        lastName,
        username,
        email,
        password,
        address,
        dob,
        phoneNumber,
        gender,
      });

      const title = CONSTANTS.ACCOUNT_REGISTERED;

      const body = CONSTANTS.ACCOUNT_REGISTERED_BODY.replace(
        "{user.username}",
        username
      );

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.CREATE,
        schemaId: String(user._id),
        actor: String(user._id),
        description: "/user/register",
      });

      await this.nodeMailer.nodeMailerSendMail([email], title, body);

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { oldPassword, newPassword } = req.body;

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const isMatch: boolean = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.WRONG_PASSWORD);
      }

      const password = await bcrypt.hash(newPassword, 10);

      const updatedUser = await this.userService.updatePassword(
        userId,
        password,
        req.headers.userId
      );

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: String(user._id),
        actor: req.headers.userId,
        description: "/user/change-password",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async requestResetPasswordCode(req: Request, res: Response) {
    try {
      const { email } = req.params;

      const user: UserModelInterface =
        await this.userService.getUserByEmailUsernamePhoneNumber({
          username: "",
          email,
          phoneNumber: "",
        });

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const { _id } = user;

      const data: UserModelInterface =
        await this.userService.requestResetPasswordCode(String(_id));

      if (!data) {
        return res.internal({});
      }

      const { resetPasswordCode } = data;

      const title = CONSTANTS.RESET_PASSWORD;

      const body = CONSTANTS.RESET_PASSWORD_BODY.replace(
        "{user.resetPasswordCode}",
        resetPasswordCode
      );

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: String(_id),
        actor: null,
        description: "/user/request-reset-password",
      });

      await this.nodeMailer.nodeMailerSendMail([email], title, body);

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, code } = req.params;

      const user: UserModelInterface =
        await this.userService.checkRequestResetPasswordCode(email, code);

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.EMAIL_OR_CODE_WRONG);
      }

      const { password } = req.body;

      const isMatch: boolean = await bcrypt.compare(password, user.password);

      if (isMatch) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.NEW_PASSWORD_NOT_CHANGED);
      }

      const hashedPassword = await bcrypt.hash(
        password,
        CONSTANTS.PASSWORD_SALT
      );

      const data: UserModelInterface = await this.userService.resetPassword(
        email,
        hashedPassword
      );

      const token = jwt.sign(
        { userId: String(data._id), userRole: user.role },
        RANDOM_TOKEN_SECRET,
        { expiresIn: "14d" }
      );

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: String(data._id),
        actor: String(data._id),
        description: "/user/reset-password",
      });

      return res.successRes({
        data: {
          token,
          _id: data._id,
          firstName: data.firstName,
          lastName: data.lastName,
          avatar: data.avatar,
          role: data.role,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getListUser(req: Request, res: Response) {
    try {
      const { page, limit, sort, keyword } = req.query;

      const user = await this.userService.getListUser({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
        keyword: keyword || "",
      });

      if (!user) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: String(req.headers.userId),
        description: "/user/list",
      });

      return res.successRes({ data: user });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async warnUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { message } = req.body;
      const { userRole } = req.headers;

      if (userRole !== USER_ROLE.ADMIN) {
        return res.forbidden(CONSTANTS.SERVER_ERROR.ADMIN_ONLY);
      }

      const user: UserModelInterface = await this.userService.warnUser(
        userId,
        message,
        req.headers.userId
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default UserController;
