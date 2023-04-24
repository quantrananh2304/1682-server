import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import {
  USER_ROLE,
  USER_STATUS,
  UserModelInterface,
} from "@app-repositories/models/Users";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import UserService from "@app-services/UserService";
import CONSTANTS from "@app-utils/Constants";
import { inject, injectable } from "inversify";
import bcrypt = require("bcryptjs");
import jwt = require("jsonwebtoken");
import { RANDOM_TOKEN_SECRET } from "@app-configs";
import BookService from "@app-services/BookService";
import NodeMailer from "@app-repositories/smtp";
import { BookModelInterface } from "@app-repositories/models/Books";
import { PostModelInterface } from "@app-repositories/models/Posts";
import PostService from "@app-services/PostService";
import NotificationService from "@app-services/NotificationService";
import { NOTIFICATION_TYPE } from "@app-repositories/models/Notifications";

@injectable()
class UserController {
  @inject(TYPES.UserService) private readonly userService: UserService;
  @inject(TYPES.EventService) private readonly eventService: EventService;
  @inject(TYPES.NodeMailer) private readonly nodeMailer: NodeMailer;
  @inject(TYPES.BookService) private readonly bookService: BookService;
  @inject(TYPES.PostService) private readonly postService: PostService;
  @inject(TYPES.NotificationService)
  private readonly notificationService: NotificationService;

  async register(req: Request, res: Response) {
    try {
      const {
        email,
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
        phoneNumber,
      });

      if (isExisted) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_EXISTED);
      }

      const user: UserModelInterface = await this.userService.createUser({
        firstName,
        lastName,
        email,
        password,
        address,
        dob,
        phoneNumber,
        gender,
      });

      const title = CONSTANTS.ACCOUNT_REGISTERED;

      const body = CONSTANTS.ACCOUNT_REGISTERED_BODY;

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

      const user: UserModelInterface = await this.userService.getUserByEmail({
        email,
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

  async addFavoriteBook(req: Request, res: Response) {
    try {
      const { bookId } = req.params;
      const { userId } = req.headers;

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const book: BookModelInterface = await this.bookService.getBookById(
        bookId
      );

      if (!book || book.hidden.isHidden === true) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
      }

      const { favorites } = user;

      if (favorites.map((item) => String(item.book)).includes(bookId)) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_ALREADY_IN_FAV_LIST);
      }

      const updatedUser: UserModelInterface =
        await this.userService.addFavoriteBook(bookId, userId);

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: userId,
        actor: userId,
        description: "/user/add-favorite",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async removeFavoriteBook(req: Request, res: Response) {
    try {
      const { bookId } = req.params;
      const { userId } = req.headers;

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const book: BookModelInterface = await this.bookService.getBookById(
        bookId
      );

      if (!book || book.hidden.isHidden === true) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
      }

      const { favorites } = user;

      if (!favorites.map((item) => String(item.book)).includes(bookId)) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_ALREADY_IN_FAV_LIST);
      }

      const updatedUser: UserModelInterface =
        await this.userService.removeFavoriteBook(bookId, userId);

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: userId,
        actor: userId,
        description: "/user/remove-favorite",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getUserProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user: UserModelInterface = await this.userService.getUserProfile(
        userId
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: userId,
        actor: req.headers.userId,
        description: "/user/profile",
      });

      return res.successRes({ data: user });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async editProfile(req: Request, res: Response) {
    try {
      const { userId } = req.headers;
      const { firstName, lastName, address, dob, gender } = req.body;

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      if (!user) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const updatedUser: UserModelInterface =
        await this.userService.editProfile(userId, {
          firstName,
          lastName,
          address,
          dob,
          gender,
        });

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: userId,
        actor: userId,
        description: "/user/edit",
      });

      return res.successRes({
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role,
          address: user.address,
          dob: user.dob,
          gender: user.gender,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async followUser(req: Request, res: Response) {
    try {
      if (req.params.userId === req.headers.userId) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_FOLLOW_YOURSELF);
      }

      const user: UserModelInterface = await this.userService.getUserById(
        req.params.userId
      );

      if (!user || user.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const actor: UserModelInterface = await this.userService.getUserById(
        req.headers.userId
      );

      if (!actor) {
        return res.internal({});
      }

      const { following } = actor;

      if (
        following.map((item) => String(item.user)).includes(req.params.userId)
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_ALREADY_IN_FOLLOW_LIST);
      }

      const updatedUser: UserModelInterface = await this.userService.followUser(
        req.params.userId,
        req.headers.userId
      );

      await this.notificationService.createNotification(req.headers.userId, {
        content: `${actor.firstName} ${actor.lastName} followed you`,
        schema: EVENT_SCHEMA.USER,
        schemaId: req.headers.userId,
        receiver: req.params.userId,
        notiType: NOTIFICATION_TYPE.FOLLOW,
      });

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: req.headers.userId,
        actor: req.headers.userId,
        description: "/user/follow",
      });

      return res.successRes({
        data: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          address: updatedUser.address,
          dob: updatedUser.dob,
          gender: updatedUser.gender,
          following: updatedUser.following,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async unfollowUser(req: Request, res: Response) {
    try {
      const user: UserModelInterface = await this.userService.getUserById(
        req.params.userId
      );

      if (!user || user.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const actor: UserModelInterface = await this.userService.getUserById(
        req.headers.userId
      );

      if (!actor) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const { following } = actor;

      if (
        !following.map((item) => String(item.user)).includes(req.params.userId)
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_IN_FOLLOW_LIST);
      }

      const updatedUser: UserModelInterface =
        await this.userService.unfollowUser(
          req.params.userId,
          req.headers.userId
        );

      if (!updatedUser) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: req.headers.userId,
        actor: req.headers.userId,
        description: "/user/unfollow",
      });

      return res.successRes({
        data: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          address: updatedUser.address,
          dob: updatedUser.dob,
          gender: updatedUser.gender,
          following: updatedUser.following,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getListFollowers(req: Request, res: Response) {
    try {
      const { userId, limit, page } = req.query;

      const user = await this.userService.getListFollowers(userId);

      if (!user || user.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const { followers, following } = user;

      const skipStart = Number(page - 1) * Number(limit);
      const skipEnd = skipStart + Number(limit);

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: userId,
        description: "user/get-list-followers-following",
        actor: userId,
      });

      return res.successRes({
        data: {
          followers: followers.slice(skipStart, skipEnd),
          following: following.slice(skipStart, skipEnd),
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getListPost(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      const posts: Array<PostModelInterface> =
        await this.postService.getListPostByUserId(userId);

      if (!posts) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: userId,
        description: "user/get-list-post",
        actor: userId,
      });

      return res.successRes({
        data: posts.map((item) => {
          return {
            ...item,
            updatedBy: item.isAnonymous ? {} : item.updatedBy,
          };
        }),
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async sendMessages(req: Request, res: Response) {
    try {
      const { userId } = req.headers;
      const { receiver } = req.params;
      const { content } = req.body;

      const receiverUser: UserModelInterface =
        await this.userService.getUserById(receiver);

      if (!receiverUser || receiverUser.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      const { following, followers } = user;

      if (
        !followers.map((item) => String(item.user)).includes(receiver) ||
        !following.map((item) => String(item.user)).includes(receiver)
      ) {
        return res.errorRes(
          CONSTANTS.SERVER_ERROR.USER_NOT_FOLLOWED_OR_FOLLOWING
        );
      }

      const updatedUser: UserModelInterface =
        await this.userService.sendMessage(userId, receiver, content);

      if (!updatedUser) {
        return res.internal({});
      }

      const updatedReceiver: UserModelInterface =
        await this.userService.getUserById(receiver);

      if (!updatedReceiver) {
        return res.internal({});
      }

      if (res.io) {
        res.io.emit(receiver, {
          messages: updatedReceiver.messages.filter(
            (item) => String(item.receiver) === userId
          )[0],
        });
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        actor: userId,
        description: "user/chat",
        schemaId: userId,
      });

      return res.successRes({
        data: updatedUser.messages.filter(
          (item) => String(item.receiver) === receiver
        )[0],
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const { receiver } = req.query;
      const { userId } = req.headers;

      const receiverUser: UserModelInterface =
        await this.userService.getUserById(receiver);

      if (!receiverUser || receiverUser.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      const messages = user.messages.filter(
        (item) => String(item.receiver) === receiver
      )[0];

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: userId,
        actor: userId,
        description: "user/get-chat-message",
      });

      return res.successRes({ data: messages });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getMessageById(req: Request, res: Response) {
    try {
      const { userId } = req.headers;

      const user: UserModelInterface = await this.userService.getAllMessageById(
        userId
      );

      if (!user) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: userId,
        actor: userId,
        description: "/user/get-messages",
      });

      return res.successRes({ data: user.messages });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    try {
      const { userId } = req.headers;
      const { contentType, url, name } = req.body;

      const user: UserModelInterface = await this.userService.uploadAvatar(
        userId,
        { contentType, url, name }
      );

      if (!user) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.UPDATE,
        schemaId: userId,
        actor: userId,
        description: "/user/upload-avatar",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async getListFavorite(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      const user: UserModelInterface =
        await this.userService.getFavoriteBookList(userId);

      if (!user || user.status !== USER_STATUS.ACTIVE) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.USER,
        action: EVENT_ACTION.READ,
        schemaId: userId,
        actor: userId,
        description: "/user/favorites",
      });

      return res.successRes({
        data: user.favorites
          .filter((item) => !item.book.hidden.isHidden)
          .map((item) => ({
            ...item,
            likeCount: item.book.like.length,
            dislikeCount: item.book.dislike.length,
            viewsCount: item.book.views.length,
            commentsCount: item.book.comments.length,
          })),
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }

  async toggleUserStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const actor = req.headers.userId;
      const { action } = req.body;

      if (userId === actor) {
        return res.internal({});
      }

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      if (action === "lock") {
        if (user.status === USER_STATUS.LOCKED) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.USER_ALR_LOCKED);
        }

        const updatedUser: UserModelInterface = await this.userService.lockUser(
          userId,
          actor
        );

        if (!updatedUser) {
          return res.internal({});
        }

        await this.eventService.createEvent({
          schema: EVENT_SCHEMA.USER,
          action: EVENT_ACTION.UPDATE,
          schemaId: userId,
          actor,
          description: "/user/lock",
        });

        return res.successRes({ data: {} });
      } else {
        if (user.status !== USER_STATUS.LOCKED) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.USER_ALR_UNLOCKED);
        }

        const updatedUser: UserModelInterface =
          await this.userService.unlockUser(userId, actor);

        if (!updatedUser) {
          return res.internal({});
        }

        await this.eventService.createEvent({
          schema: EVENT_SCHEMA.USER,
          action: EVENT_ACTION.UPDATE,
          schemaId: userId,
          actor,
          description: "/user/unlock",
        });

        return res.successRes({ data: {} });
      }
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.message });
    }
  }
}

export default UserController;
