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

  async editPost(
    _id: string,
    _post: { content: string; images: string[] },
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
    );

    return updatedPost;
  }

  async getPostById(_id: string): Promise<PostModelInterface> {
    const post: PostModelInterface = await Posts.findById(_id).lean();

    return post;
  }
}

export default PostService;
