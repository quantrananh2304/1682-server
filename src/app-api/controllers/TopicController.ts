import { Request, Response } from "@app-helpers/http.extends";
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

      return res.successRes({ data });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default TopicController;
