import { BookModelInterface } from "@app-repositories/models/Books";
import {
  EVENT_ACTION,
  EVENT_SCHEMA,
  EventModelInterface,
} from "@app-repositories/models/Events";
import { PaymentMethodModelInterface } from "@app-repositories/models/PaymentMethods";
import { PaymentModelInterface } from "@app-repositories/models/Payments";
import { PostModelInterface } from "@app-repositories/models/Posts";
import {
  REPORT_SCHEMA,
  REPORT_TYPE,
  ReportModelInterface,
} from "@app-repositories/models/Reports";
import { TopicModelInterface } from "@app-repositories/models/Topics";
import {
  USER_GENDER,
  UserModelInterface,
} from "@app-repositories/models/Users";
import { Types } from "mongoose";

export enum GET_LIST_USER_SORT {
  NAME_ASC = "NAME_ASC",
  NAME_DESC = "NAME_DESC",
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

export enum GET_LIST_TOPIC_SORT {
  NAME_ASC = "NAME_ASC",
  NAME_DESC = "NAME_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DATE_CREATED_DESC = "DATE_CREATED_DESC",
}

export enum GET_LIST_BOOK_SORT {
  TITLE_ASC = "TITLE_ASC",
  TITLE_DESC = "TITLE_DESC",
  CHAPTER_ASC = "CHAPTER_ASC",
  CHAPTER_DESC = "CHAPTER_DESC",
  LIKE_ASC = "LIKE_ASC",
  LIKE_DESC = "LIKE_DESC",
  DISLIKE_ASC = "DISLIKE_ASC",
  DISLIKE_DESC = "DISLIKE_DESC",
  VIEW_ASC = "VIEW_ASC",
  VIEW_DESC = "VIEW_DESC",
  COMMENT_ASC = "COMMENT_ASC",
  COMMENT_DESC = "COMMENT_DESC",
  TOPIC_ASC = "TOPIC_ASC",
  TOPIC_DESC = "TOPIC_DESC",
  SUBSCRIBED_USER_ASC = "SUBSCRIBED_USER_ASC",
  SUBSCRIBED_USER_DESC = "SUBSCRIBED_USER_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DATE_CREATED_DESC = "DATE_CREATED_DESC",
}

export enum GET_LIST_REPORT_SORT {
  TITLE_ASC = "TITLE_ASC",
  TITLE_DESC = "TITLE_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DATE_CREATED_DESC = "DATE_CREATED_DESC",
  STATUS_ASC = "STATUS_ASC",
  STATUS_DESC = "STATUS_DESC",
  TYPE_ASC = "TYPE_ASC",
  TYPE_DESC = "TYPE_DESC",
  SCHEMA_ASC = "SCHEMA_ASC",
  SCHEMA_DESC = "SCHEMA_DESC",
}

export enum GET_LIST_POST_SORT {
  LIKE_ASC = "LIKE_ASC",
  LIKE_DESC = "LIKE_DESC",
  DISLIKE_ASC = "DISLIKE_ASC",
  DISLIKE_DESC = "DISLIKE_DESC",
  VIEW_ASC = "VIEW_ASC",
  VIEW_DESC = "VIEW_DESC",
  COMMENT_ASC = "COMMENT_ASC",
  COMMENT_DESC = "COMMENT_DESC",
  DATE_CREATED_ASC = "DATE_CREATED_ASC",
  DATE_CREATED_DESC = "DATE_CREATED_DESC",
}

export interface IUserService {
  createUser(_user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address: string;
    dob: string;
    phoneNumber: string;
    gender: USER_GENDER | string;
  }): Promise<UserModelInterface>;

  checkUserExisted(_user: {
    email: string;
    phoneNumber: string;
  }): Promise<boolean>;

  getUserByEmail(_user: { email: string }): Promise<UserModelInterface>;

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

  warnUser(
    _id: string,
    message: string,
    actor: string
  ): Promise<UserModelInterface>;

  addFavoriteBook(bookId: string, actor: string): Promise<UserModelInterface>;

  removeFavoriteBook(
    bookId: string,
    actor: string
  ): Promise<UserModelInterface>;

  getUserProfile(userId: string): Promise<UserModelInterface>;

  editProfile(
    userId: string,
    _user: {
      firstName: string;
      lastName: string;
      address: string;
      dob: string;
      gender: USER_GENDER | string;
    }
  ): Promise<UserModelInterface>;

  followUser(userId: string, actor: string): Promise<UserModelInterface>;

  unfollowUser(userId: string, actor: string): Promise<UserModelInterface>;

  getAdminAccount(): Promise<UserModelInterface>;

  getListFollowers(userId: string): Promise<UserModelInterface>;

  sendMessage(
    fromId: string,
    toId: string,
    content: string
  ): Promise<UserModelInterface>;

  getAllMessageById(userId: string): Promise<UserModelInterface>;

  uploadAvatar(
    userId: string,
    avatar: { url: string; name: string; contentType: string }
  ): Promise<UserModelInterface>;

  getFavoriteBookList(userId: string): Promise<UserModelInterface>;
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

export interface ITopicService {
  createTopic(
    _topic: {
      name: string;
      note: string;
    },
    actor: string
  ): Promise<TopicModelInterface>;

  getTopicByName(name: string): Promise<TopicModelInterface>;

  getListTopic(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_TOPIC_SORT;
    keyword: string;
  }): Promise<{
    topics: Array<TopicModelInterface>;
    page: number;
    total: number;
    totalPage: number;
  }>;

  updateTopic(
    _topic: { name: string; note: string; _id: string },
    actor: string
  ): Promise<TopicModelInterface>;

  getTopicById(_id: string): Promise<TopicModelInterface>;
}

export interface IBookService {
  createBook(
    _book: {
      title: string;
      chapters: Array<{ name: string; content: string }>;
      topics: Array<string>;
    },
    actor: string
  ): Promise<BookModelInterface>;

  getBookById(_id: string): Promise<BookModelInterface>;

  getListBook(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_BOOK_SORT;
    keyword: string;
    filteredBy: {
      topics: Array<string>;
    };
  }): Promise<{
    books: Array<BookModelInterface>;
    page: number;
    total: number;
    totalPage: number;
  }>;

  hideBook(
    _id: string,
    hiddenUntil: string,
    actor: string
  ): Promise<BookModelInterface>;

  commentBook(
    bookId: string,
    content: string,
    actor: string
  ): Promise<BookModelInterface>;

  editCommentBook(
    bookId: string,
    commentId: string,
    content: string,
    actor: string
  ): Promise<BookModelInterface>;

  deleteCommentBook(
    bookId: string,
    commentId: string
  ): Promise<BookModelInterface>;

  likeDislikeBook(
    bookId: string,
    action: "like" | "dislike",
    actor: string
  ): Promise<BookModelInterface>;

  viewBook(bookId: string, actor: string): Promise<BookModelInterface>;

  getBookDetail(bookId: string): Promise<BookModelInterface>;

  getBookByDate(
    startDate: Date,
    endDate: Date
  ): Promise<Array<BookModelInterface>>;
}

export interface IReportService {
  createReport(
    _report: {
      title: string;
      content: string;
      type: REPORT_TYPE;
      schema: REPORT_SCHEMA;
      schemaId: string;
    },
    actor: string
  ): Promise<ReportModelInterface>;

  checkExistReport(
    schemaId: string,
    actor: string
  ): Promise<ReportModelInterface>;

  getListReport(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_REPORT_SORT;
    keyword: string;
  }): Promise<{
    reports: Array<ReportModelInterface>;
    page: number;
    total: number;
    totalPage: number;
  }>;
}

export interface IPostService {
  createPost(
    _post: {
      content: string;
      images: Array<{ contentType: string; url: string; name: string }>;
      isAnonymous: boolean;
    },
    actor: string
  ): Promise<PostModelInterface>;

  editPost(
    _id: string,
    _post: {
      content: string;
      images: Array<{ contentType: string; url: string; name: string }>;
    },
    actor: string
  ): Promise<PostModelInterface>;

  getPostById(_id: string): Promise<PostModelInterface>;

  getListPost(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_POST_SORT;
    keyword: string;
  }): Promise<{
    posts: Array<PostModelInterface>;
    page: number;
    total: number;
    totalPage: number;
  }>;

  commentPost(
    postId: string,
    content: string,
    actor: string
  ): Promise<PostModelInterface>;

  editCommentPost(
    postId: string,
    commentId: string,
    content: string,
    actor: string
  ): Promise<PostModelInterface>;

  deleteCommentPost(
    postId: string,
    commentId: string,
    actor: string
  ): Promise<PostModelInterface>;

  likeDislikePost(
    postId: string,
    action: "like" | "dislike",
    actor: string
  ): Promise<PostModelInterface>;

  viewPost(postId: string, actor: string): Promise<PostModelInterface>;

  getPostDetail(postId: string): Promise<PostModelInterface>;

  getListPostByUserId(userId: string): Promise<Array<PostModelInterface>>;

  getPostByDate(
    startDate: Date,
    endDate: Date
  ): Promise<Array<PostModelInterface>>;
}

export interface IPaymentService {
  getPaymentMethod(): Promise<Array<PaymentMethodModelInterface>>;

  createPaymentMethod(
    userId: string,
    name: string,
    note: string
  ): Promise<PaymentMethodModelInterface>;

  getPaymentMethodByName(name: string): Promise<PaymentMethodModelInterface>;

  getAvailablePaymentMethod(): Promise<Array<PaymentMethodModelInterface>>;

  createOrder(
    userId: string,
    method: string,
    amount: string
  ): Promise<PaymentModelInterface>;

  getPaymentMethodById(
    paymentMethodId: string
  ): Promise<PaymentMethodModelInterface>;
}
