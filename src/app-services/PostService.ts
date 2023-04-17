import { injectable } from "inversify";
import { GET_LIST_POST_SORT, IPostService } from "./interface";
import Posts, { PostModelInterface } from "@app-repositories/models/Posts";
import { Types } from "mongoose";

@injectable()
class PostService implements IPostService {
  async createPost(
    _post: {
      content: string;
      images: Array<{ url: string; name: string; contentType: string }>;
      isAnonymous: boolean;
    },
    actor: string
  ): Promise<PostModelInterface> {
    const { content, images, isAnonymous } = _post;

    const post: PostModelInterface = await Posts.create({
      content,
      like: [],
      dislike: [],
      views: [],
      comments: [],
      editHistory: [],
      images,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: Types.ObjectId(actor),
      updatedBy: Types.ObjectId(actor),
      hidden: {
        isHidden: false,
        hiddenBy: null,
        hiddenUntil: null,
      },
      isAnonymous,
    });

    return post;
  }

  async editPost(
    _id: string,
    _post: {
      content: string;
      images: Array<{ contentType: string; url: string; name: string }>;
    },
    actor: string
  ): Promise<PostModelInterface> {
    const post: PostModelInterface = await this.getPostById(_id);

    const { content, updatedAt } = post;

    const updatedPost: PostModelInterface = await Posts.findByIdAndUpdate(
      _id,
      {
        $set: {
          ..._post,
          updatedBy: Types.ObjectId(actor),
          updatedAt: new Date(),
        },

        $push: {
          editHistory: {
            content,
            updatedAt,
          },
          $position: 0,
        },
      },
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
      .populate({ path: "updatedBy", select: "firstName lastName _id avatar" })
      .lean();

    return updatedPost;
  }

  async getPostById(_id: string): Promise<PostModelInterface> {
    const post: PostModelInterface = await Posts.findById(_id).lean();

    return post;
  }

  async getListPost(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_POST_SORT;
    keyword: string;
  }): Promise<{
    posts: PostModelInterface[];
    page: number;
    total: number;
    totalPage: number;
  }> {
    const { page, limit, keyword } = filter;

    const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_POST_SORT.COMMENT_ASC:
        sort = { commentCount: 1 };
        break;

      case GET_LIST_POST_SORT.COMMENT_DESC:
        sort = { commentCount: -1 };
        break;

      case GET_LIST_POST_SORT.DATE_CREATED_ASC:
        sort = { createdAt: 1 };
        break;

      case GET_LIST_POST_SORT.DATE_CREATED_DESC:
        sort = { createdAt: -1 };
        break;

      case GET_LIST_POST_SORT.DISLIKE_ASC:
        sort = { dislikeCount: 1 };
        break;

      case GET_LIST_POST_SORT.DISLIKE_DESC:
        sort = { dislikeCount: -1 };
        break;

      case GET_LIST_POST_SORT.LIKE_ASC:
        sort = { likeCount: 1 };
        break;

      case GET_LIST_POST_SORT.LIKE_DESC:
        sort = { likeCount: -1 };
        break;

      case GET_LIST_POST_SORT.VIEW_ASC:
        sort = { viewCount: 1 };
        break;

      case GET_LIST_POST_SORT.VIEW_DESC:
        sort = { viewCount: -1 };
        break;

      default:
        break;
    }

    const aggregation = [
      {
        $match: {
          content: { $regex: keyword, $options: "i" },
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
          like: 1,
          dislike: 1,
          views: 1,
          comments: 1,
          hidden: 1,
          updatedBy: 1,
          createdAt: 1,
          content: 1,
          images: 1,
          editHistory: 1,

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

          viewCount: {
            $cond: {
              if: { $isArray: "$views" },
              then: { $size: "$views" },
              else: 0,
            },
          },
        },
      },

      { $sort: sort },

      { $limit: limit },

      { $skip: skip },
    ];

    const [posts, total] = await Promise.all([
      Posts.aggregate(aggregation),
      Posts.find({
        content: { $regex: keyword, $options: "i" },
        "hidden.isHidden": false,
      }).countDocuments(),
    ]);

    return {
      posts,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }

  async commentPost(
    postId: string,
    content: string,
    actor: string
  ): Promise<PostModelInterface> {
    const post: PostModelInterface = await Posts.findByIdAndUpdate(
      postId,
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

    return post;
  }

  async editCommentPost(
    postId: string,
    commentId: string,
    content: string,
    actor: string
  ): Promise<PostModelInterface> {
    const post: PostModelInterface = await this.getPostById(postId);

    const { comments } = post;

    const tempComment = comments.filter(
      (item) => String(item._id) === commentId
    )[0];

    const updatedPost: PostModelInterface = await Posts.findOneAndUpdate(
      {
        _id: Types.ObjectId(postId),
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

    return updatedPost;
  }

  async deleteCommentPost(
    postId: string,
    commentId: string
  ): Promise<PostModelInterface> {
    const post: PostModelInterface = await Posts.findOneAndUpdate(
      {
        _id: Types.ObjectId(postId),
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

    return post;
  }

  async likeDislikePost(
    postId: string,
    action: "like" | "dislike",
    actor: string
  ): Promise<PostModelInterface> {
    const post: PostModelInterface = await this.getPostById(postId);

    const { like, dislike } = post;

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

    const updatedPost: PostModelInterface = await Posts.findByIdAndUpdate(
      postId,
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
      .populate({ path: "updatedBy", select: "firstName lastName _id avatar" })
      .lean();

    return updatedPost;
  }

  async viewPost(postId: string, actor: string): Promise<PostModelInterface> {
    const post: PostModelInterface = await Posts.findByIdAndUpdate(
      postId,
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

    return post;
  }

  async getPostDetail(postId: string): Promise<PostModelInterface> {
    const post: PostModelInterface = await Posts.findById(postId)
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
      .populate({ path: "updatedBy", select: "firstName lastName _id avatar" })
      .lean();

    return post;
  }

  async getListPostByUserId(userId: string): Promise<PostModelInterface[]> {
    const aggregation = [
      {
        $match: {
          updatedBy: Types.ObjectId(userId),
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
          like: 1,
          dislike: 1,
          views: 1,
          comments: 1,
          hidden: 1,
          updatedBy: 1,
          createdAt: 1,
          content: 1,
          images: 1,
          editHistory: 1,

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

          viewCount: {
            $cond: {
              if: { $isArray: "$views" },
              then: { $size: "$views" },
              else: 0,
            },
          },
        },
      },

      { $sort: { createdAt: 1 } },
    ];

    const posts = await Posts.aggregate(aggregation);

    return posts;
  }
}

export default PostService;
