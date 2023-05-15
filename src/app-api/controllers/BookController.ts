import { Request, Response } from "@app-helpers/http.extends";
import { BookModelInterface } from "@app-repositories/models/Books";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { NOTIFICATION_TYPE } from "@app-repositories/models/Notifications";
import { TopicModelInterface } from "@app-repositories/models/Topics";
import { USER_ROLE, UserModelInterface } from "@app-repositories/models/Users";
import TYPES from "@app-repositories/types";
import BookService from "@app-services/BookService";
import EventService from "@app-services/EventService";
import NotificationService from "@app-services/NotificationService";
import PostService from "@app-services/PostService";
import TopicService from "@app-services/TopicService";
import UserService from "@app-services/UserService";
import CONSTANTS from "@app-utils/Constants";
import { endOfYear, format, getYear, startOfYear, sub } from "date-fns";
import { inject, injectable } from "inversify";

@injectable()
class BookController {
  @inject(TYPES.BookService) private readonly bookService: BookService;
  @inject(TYPES.EventService) private readonly eventService: EventService;
  @inject(TYPES.TopicService) private readonly topicService: TopicService;
  @inject(TYPES.UserService) private readonly userService: UserService;
  @inject(TYPES.PostService) private readonly postService: PostService;
  @inject(TYPES.NotificationService)
  private readonly notificationService: NotificationService;

  async createBook(req: Request, res: Response) {
    try {
      const { userRole } = req.headers;
      const { title, chapters, topics, price } = req.body;

      if (userRole !== USER_ROLE.AUTHOR) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.AUTHOR_ONLY);
      }

      topics.map(async (item: string) => {
        const topic: TopicModelInterface = await this.topicService.getTopicById(
          item
        );

        if (!topic) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.TOPIC_NOT_EXIST);
        }
      });

      const book: BookModelInterface = await this.bookService.createBook(
        { title, chapters, topics, price },
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
      const { userRole } = req.headers;
      const { page, limit, sort, keyword, topics } = req.query;

      const book = await this.bookService.getListBook({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
        keyword: keyword || "",
        filteredBy: { topics: topics || [] },
        isAdmin: userRole === USER_ROLE.ADMIN,
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

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      await this.notificationService.createNotification(userId, {
        content: `${user.firstName} ${user.lastName} added a comment on your book ${updatedBook.title}`,
        schema: EVENT_SCHEMA.BOOK,
        schemaId: String(updatedBook._id),
        receiver: String(updatedBook.createdBy),
        notiType: NOTIFICATION_TYPE.COMMENT,
      });

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

      const likeCount = updatedBook.like.length;
      const dislikeCount = updatedBook.dislike.length;
      const viewCount = updatedBook.views.length;
      const commentCount = updatedBook.comments.length;
      const chapterCount = updatedBook.chapters.length;
      const subscriberCount = updatedBook.subscribedUsers.length;

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.BOOK,
        action: EVENT_ACTION.UPDATE,
        schemaId: bookId,
        actor: req.headers.userId,
        description: "/book/like-dislike",
      });

      return res.successRes({
        data: {
          ...updatedBook,
          likeCount,
          dislikeCount,
          viewCount,
          commentCount,
          chapterCount,
          subscriberCount,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async viewBook(req: Request, res: Response) {
    try {
      const { bookId } = req.params;
      const { userId } = req.headers;

      const book: BookModelInterface = await this.bookService.getBookById(
        bookId
      );

      if (!book || book.hidden.isHidden) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
      }

      const updatedBook: BookModelInterface = await this.bookService.viewBook(
        bookId,
        userId
      );

      if (!updatedBook) {
        return res.internal({});
      }

      const user: UserModelInterface = await this.userService.getUserById(
        userId
      );

      await this.notificationService.createNotification(userId, {
        content: `${user.firstName} ${user.lastName} viewed your book ${book.title}`,
        schema: EVENT_SCHEMA.BOOK,
        schemaId: String(updatedBook._id),
        receiver: String(updatedBook.createdBy),
        notiType: NOTIFICATION_TYPE.VIEW,
      });

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.BOOK,
        action: EVENT_ACTION.UPDATE,
        schemaId: bookId,
        actor: userId,
        description: "/book/view",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async getBookDetail(req: Request, res: Response) {
    try {
      const { bookId } = req.query;

      const user: UserModelInterface = await this.userService.getUserById(
        req.headers.userId
      );

      const book: BookModelInterface = await this.bookService.getBookDetail(
        bookId
      );

      if (!book || (book.hidden.isHidden && user.role !== USER_ROLE.ADMIN)) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
      }

      const likeCount = book.like.length;
      const dislikeCount = book.dislike.length;
      const viewCount = book.views.length;
      const commentCount = book.comments.length;
      const chapterCount = book.chapters.length;
      const subscriberCount = book.subscribedUsers.length;
      const purchaserCount = book.purchaser.length;

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.BOOK,
        action: EVENT_ACTION.READ,
        schemaId: bookId,
        actor: req.headers.userId,
        description: "/book/detail",
      });

      return res.successRes({
        data: {
          ...book,
          likeCount,
          dislikeCount,
          viewCount,
          chapterCount,
          commentCount,
          subscriberCount,
          purchaserCount,
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async adminDashboard(req: Request, res: Response) {
    try {
      const today: Date = new Date();
      const yesterday: Date = sub(today, { days: 1 });
      const todayLastYear: Date = sub(today, { years: 1 });
      const firstDateOfYear: Date = startOfYear(today);
      const todayLastTwoYear: Date = sub(today, { years: 2 });
      const todayLastThreeYear: Date = sub(today, { years: 3 });
      const todayLastFourYear: Date = sub(today, { years: 4 });

      const [
        bookInRecentYear,
        bookInThisYear,
        bookInLastYear,
        bookInLastTwoYear,
        bookInLastThreeYear,
        bookInLastFourYear,
        postToday,
        postYesterday,
        postInThisYear,
        postInLastYear,
      ] = await Promise.all([
        this.bookService.getBookByDate(todayLastYear, today),
        this.bookService.getBookByDate(firstDateOfYear, today),
        this.bookService.getBookByDate(
          startOfYear(todayLastYear),
          endOfYear(todayLastYear)
        ),
        this.bookService.getBookByDate(
          startOfYear(todayLastTwoYear),
          endOfYear(todayLastTwoYear)
        ),
        this.bookService.getBookByDate(
          startOfYear(todayLastThreeYear),
          endOfYear(todayLastThreeYear)
        ),
        this.bookService.getBookByDate(
          startOfYear(todayLastFourYear),
          endOfYear(todayLastFourYear)
        ),
        this.postService.getPostByDate(today, today),
        this.postService.getPostByDate(yesterday, today),
        this.postService.getPostByDate(firstDateOfYear, today),
        this.postService.getPostByDate(
          startOfYear(todayLastYear),
          endOfYear(todayLastYear)
        ),
      ]);

      const [postInLastTwoYear, postInLastThreeYear, postInLastFourYear] =
        await Promise.all([
          this.postService.getPostByDate(
            startOfYear(todayLastTwoYear),
            endOfYear(todayLastTwoYear)
          ),
          this.postService.getPostByDate(
            startOfYear(todayLastThreeYear),
            endOfYear(todayLastThreeYear)
          ),
          this.postService.getPostByDate(
            startOfYear(todayLastFourYear),
            endOfYear(todayLastFourYear)
          ),
        ]);

      if (
        !bookInRecentYear ||
        !bookInThisYear ||
        !bookInLastYear ||
        !bookInLastTwoYear ||
        !bookInLastThreeYear ||
        !bookInLastFourYear ||
        !postToday ||
        !postYesterday ||
        !postInThisYear ||
        !postInLastYear ||
        !postInLastTwoYear ||
        !postInLastThreeYear ||
        !postInLastFourYear
      ) {
        return res.internal({});
      }

      return res.successRes({
        data: {
          numberAuthorByMonth: bookInRecentYear.reduce((prev, cur) => {
            const { updatedBy, createdAt, topics } = cur;

            const month = format(new Date(createdAt), "LLL");

            if (!prev[month]) {
              prev[month] = {
                author: [updatedBy],
                authorCount: 1,
                topics: topics.reduce((prevTopic, curTopic) => {
                  const { _id, name } = curTopic;

                  if (
                    !prevTopic
                      .map((item: any) => String(item._id))
                      .includes(_id)
                  ) {
                    prevTopic.push({ _id, name, bookCount: 1 });
                  } else {
                    prevTopic[
                      prevTopic
                        .map((item: any) => String(item._id))
                        .indexOf(String(_id))
                    ].bookCount += 1;
                  }

                  return prevTopic;
                }, []),
              };
            } else if (
              !prev[month].author
                .map((item: any) => String(item._id))
                .includes(String(updatedBy._id))
            ) {
              prev[month].author.push(updatedBy);
              prev[month].authorCount += 1;
            }

            return prev;
          }, {}),

          totalBookEachYear: [
            {
              year: getYear(today),
              bookCount: bookInThisYear.length,
              postCount: postInThisYear.length,
            },
            {
              year: getYear(todayLastYear),
              bookCount: bookInLastYear.length,
              postCount: postInLastYear.length,
            },
            {
              year: getYear(todayLastTwoYear),
              bookCount: bookInLastTwoYear.length,
              postCount: postInLastTwoYear.length,
            },
            {
              year: getYear(todayLastThreeYear),
              bookCount: bookInLastThreeYear.length,
              postCount: postInLastThreeYear.length,
            },
            {
              year: getYear(todayLastFourYear),
              bookCount: bookInLastFourYear.length,
              postCount: postInLastFourYear.length,
            },
          ],

          todayPostCount: postToday.length,

          yesterdayPostCount: postYesterday.length,

          thisYearPostCount: postInThisYear.length,

          lastYearPostCount: postInLastYear.length,

          interactionCount: bookInRecentYear
            .reduce((prev, cur) => {
              const { topics, like, dislike, views, comments } = cur;

              const likeCount = like.length;
              const dislikeCount = dislike.length;
              const viewsCount = views.length;
              const commentsCount = comments.length;

              topics.forEach((item: any) => {
                const { _id, name } = item;

                if (
                  !prev
                    .map((prevTopic: any) => String(prevTopic._id))
                    .includes(String(_id))
                ) {
                  prev.push({
                    _id,
                    name,
                    likeCount,
                    dislikeCount,
                    viewsCount,
                    commentsCount,
                  });
                } else {
                  const index = prev
                    .map((prevTopic: any) => String(prevTopic._id))
                    .indexOf(String(_id));

                  prev[index].likeCount += likeCount;
                  prev[index].dislikeCount += dislikeCount;
                  prev[index].viewsCount += viewsCount;
                  prev[index].commentsCount += commentsCount;
                }
              });

              return prev;
            }, [])
            .reduce((prev, cur) => {
              const {
                _id,
                name,
                likeCount,
                dislikeCount,
                viewsCount,
                commentsCount,
              } = cur;

              prev.push({ _id, name, type: "likeCount", value: likeCount });
              prev.push({
                _id,
                name,
                type: "dislikeCount",
                value: dislikeCount,
              });
              prev.push({ _id, name, type: "viewsCount", value: viewsCount });
              prev.push({
                _id,
                name,
                type: "commentsCount",
                value: commentsCount,
              });

              return prev;
            }, []),
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default BookController;
