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
}

export default UserService;
