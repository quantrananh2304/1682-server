import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { NOTIFICATION_TYPE } from "@app-repositories/models/Notifications";
import { PostModelInterface } from "@app-repositories/models/Posts";
import { USER_ROLE, UserModelInterface } from "@app-repositories/models/Users";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import NotificationService from "@app-services/NotificationService";
import PostService from "@app-services/PostService";
import UserService from "@app-services/UserService";
import CONSTANTS from "@app-utils/Constants";
import { inject, injectable } from "inversify";

@injectable()
class PostController {
  @inject(TYPES.PostService) private readonly postService: PostService;
  @inject(TYPES.EventService) private readonly eventService: EventService;
  @inject(TYPES.UserService) private readonly userService: UserService;
  @inject(TYPES.NotificationService)
  private readonly notificationService: NotificationService;

  async createPost(req: Request, res: Response) {
    try {
      const { content, images, isAnonymous } = req.body;

      const post: PostModelInterface = await this.postService.createPost(
        { content, images, isAnonymous },
        req.headers.userId
      );

      if (!post) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.CREATE,
        schemaId: String(post._id),
        actor: req.headers.userId,
        description: "/post/create",
      });

      return res.successRes({ data: post });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async editPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { content, images } = req.body;
      const { userId } = req.headers;

      const post: PostModelInterface = await this.postService.getPostById(
        postId
      );

      if (!post || post.hidden.isHidden) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.POST_NOT_EXIST);
      }

      const { createdBy } = post;

      if (String(createdBy) !== userId) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_UPDATE_OTHER_POST);
      }

      const updatedPost: PostModelInterface = await this.postService.editPost(
        postId,
        { content, images },
        userId
      );

      if (!updatedPost) {
        return res.internal({});
      }

      const likeCount = updatedPost.like.length;
      const dislikeCount = updatedPost.dislike.length;
      const viewCount = updatedPost.views.length;
      const commentCount = updatedPost.comments.length;

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.UPDATE,
        schemaId: postId,
        actor: userId,
        description: "/post/update",
      });

      return res.successRes({
        data: {
          ...updatedPost,
          likeCount,
          dislikeCount,
          viewCount,
          commentCount,
          updatedBy: updatedPost.isAnonymous ? {} : updatedPost.updatedBy,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async getListPost(req: Request, res: Response) {
    try {
      const { page, limit, sort, keyword } = req.query;

      const post = await this.postService.getListPost({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
        keyword: keyword || "",
      });

      if (!post) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: req.headers.userId,
        description: "/post/list",
      });

      return res.successRes({
        data: {
          ...post,
          posts: post.posts.map((item) => {
            return {
              ...item,
              updatedBy: item.isAnonymous ? {} : item.updatedBy,
            };
          }),
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async commentPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const { userId } = req.headers;

      const post: PostModelInterface = await this.postService.getPostById(
        postId
      );

      if (!post || post.hidden.isHidden) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.POST_NOT_EXIST);
      }

      const updatedPost: PostModelInterface =
        await this.postService.commentPost(postId, content, userId);

      if (!updatedPost) {
        return res.internal({});
      }

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      await this.notificationService.createNotification(userId, {
        content: `${user.firstName} ${
          user.lastName
        } added a comment on your post: "${
          updatedPost.content && updatedPost.content.length > 3
            ? updatedPost.content.split(" ")[0] +
              " " +
              updatedPost.content.split(" ")[1] +
              " " +
              updatedPost.content.split(" ")[2] +
              "..."
            : updatedPost.content.length <= 3
            ? updatedPost.content
            : ""
        }"`,
        schema: EVENT_SCHEMA.POST,
        schemaId: String(updatedPost._id),
        receiver: String(updatedPost.createdBy),
        notiType: NOTIFICATION_TYPE.COMMENT,
      });

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.UPDATE,
        schemaId: postId,
        actor: userId,
        description: "/post/comment",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async editComment(req: Request, res: Response) {
    try {
      const { postId, commentId } = req.params;
      const { content } = req.body;
      const { userId } = req.headers;

      const post: PostModelInterface = await this.postService.getPostById(
        postId
      );

      if (!post || post.hidden.isHidden) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.POST_NOT_EXIST);
      }

      const { comments } = post;

      const matchedComment = comments.filter(
        (item) => String(item._id) === commentId
      )[0];

      if (!matchedComment) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.COMMENT_NOT_EXIST);
      }

      if (String(matchedComment.createdBy) !== userId) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_EDIT_OTHER_COMMENT);
      }

      const updatedPost: PostModelInterface =
        await this.postService.editCommentPost(
          postId,
          commentId,
          content,
          userId
        );

      if (!updatedPost) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.UPDATE,
        schemaId: postId,
        actor: userId,
        description: "/post/edit-comment",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { postId, commentId } = req.params;
      const { userId, userRole } = req.headers;

      const post: PostModelInterface = await this.postService.getPostById(
        postId
      );

      if (
        !post ||
        (post.hidden.isHidden &&
          userRole !== USER_ROLE.ADMIN &&
          String(post.createdBy) !== userId)
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.POST_NOT_EXIST);
      }

      const { comments } = post;

      const matchedComment = comments.filter(
        (item) => String(item._id) === commentId
      )[0];

      if (!matchedComment) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.COMMENT_NOT_EXIST);
      }

      if (
        userRole !== USER_ROLE.ADMIN &&
        String(matchedComment.createdBy) !== userId &&
        String(post.createdBy) !== userId
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_DELETE_OTHER_COMMENT);
      }

      const updatedPost: PostModelInterface =
        await this.postService.deleteCommentPost(postId, commentId);

      if (!updatedPost) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.DELETE,
        schemaId: postId,
        actor: userId,
        description: "/post/delete-comment",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async likeDislikePost(req: Request, res: Response) {
    try {
      const { postId, action } = req.params;

      const post: PostModelInterface = await this.postService.getPostById(
        postId
      );

      if (!post || post.hidden.isHidden) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.POST_NOT_EXIST);
      }

      const updatedPost: PostModelInterface =
        await this.postService.likeDislikePost(
          postId,
          action,
          req.headers.userId
        );

      if (!updatedPost) {
        return res.internal({});
      }

      const likeCount = updatedPost.like.length;
      const dislikeCount = updatedPost.dislike.length;
      const viewCount = updatedPost.views.length;
      const commentCount = updatedPost.comments.length;

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.UPDATE,
        schemaId: postId,
        actor: req.headers.userId,
        description: "/post/like-dislike",
      });

      return res.successRes({
        data: {
          ...updatedPost,
          likeCount,
          dislikeCount,
          viewCount,
          commentCount,
          updatedBy: updatedPost.isAnonymous ? {} : updatedPost.updatedBy,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async viewPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { userId } = req.headers;

      const post: PostModelInterface = await this.postService.getPostById(
        postId
      );

      if (!post || post.hidden.isHidden) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.POST_NOT_EXIST);
      }

      const updatedPost: PostModelInterface = await this.postService.viewPost(
        postId,
        userId
      );

      if (!updatedPost) {
        return res.internal({});
      }

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      await this.notificationService.createNotification(userId, {
        content: `${user.firstName} ${user.lastName} disliked your post: "${
          updatedPost.content && updatedPost.content.length > 3
            ? updatedPost.content.split(" ")[0] +
              " " +
              updatedPost.content.split(" ")[1] +
              " " +
              updatedPost.content.split(" ")[2] +
              "..."
            : updatedPost.content.length <= 3
            ? updatedPost.content
            : ""
        }"`,
        schema: EVENT_SCHEMA.POST,
        schemaId: String(updatedPost._id),
        receiver: String(updatedPost.createdBy),
        notiType: NOTIFICATION_TYPE.VIEW,
      });

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.UPDATE,
        schemaId: postId,
        actor: userId,
        description: "/post/view",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async getPostDetail(req: Request, res: Response) {
    try {
      const { postId } = req.query;
      const { userId } = req.headers;

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      const post: PostModelInterface = await this.postService.getPostDetail(
        postId
      );

      if (!post || (post.hidden.isHidden && user.role !== USER_ROLE.ADMIN)) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.POST_NOT_EXIST);
      }

      const likeCount = post.like.length;
      const dislikeCount = post.dislike.length;
      const viewCount = post.views.length;
      const commentCount = post.comments.length;

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.READ,
        schemaId: postId,
        actor: userId,
        description: "/post/detail",
      });

      return res.successRes({
        data: {
          ...post,
          likeCount,
          dislikeCount,
          viewCount,
          commentCount,
          updatedBy: post.isAnonymous ? {} : post.updatedBy,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default PostController;
