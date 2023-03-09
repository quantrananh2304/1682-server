import { Request, Response } from "@app-helpers/http.extends";
import { BookModelInterface } from "@app-repositories/models/Books";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { TopicModelInterface } from "@app-repositories/models/Topics";
import { USER_ROLE } from "@app-repositories/models/Users";
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

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.BOOK,
        action: EVENT_ACTION.CREATE,
        schemaId: String(book._id),
        actor: String(req.headers.userId),
        description: "/book/create",
      });

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

  async getListBook(req: Request, res: Response) {
    try {
      const { page, limit, sort, keyword } = req.query;

      const book = await this.bookService.getListBook({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
        keyword: keyword || "",
      });

      if (!book) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.BOOK,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: String(req.headers.userId),
        description: "/book/list",
      });

      return res.successRes({ data: book });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async hideBook(req: Request, res: Response) {
    try {
      const { bookId } = req.params;
      const { hiddenUntil } = req.body;
      const { userId, userRole } = req.headers;

      const book: BookModelInterface = await this.bookService.getBookById(
        bookId
      );

      if (!book) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
      }

      const { createdBy } = book;

      if (userRole !== USER_ROLE.ADMIN && userId !== String(createdBy)) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_UPDATE_OTHER_BOOK);
      }

      const data: BookModelInterface = await this.bookService.hideBook(
        bookId,
        hiddenUntil,
        userId
      );

      if (!data) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.BOOK,
        action: EVENT_ACTION.UPDATE,
        schemaId: String(data._id),
        actor: userId,
        description: "/book/hide",
      });

      return res.successRes({ data });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async commentBook(req: Request, res: Response) {
    try {
      const { bookId } = req.params;
      const { content } = req.body;
      const { userId } = req.headers;

      const book: BookModelInterface = await this.bookService.getBookById(
        bookId
      );

      if (!book || book.hidden.isHidden) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
      }

      const updatedBook: BookModelInterface =
        await this.bookService.commentBook(bookId, content, userId);

      if (!updatedBook) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.BOOK,
        action: EVENT_ACTION.UPDATE,
        schemaId: bookId,
        actor: userId,
        description: "/book/comment",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async editComment(req: Request, res: Response) {
    try {
      const { bookId, commentId } = req.params;
      const { content } = req.body;
      const { userId } = req.headers;

      const book: BookModelInterface = await this.bookService.getBookById(
        bookId
      );

      if (!book || book.hidden.isHidden) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
      }

      const { comments } = book;

      const matchedComment = comments.filter(
        (item) => String(item._id) === commentId
      )[0];

      if (!matchedComment) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.COMMENT_NOT_EXIST);
      }

      if (String(matchedComment.createdBy) !== userId) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_EDIT_OTHER_COMMENT);
      }

      const updatedBook: BookModelInterface =
        await this.bookService.editCommentBook(
          bookId,
          commentId,
          content,
          userId
        );

      if (!updatedBook) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.BOOK,
        action: EVENT_ACTION.UPDATE,
        schemaId: bookId,
        actor: userId,
        description: "/book/edit-comment",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { bookId, commentId } = req.params;
      const { userId, userRole } = req.headers;

      const book: BookModelInterface = await this.bookService.getBookById(
        bookId
      );

      if (
        !book ||
        (book.hidden.isHidden &&
          userRole !== USER_ROLE.ADMIN &&
          String(book.createdBy) !== userId)
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
      }

      const { comments } = book;

      const matchedComment = comments.filter(
        (item) => String(item._id) === commentId
      )[0];

      if (!matchedComment) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.COMMENT_NOT_EXIST);
      }

      if (
        userRole !== USER_ROLE.ADMIN &&
        String(book.createdBy) !== userId &&
        String(matchedComment.createdBy) !== userId
      ) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.CANNOT_DELETE_OTHER_COMMENT);
      }

      const updatedBook: BookModelInterface =
        await this.bookService.deleteCommentBook(bookId, commentId);

      if (!updatedBook) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.BOOK,
        action: EVENT_ACTION.UPDATE,
        schemaId: bookId,
        actor: userId,
        description: "/book/delete-comment",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async likeDislikeBook(req: Request, res: Response) {
    try {
      const { bookId, action } = req.params;

      const book: BookModelInterface = await this.bookService.getBookById(
        bookId
      );

      if (!book || book.hidden.isHidden) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
      }

      const updatedBook: BookModelInterface =
        await this.bookService.likeDislikeBook(
          bookId,
          action,
          req.headers.userId
        );

      if (!updatedBook) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.BOOK,
        action: EVENT_ACTION.UPDATE,
        schemaId: bookId,
        actor: req.headers.userId,
        description: "/book/like-dislike",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default BookController;
