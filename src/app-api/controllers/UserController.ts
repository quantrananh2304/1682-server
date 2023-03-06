import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { UserModelInterface } from "@app-repositories/models/Users";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import UserService from "@app-services/UserService";
import CONSTANTS from "@app-utils/Constants";
import { inject, injectable } from "inversify";

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

      await Promise.allSettled([
        this.eventService.createEvent({
          schema: EVENT_SCHEMA.USER,
          action: EVENT_ACTION.CREATE,
          schemaId: user._id,
          actor: user._id,
          description: "/user/register",
        }),
        this.nodeMailer.nodeMailerSendMail([email], title, body),
      ]);

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default UserController;
