import {
  EVENT_ACTION,
  EVENT_SCHEMA,
  EventModelInterface,
} from "@app-repositories/models/Events";
import {
  USER_GENDER,
  UserModelInterface,
} from "@app-repositories/models/Users";
import { Types } from "mongoose";

export interface IUserService {
  createUser(_user: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    address: string;
    dob: string;
    phoneNumber: string;
    gender: USER_GENDER | string;
  }): Promise<UserModelInterface>;

  checkUserExisted(_user: {
    username: string;
    email: string;
    phoneNumber: string;
  }): Promise<boolean>;

  getUserByEmailUsernamePhoneNumber(_user: {
    username: string;
    email: string;
    phoneNumber: string;
  }): Promise<UserModelInterface>;
}

export interface IEventService {
  createEvent(_event: {
    schema: EVENT_SCHEMA;
    action: EVENT_ACTION;
    schemaId: string | Types.ObjectId;
    actor: string | Types.ObjectId;
    description: string;
  }): Promise<EventModelInterface>;
}
