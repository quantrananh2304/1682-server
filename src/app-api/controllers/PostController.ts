import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { PostModelInterface } from "@app-repositories/models/Posts";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import PostService from "@app-services/PostService";
import CONSTANTS from "@app-utils/Constants";
import { inject, injectable } from "inversify";

@injectable()
class PostController {
  @inject(TYPES.PostService) private readonly postService: PostService;
  @inject(TYPES.EventService) private readonly eventService: EventService;

  async createPost(req: Request, res: Response) {
    try {
      const { content, images } = req.body;

      const post: PostModelInterface = await this.postService.createPost(
        { content, images },
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

      if (!post) {
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

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.UPDATE,
        schemaId: postId,
        actor: userId,
        description: "/post/update",
      });

      return res.successRes({ data: updatedPost });
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

      return res.successRes({ data: post });
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

      if (!String(matchedComment.createdBy) === userId) {
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

      if (!String(matchedComment.createdBy) === userId) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_DELETE_OTHER_COMMENT);
      }

      const updatedPost: PostModelInterface =
        await this.postService.deleteCommentPost(postId, commentId, userId);

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

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.POST,
        action: EVENT_ACTION.UPDATE,
        schemaId: postId,
        actor: req.headers.userId,
        description: "/post/like-dislike",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default PostController;
