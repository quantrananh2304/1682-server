import { injectable } from "inversify";
import { GET_LIST_BOOK_SORT, IBookService } from "./interface";
import Books, { BookModelInterface } from "@app-repositories/models/Books";
import { Types } from "mongoose";

@injectable()
class BookService implements IBookService {
  async createBook(
    _book: {
      title: string;
      chapters: { name: string; content: string }[];
      topics: string[];
    },
    actor: string
  ): Promise<BookModelInterface> {
    const { title, chapters, topics } = _book;
    const book: BookModelInterface = await Books.create({
      title,
      chapters: chapters.map((item) => ({ ...item, createdAt: new Date() })),
      like: [],
      dislike: [],
      views: [],
      comments: [],
      topics,
      subscribedUsers: [],
      hidden: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: Types.ObjectId(actor),
      createdBy: Types.ObjectId(actor),
    });

    return book;
  }

  async getBookById(_id: string): Promise<BookModelInterface> {
    const book: BookModelInterface = await Books.findById(_id)
      .select("-__v")
      .populate("topics")
      .populate({ path: "updatedBy", select: "firstName lastName _id" });

    return book;
  }

  async getListBook(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_BOOK_SORT;
    keyword: string;
  }): Promise<{
    books: BookModelInterface[];
    page: number;
    total: number;
    totalPage: number;
  }> {
    const { page, limit, keyword } = filter;

    const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_BOOK_SORT.CHAPTER_ASC:
        sort = { chapterCount: 1 };
        break;

      case GET_LIST_BOOK_SORT.CHAPTER_DESC:
        sort = { chapterCount: -1 };
        break;

      case GET_LIST_BOOK_SORT.COMMENT_ASC:
        sort = { commentCount: 1 };
        break;

      case GET_LIST_BOOK_SORT.COMMENT_DESC:
        sort = { commentCount: -1 };
        break;

      case GET_LIST_BOOK_SORT.DISLIKE_ASC:
        sort = { dislikeCount: 1 };
        break;

      case GET_LIST_BOOK_SORT.DISLIKE_DESC:
        sort = { dislikeCount: -1 };
        break;

      case GET_LIST_BOOK_SORT.LIKE_ASC:
        sort = { likeCount: 1 };
        break;

      case GET_LIST_BOOK_SORT.LIKE_DESC:
        sort = { likeCount: -1 };
        break;

      case GET_LIST_BOOK_SORT.SUBSCRIBED_USER_ASC:
        sort = { subscriberCount: 1 };
        break;

      case GET_LIST_BOOK_SORT.SUBSCRIBED_USER_DESC:
        sort = { subscriberCount: -1 };
        break;

      case GET_LIST_BOOK_SORT.TITLE_ASC:
        sort = { title: 1 };
        break;

      case GET_LIST_BOOK_SORT.TITLE_DESC:
        sort = { title: -1 };
        break;

      case GET_LIST_BOOK_SORT.TOPIC_ASC:
        sort = { topic: 1 };
        break;

      case GET_LIST_BOOK_SORT.TOPIC_DESC:
        sort = { topic: -1 };
        break;

      case GET_LIST_BOOK_SORT.VIEW_ASC:
        sort = { viewCount: 1 };
        break;

      case GET_LIST_BOOK_SORT.VIEW_DESC:
        sort = { viewCount: -1 };
        break;

      default:
        break;
    }

    const aggregation = [
      {
        $match: {
          title: { $regex: keyword, $options: "i" },
          "hidden.isHidden": false,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "like.user",
          foreignField: "_id",
          as: "likedBy",
        },
      },

      {
        $addFields: {
          like: {
            $map: {
              input: "$like",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    user: {
                      _id: {
                        $arrayElemAt: [
                          "$likedBy._id",
                          { $indexOfArray: ["$likedBy._id", "$$this.user"] },
                        ],
                      },

                      firstName: {
                        $arrayElemAt: [
                          "$likedBy.firstName",
                          { $indexOfArray: ["$likedBy._id", "$$this.user"] },
                        ],
                      },

                      lastName: {
                        $arrayElemAt: [
                          "$likedBy.lastName",
                          { $indexOfArray: ["$likedBy._id", "$$this.user"] },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          likedBy: "$$REMOVE",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "dislike.user",
          foreignField: "_id",
          as: "dislikedBy",
        },
      },

      {
        $addFields: {
          dislike: {
            $map: {
              input: "$dislike",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    user: {
                      _id: {
                        $arrayElemAt: [
                          "$dislikedBy._id",
                          { $indexOfArray: ["$dislikedBy._id", "$$this.user"] },
                        ],
                      },

                      firstName: {
                        $arrayElemAt: [
                          "$dislikedBy.firstName",
                          { $indexOfArray: ["$dislikedBy._id", "$$this.user"] },
                        ],
                      },

                      lastName: {
                        $arrayElemAt: [
                          "$dislikedBy.lastName",
                          { $indexOfArray: ["$dislikedBy._id", "$$this.user"] },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          dislikedBy: "$$REMOVE",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "views.user",
          foreignField: "_id",
          as: "viewedBy",
        },
      },

      {
        $addFields: {
          views: {
            $map: {
              input: "$views",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    user: {
                      _id: {
                        $arrayElemAt: [
                          "$viewedBy._id",
                          { $indexOfArray: ["$viewedBy._id", "$$this.user"] },
                        ],
                      },

                      firstName: {
                        $arrayElemAt: [
                          "$viewedBy.firstName",
                          { $indexOfArray: ["$viewedBy._id", "$$this.user"] },
                        ],
                      },

                      lastName: {
                        $arrayElemAt: [
                          "$viewedBy.lastName",
                          { $indexOfArray: ["$viewedBy._id", "$$this.user"] },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          viewedBy: "$$REMOVE",
        },
      },

      {
        $lookup: {
          from: "topics",
          localField: "topics",
          foreignField: "_id",
          as: "topics",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "subscribedUsers.user",
          foreignField: "_id",
          as: "subscribedBy",
        },
      },

      {
        $addFields: {
          subscribedUsers: {
            $map: {
              input: "$subscribedUsers",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    user: {
                      _id: {
                        $arrayElemAt: [
                          "$subscribedBy._id",
                          {
                            $indexOfArray: ["$subscribedBy._id", "$$this.user"],
                          },
                        ],
                      },

                      firstName: {
                        $arrayElemAt: [
                          "$subscribedBy.firstName",
                          {
                            $indexOfArray: ["$subscribedBy._id", "$$this.user"],
                          },
                        ],
                      },

                      lastName: {
                        $arrayElemAt: [
                          "$subscribedBy.lastName",
                          {
                            $indexOfArray: ["$subscribedBy._id", "$$this.user"],
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          subscribedBy: "$$REMOVE",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "comments.createdBy",
          foreignField: "_id",
          as: "commentedBy",
        },
      },

      {
        $addFields: {
          comments: {
            $map: {
              input: "$comments",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    createdBy: {
                      _id: {
                        $arrayElemAt: [
                          "$commentedBy._id",
                          {
                            $indexOfArray: [
                              "$commentedBy._id",
                              "$$this.createdBy",
                            ],
                          },
                        ],
                      },

                      firstName: {
                        $arrayElemAt: [
                          "$commentedBy.firstName",
                          {
                            $indexOfArray: [
                              "$commentedBy._id",
                              "$$this.createdBy",
                            ],
                          },
                        ],
                      },

                      lastName: {
                        $arrayElemAt: [
                          "$commentedBy.lastName",
                          {
                            $indexOfArray: [
                              "$commentedBy._id",
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
          commentedBy: "$$REMOVE",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updatedBy",
          pipeline: [
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
              },
            },
          ],
        },
      },

      {
        $unwind: {
          path: "$updatedBy",
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          chapters: 1,
          like: 1,
          dislike: 1,
          views: 1,
          comments: 1,
          topics: 1,
          subscribedUser: 1,
          hidden: 1,
          updatedBy: 1,
          createdAt: 1,

          chapterCount: {
            $cond: {
              if: { $isArray: "$chapters" },
              then: { $size: "$chapters" },
              else: 0,
            },
          },

          commentCount: {
            $cond: {
              if: { $isArray: "$comments" },
              then: { $size: "$comments" },
              else: 0,
            },
          },

          dislikeCount: {
            $cond: {
              if: { $isArray: "$dislike" },
              then: { $size: "$dislike" },
              else: 0,
            },
          },

          likeCount: {
            $cond: {
              if: { $isArray: "$like" },
              then: { $size: "$like" },
              else: 0,
            },
          },

          subscriberCount: {
            $cond: {
              if: { $isArray: "$subscribedUsers" },
              then: { $size: "$subscribedUsers" },
              else: 0,
            },
          },

          viewCount: {
            $cond: {
              if: { $isArray: "$view" },
              then: { $size: "$view" },
              else: 0,
            },
          },
        },
      },

      { $sort: sort },

      { $limit: limit },

      { $skip: skip },
    ];

    const [books, total] = await Promise.all([
      Books.aggregate(aggregation),
      Books.find({
        title: { $regex: keyword, $options: "i" },
        "hidden.isHidden": false,
      }).countDocuments(),
    ]);

    return {
      books,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }

  async hideBook(
    _id: string,
    hiddenUntil: string,
    actor: string
  ): Promise<BookModelInterface> {
    const book: BookModelInterface = await Books.findByIdAndUpdate(
      _id,
      {
        $set: {
          hidden: {
            isHidden: true,
            hiddenBy: Types.ObjectId(actor),
            hiddenUntil: new Date(hiddenUntil),
          },
          updatedAt: new Date(),
          updatedBy: Types.ObjectId(actor),
        },
      },
      { new: true, useFindAndModify: false }
    );

    return book;
  }

  async commentBook(
    bookId: string,
    content: string,
    actor: string
  ): Promise<BookModelInterface> {
    const book: BookModelInterface = await Books.findByIdAndUpdate(
      bookId,
      {
        $push: {
          comments: {
            content,
            createdBy: Types.ObjectId(actor),
            createdAt: new Date(),
            editHistory: [],
          },
          $position: 0,
        },
      },
      { new: true, useFindAndModify: false }
    );

    return book;
  }

  async editCommentBook(
    bookId: string,
    commentId: string,
    content: string,
    actor: string
  ): Promise<BookModelInterface> {
    const book: BookModelInterface = await this.getBookById(bookId);

    const { comments } = book;

    const tempComment = comments.filter(
      (item) => String(item._id) === commentId
    )[0];

    const updatedBook: BookModelInterface = await Books.findOneAndUpdate(
      {
        _id: Types.ObjectId(bookId),
        comments: {
          $elemMatch: {
            _id: Types.ObjectId(commentId),
            createdBy: Types.ObjectId(actor),
          },
        },
      },
      {
        $set: {
          "comments.$.content": content,
          "comments.$.createdAt": new Date(),
        },

        $push: {
          "comments.$.editHistory": {
            content: tempComment.content,
            createdAt: tempComment.createdAt,
          },
          $position: 0,
        },
      },
      { new: true, useFindAndModify: false }
    );

    return updatedBook;
  }

  async deleteCommentBook(
    bookId: string,
    commentId: string
  ): Promise<BookModelInterface> {
    const book: BookModelInterface = await Books.findOneAndUpdate(
      {
        _id: Types.ObjectId(bookId),
        comments: {
          $elemMatch: {
            _id: Types.ObjectId(commentId),
          },
        },
      },
      {
        $pull: {
          comments: {
            _id: Types.ObjectId(commentId),
          },
        },
      },
      { new: true, useFindAndModify: false }
    );

    return book;
  }

  async likeDislikeBook(
    bookId: string,
    action: "like" | "dislike",
    actor: string
  ): Promise<BookModelInterface> {
    const book: BookModelInterface = await this.getBookById(bookId);

    const { like, dislike } = book;

    let update = {};

    if (action === "like") {
      if (like.map((item) => String(item.user)).includes(actor)) {
        update = {
          $pull: {
            like: {
              user: Types.ObjectId(actor),
            },
          },
        };
      } else {
        update = {
          $push: {
            like: {
              user: Types.ObjectId(actor),
              createdAt: new Date(),
            },
          },

          $pull: {
            dislike: {
              user: Types.ObjectId(actor),
            },
          },
        };
      }
    } else {
      if (dislike.map((item) => String(item.user)).includes(actor)) {
        update = {
          $pull: {
            dislike: {
              user: Types.ObjectId(actor),
            },
          },
        };
      } else {
        update = {
          $push: {
            dislike: {
              user: Types.ObjectId(actor),
              createdAt: new Date(),
            },
          },

          $pull: {
            like: {
              user: Types.ObjectId(actor),
            },
          },
        };
      }
    }

    const updatedBook: BookModelInterface = await Books.findByIdAndUpdate(
      bookId,
      update,
      { new: true, useFindAndModify: false }
    )
      .populate({ path: "like.user", select: "firstName lastName _id avatar" })
      .populate({
        path: "dislike.user",
        select: "firstName lastName _id avatar",
      })
      .populate({
        path: "comments.createdBy",
        select: "firstName lastName _id avatar",
      })
      .populate({
        path: "views.user",
        select: "firstName lastName _id avatar",
      })
      .populate({
        path: "subscribedUsers.user",
        select: "firstName lastName _id avatar",
      })
      .populate({ path: "updatedBy", select: "firstName lastName _id avatar" })
      .populate({ path: "topics", select: "name note _id" })
      .lean();

    return updatedBook;
  }

  async viewBook(bookId: string, actor: string): Promise<BookModelInterface> {
    const book: BookModelInterface = await Books.findByIdAndUpdate(
      bookId,
      {
        $push: {
          views: {
            user: Types.ObjectId(actor),
            createdAt: new Date(),
          },
          $position: 0,
        },
      },
      { new: true, useFindAndModify: false }
    );

    return book;
  }
}

export default BookService;
