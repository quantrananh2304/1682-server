import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { PostModelInterface } from "@app-repositories/models/Posts";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import PostService from "@app-services/PostService";
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
}

export default PostController;
