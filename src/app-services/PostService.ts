import { injectable } from "inversify";
import { IPostService } from "./interface";
import Posts, { PostModelInterface } from "@app-repositories/models/Posts";
import { Types } from "mongoose";

@injectable()
class PostService implements IPostService {
  async createPost(
    _post: { content: string; images: string[] },
    actor: string
  ): Promise<PostModelInterface> {
    const { content, images } = _post;

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
    });

    return post;
  }
}

export default PostService;
