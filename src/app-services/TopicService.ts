import { injectable } from "inversify";
import { GET_LIST_TOPIC_SORT, ITopicService } from "./interface";
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

  async getListTopic(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_TOPIC_SORT;
    keyword: string;
  }): Promise<{
    topics: TopicModelInterface[];
    page: number;
    total: number;
    totalPage: number;
  }> {
    const { page, limit, keyword } = filter;

    const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_TOPIC_SORT.NAME_ASC:
        sort = { name: 1 };
        break;

      case GET_LIST_TOPIC_SORT.NAME_DESC:
        sort = { name: -1 };
        break;

      case GET_LIST_TOPIC_SORT.DATE_CREATED_ASC:
        sort = { createdAt: 1 };
        break;

      case GET_LIST_TOPIC_SORT.DATE_CREATED_DESC:
        sort = { createdAt: -1 };
        break;

      default:
        break;
    }

    const [topics, total] = await Promise.all([
      Topics.find({ name: { $regex: keyword, $options: "i" } })
        .sort(sort)
        .limit(limit)
        .skip(skip),
      Topics.find({
        name: { $regex: keyword, $options: "i" },
      }).countDocuments(),
    ]);

    return {
      topics,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }
}

export default TopicService;
