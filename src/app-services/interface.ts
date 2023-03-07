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

export enum GET_LIST_USER_SORT {
  NAME_ASC = "NAME_ASC",
  NAME_DESC = "NAME_DESC",
  USERNAME_ASC = "USERNAME_ASC",
  USERNAME_DESC = "USERNAME_DESC",
  EMAIL_ASC = "EMAIL_ASC",
  EMAIL_DESC = "EMAIL_DESC",
  ROLE_ASC = "ROLE_ASC",
  ROLE_DESC = "ROLE_DESC",
  ADDRESS_ASC = "ADDRESS_ASC",
  ADDRESS_DESC = "ADDRESS_DESC",
  DOB_ASC = "DOB_ASC",
  DOB_DESC = "DOB_DESC",
  PHONE_NUMBER_ASC = "PHONE_NUMBER_ASC",
  PHONE_NUMBER_DESC = "PHONE_NUMBER_DESC",
  GENDER_ASC = "GENDER_ASC",
  GENDER_DESC = "GENDER_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DATE_CREATED_DESC = "DATE_CREATED_DESC",
}

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

  updatePassword(
    userId: string | Types.ObjectId,
    password: string,
    actor: string
  ): Promise<UserModelInterface>;

  getUserById(userId: string): Promise<UserModelInterface>;

  requestResetPasswordCode(userId: string): Promise<UserModelInterface>;

  resetPassword(email: string, password: string): Promise<UserModelInterface>;

  checkRequestResetPasswordCode(
    email: string,
    code: string
  ): Promise<UserModelInterface>;

  getListUser(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_USER_SORT;
    keyword: string;
  }): Promise<{
    users: Array<UserModelInterface>;
    page: number;
    total: number;
    totalPage: number;
  }>;
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
