import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { TopicModelInterface } from "@app-repositories/models/Topics";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import TopicService from "@app-services/TopicService";
import CONSTANTS from "@app-utils/Constants";
import { inject, injectable } from "inversify";

@injectable()
class TopicController {
  @inject(TYPES.TopicService) private readonly topicService: TopicService;
  @inject(TYPES.EventService) private readonly eventService: EventService;

  async createTopic(req: Request, res: Response) {
    try {
      const { name, note } = req.body;

      const topic: TopicModelInterface = await this.topicService.getTopicByName(
        name
      );

      if (topic) {
        return CONSTANTS.SERVER_ERROR.TOPIC_EXISTED;
      }

      const data: TopicModelInterface = await this.topicService.createTopic(
        { name, note },
        req.headers.userId
      );

      if (!data) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.TOPIC,
        action: EVENT_ACTION.CREATE,
        schemaId: String(data._id),
        actor: String(req.headers.userId),
        description: "/topic/create",
      });

      return res.successRes({ data });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async getListTopic(req: Request, res: Response) {
    try {
      const { page, limit, sort, keyword } = req.query;

      const topic = await this.topicService.getListTopic({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
        keyword: keyword || "",
      });

      if (!topic) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.TOPIC,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: String(req.headers.userId),
        description: "/topic/list",
      });

      return res.successRes({ data: topic });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default TopicController;
