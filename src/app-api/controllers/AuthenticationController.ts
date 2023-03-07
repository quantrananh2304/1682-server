import { Request, Response } from "@app-helpers/http.extends";
import {
  USER_STATUS,
  UserModelInterface,
} from "@app-repositories/models/Users";
import TYPES from "@app-repositories/types";
import UserService from "@app-services/UserService";
import CONSTANTS from "@app-utils/Constants";
import { inject, injectable } from "inversify";
import bcrypt = require("bcryptjs");
import jwt = require("jsonwebtoken");
import { RANDOM_TOKEN_SECRET } from "@app-configs";
import EventService from "@app-services/EventService";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";

@injectable()
class AuthenticationController {
  @inject(TYPES.UserService) private readonly userService: UserService;
  @inject(TYPES.EventService) private readonly eventService: EventService;

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const user: UserModelInterface =
        await this.userService.getUserByEmailUsernamePhoneNumber({
          username,
          email: username,
          phoneNumber: username,
        });

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      if (user.status === USER_STATUS.LOCKED) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.ACCOUNT_LOCKED);
      }

      const isMatch: boolean = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.LOGIN_INFO_INVALID);
      }

      const token = jwt.sign(
        { userId: String(user._id), userRole: user.role },
        RANDOM_TOKEN_SECRET,
        { expiresIn: "14d" }
      );

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: String(user._id),
        actor: String(user._id),
        description: "/auth/login",
      });

      return res.successRes({
        data: {
          token,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default AuthenticationController;
