import Users, {
  USER_GENDER,
  USER_ROLE,
  USER_STATUS,
  UserModelInterface,
} from "@app-repositories/models/Users";
import { IUserService } from "./interface";
import { injectable } from "inversify";
import bcrypt = require("bcryptjs");
import CONSTANTS from "@app-utils/Constants";
import { Types } from "mongoose";
import { stringGenerator } from "@app-utils/utils";

@injectable()
class UserService implements IUserService {
  async createUser(_user: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    address: string;
    dob: string;
    phoneNumber: string;
    gender: USER_GENDER | string;
  }): Promise<UserModelInterface> {
    const { password, dob } = _user;

    const hashedPassword = await bcrypt.hash(password, CONSTANTS.PASSWORD_SALT);

    const user: UserModelInterface = await Users.create({
      ..._user,
      dob: new Date(dob),
      avatar: "",
      password: hashedPassword,
      status: USER_STATUS.ACTIVE,
      role: USER_ROLE.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: null,
      favorites: [],
      following: [],
      followers: [],
    });

    return user;
  }

  async checkUserExisted(_user: {
    username: string;
    email: string;
    phoneNumber: string;
  }): Promise<boolean> {
    const { username, email, phoneNumber } = _user;

    const user: Array<UserModelInterface> = await Users.find({
      $or: [{ username }, { email }, { phoneNumber }],
    });

    if (user.length) {
      return true;
    }

    return false;
  }

  async getUserByEmailUsernamePhoneNumber(_user: {
    username: string;
    email: string;
    phoneNumber: string;
  }): Promise<UserModelInterface> {
    const { username, email, phoneNumber } = _user;

    const user: UserModelInterface = await Users.findOne({
      $or: [{ username }, { email }, { phoneNumber }],
    });

    return user;
  }

  async updatePassword(
    userId: string,
    password: string,
    actor: string
  ): Promise<UserModelInterface> {
    const user: UserModelInterface = await Users.findByIdAndUpdate(
      userId,
      {
        $set: {
          password,
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(actor),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return user;
  }

  async getUserById(userId: string): Promise<UserModelInterface> {
    const user: UserModelInterface = await Users.findById(
      Types.ObjectId(userId)
    )
      .select("-__v")
      .lean();

    return user;
  }

  async requestResetPasswordCode(userId: string): Promise<UserModelInterface> {
    const code = stringGenerator(CONSTANTS.RESET_PASSWORD_CODE_LENGTH);

    const user: UserModelInterface = await Users.findByIdAndUpdate(
      userId,
      {
        $set: { resetPasswordCode: code, updatedAt: new Date() },
      },
      { new: true, useFindAndModify: false }
    );

    return user;
  }

  async checkRequestResetPasswordCode(
    email: string,
    code: string
  ): Promise<UserModelInterface> {
    const user: UserModelInterface = await Users.findOne({
      email,
      resetPasswordCode: code,
    });

    return user;
  }

  async resetPassword(
    email: string,
    password: string
  ): Promise<UserModelInterface> {
    const user: UserModelInterface = await Users.findOneAndUpdate(
      { email },
      { $set: { password, updatedAt: new Date(), code: "" } },
      { new: true, useFindAndModify: false }
    );

    return user;
  }
}

export default UserService;
