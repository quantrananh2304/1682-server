import { Request, Response } from "@app-helpers/http.extends";
import { BookModelInterface } from "@app-repositories/models/Books";
import { TopicModelInterface } from "@app-repositories/models/Topics";
import TYPES from "@app-repositories/types";
import BookService from "@app-services/BookService";
import EventService from "@app-services/EventService";
import TopicService from "@app-services/TopicService";
import CONSTANTS from "@app-utils/Constants";
import { inject, injectable } from "inversify";

@injectable()
class BookController {
  @inject(TYPES.BookService) private readonly bookService: BookService;
  @inject(TYPES.EventService) private readonly eventService: EventService;
  @inject(TYPES.TopicService) private readonly topicService: TopicService;

  async createBook(req: Request, res: Response) {
    try {
      const { title, chapters, topics } = req.body;

      topics.map(async (item: string) => {
        const topic: TopicModelInterface = await this.topicService.getTopicById(
          item
        );

        if (!topic) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.TOPIC_NOT_EXIST);
        }
      });

      const book: BookModelInterface = await this.bookService.createBook(
        { title, chapters, topics },
        req.headers.userId
      );

      if (!book) {
        return res.internal({});
      }

      const data: BookModelInterface = await this.bookService.getBookById(
        String(book._id)
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

export default BookController;
