import { injectable } from "inversify";
import { ITopicService } from "./interface";
import Topics, { TopicModelInterface } from "@app-repositories/models/Topics";
import { Types } from "mongoose";

@injectable()
class TopicService implements ITopicService {
  async createTopic(
    _topic: { name: string; note: string },
    actor: string
  ): Promise<TopicModelInterface> {
    const topic: TopicModelInterface = await Topics.create({
      ..._topic,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: Types.ObjectId(actor),
    });

    return topic;
  }

  async getTopicByName(name: string): Promise<TopicModelInterface> {
    const topic: TopicModelInterface = await Topics.findOne({ name });

    return topic;
  }
}

export default TopicService;
