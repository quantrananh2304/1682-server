import Users, {
  USER_GENDER,
  USER_ROLE,
  USER_STATUS,
  UserModelInterface,
} from "@app-repositories/models/Users";
import { GET_LIST_USER_SORT, IUserService } from "./interface";
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
      warning: [],
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

  async getListUser(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_USER_SORT;
    keyword: string;
  }): Promise<{
    users: UserModelInterface[];
    page: number;
    total: number;
    totalPage: number;
  }> {
    const { page, limit, keyword } = filter;

    const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_USER_SORT.ADDRESS_ASC:
        sort = { address: 1 };
        break;

      case GET_LIST_USER_SORT.ADDRESS_DESC:
        sort = { address: -1 };
        break;

      case GET_LIST_USER_SORT.DOB_ASC:
        sort = { dob: 1 };
        break;

      case GET_LIST_USER_SORT.DOB_DESC:
        sort = { dob: -1 };
        break;

      case GET_LIST_USER_SORT.EMAIL_ASC:
        sort = { email: 1 };
        break;

      case GET_LIST_USER_SORT.EMAIL_DESC:
        sort = { email: -1 };
        break;

      case GET_LIST_USER_SORT.GENDER_ASC:
        sort = { gender: 1 };
        break;

      case GET_LIST_USER_SORT.GENDER_DESC:
        sort = { gender: -1 };
        break;

      case GET_LIST_USER_SORT.NAME_ASC:
        sort = { firstName: 1 };
        break;

      case GET_LIST_USER_SORT.NAME_DESC:
        sort = { firstName: -1 };
        break;

      case GET_LIST_USER_SORT.PHONE_NUMBER_ASC:
        sort = { phoneNumber: 1 };
        break;

      case GET_LIST_USER_SORT.PHONE_NUMBER_DESC:
        sort = { phoneNumber: -1 };
        break;

      case GET_LIST_USER_SORT.DATE_CREATED_ASC:
        sort = { createdAt: 1 };
        break;

      case GET_LIST_USER_SORT.DATE_CREATED_DESC:
        sort = { createdAt: -1 };
        break;

      case GET_LIST_USER_SORT.ROLE_ASC:
        sort = { role: 1 };
        break;

      case GET_LIST_USER_SORT.ROLE_DESC:
        sort = { role: -1 };
        break;

      case GET_LIST_USER_SORT.USERNAME_ASC:
        sort = { username: 1 };
        break;

      case GET_LIST_USER_SORT.USERNAME_DESC:
        sort = { username: -1 };
        break;

      default:
        break;
    }

    const [users, total] = await Promise.all([
      Users.find({
        $and: [
          {
            $or: [
              { firstName: { $regex: keyword, $options: "i" } },
              { lastName: { $regex: keyword, $options: "i" } },
              { username: { $regex: keyword, $options: "i" } },
              { email: { $regex: keyword, $options: "i" } },
              { phoneNumber: { $regex: keyword, $options: "i" } },
            ],
          },
          {
            username: { $ne: "admin" },
          },
        ],
      })
        .select("-__v -password -resetPasswordCode")
        .sort(sort)
        .limit(limit)
        .skip(skip),
      Users.find({
        $and: [
          {
            $or: [
              { firstName: { $regex: keyword, $options: "i" } },
              { lastName: { $regex: keyword, $options: "i" } },
              { username: { $regex: keyword, $options: "i" } },
              { email: { $regex: keyword, $options: "i" } },
              { phoneNumber: { $regex: keyword, $options: "i" } },
            ],
          },
          {
            username: { $ne: "admin" },
          },
        ],
      }).countDocuments(),
    ]);

    return {
      users,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }

  async warnUser(
    _id: string,
    message: string,
    actor: string
  ): Promise<UserModelInterface> {
    const user = await Users.findByIdAndUpdate(
      _id,
      {
        $push: {
          warning: {
            message,
            createdAt: new Date(),
            createdBy: Types.ObjectId(actor),
          },
          $position: 0,
        },
      },
      { new: true, useFindAndModify: false }
    );

    return user;
  }

  async addFavoriteBook(
    bookId: string,
    actor: string
  ): Promise<UserModelInterface> {
    const user: UserModelInterface = await Users.findByIdAndUpdate(
      actor,
      {
        $push: {
          favorites: {
            book: Types.ObjectId(bookId),
            createdAt: new Date(),
          },
          $position: 0,
        },

        $set: {
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(actor),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return user;
  }

  async removeFavoriteBook(
    bookId: string,
    actor: string
  ): Promise<UserModelInterface> {
    const user: UserModelInterface = await Users.findByIdAndUpdate(
      actor,
      {
        $set: {
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(actor),
        },

        $pull: {
          favorites: {
            book: Types.ObjectId(bookId),
          },
        },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );

    return user;
  }

  async getUserProfile(userId: string): Promise<UserModelInterface> {
    const aggregation = [
      { $match: { _id: Types.ObjectId(userId) } },

      {
        $lookup: {
          from: "books",
          localField: "favorites.book",
          foreignField: "_id",
          as: "favoriteBook",
        },
      },

      {
        $addFields: {
          favorites: {
            $map: {
              input: "$favorites",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    book: {
                      _id: {
                        $arrayElemAt: [
                          "$favoriteBook._id",
                          {
                            $indexOfArray: ["$favoriteBook._id", "$$this.book"],
                          },
                        ],
                      },

                      title: {
                        $arrayElemAt: [
                          "$favoriteBook.title",
                          {
                            $indexOfArray: ["$favoriteBook._id", "$$this.book"],
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          favoriteBook: "$$REMOVE",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "following.user",
          foreignField: "_id",
          as: "followingUsers",
        },
      },

      {
        $addFields: {
          following: {
            $map: {
              input: "$following",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    user: {
                      _id: {
                        $arrayElemAt: [
                          "$followingUsers._id",
                          {
                            $indexOfArray: [
                              "$followingUsers._id",
                              "$$this.user",
                            ],
                          },
                        ],
                      },

                      firstName: {
                        $arrayElemAt: [
                          "$followingUsers.firstName",
                          {
                            $indexOfArray: [
                              "$followingUsers._id",
                              "$$this.user",
                            ],
                          },
                        ],
                      },

                      lastName: {
                        $arrayElemAt: [
                          "$followingUsers.lastName",
                          {
                            $indexOfArray: [
                              "$followingUsers._id",
                              "$$this.user",
                            ],
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          followingUsers: "$$REMOVE",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "followers.user",
          foreignField: "_id",
          as: "followedBy",
        },
      },

      {
        $addFields: {
          followers: {
            $map: {
              input: "$followers",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    user: {
                      _id: {
                        $arrayElemAt: [
                          "$followedBy._id",
                          { $indexOfArray: ["$followedBy._id", "$$this.user"] },
                        ],
                      },

                      firstName: {
                        $arrayElemAt: [
                          "$followedBy.firstName",
                          { $indexOfArray: ["$followedBy._id", "$$this.user"] },
                        ],
                      },

                      lastName: {
                        $arrayElemAt: [
                          "$followedBy.lastName",
                          { $indexOfArray: ["$followedBy._id", "$$this.user"] },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          followedBy: "$$REMOVE",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "warning.createdBy",
          foreignField: "_id",
          as: "warnedBy",
        },
      },

      {
        $addFields: {
          warning: {
            $map: {
              input: "$warning",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    createdBy: {
                      _id: {
                        $arrayElemAt: [
                          "$warnedBy._id",
                          {
                            $indexOfArray: [
                              "$warnedBy._id",
                              "$$this.createdBy",
                            ],
                          },
                        ],
                      },

                      firstName: {
                        $arrayElemAt: [
                          "$warnedBy.firstName",
                          {
                            $indexOfArray: [
                              "$warnedBy._id",
                              "$$this.createdBy",
                            ],
                          },
                        ],
                      },

                      lastName: {
                        $arrayElemAt: [
                          "$warnedBy.lastName",
                          {
                            $indexOfArray: [
                              "$warnedBy._id",
                              "$$this.createdBy",
                            ],
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          warnedBy: "$$REMOVE",
        },
      },

      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          username: 1,
          email: 1,
          avatar: 1,
          status: 1,
          role: 1,
          address: 1,
          dob: 1,
          phoneNumber: 1,
          gender: 1,
          favorites: 1,
          following: 1,
          followers: 1,
          warning: 1,
          createdBy: 1,

          favoritesCount: {
            $cond: {
              if: { $isArray: "$favorites" },
              then: { $size: "$favorites" },
              else: 0,
            },
          },

          followingCount: {
            $cond: {
              if: { $isArray: "$following" },
              then: { $size: "$following" },
              else: 0,
            },
          },

          followersCount: {
            $cond: {
              if: { $isArray: "$followers" },
              then: { $size: "$followers" },
              else: 0,
            },
          },

          warningCount: {
            $cond: {
              if: { $isArray: "$warning" },
              then: { $size: "$warning" },
              else: 0,
            },
          },
        },
      },
    ];

    const user = await Users.aggregate(aggregation);

    return user[0];
  }
}

export default UserService;
