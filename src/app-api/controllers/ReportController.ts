import { Request, Response } from "@app-helpers/http.extends";
import { BookModelInterface } from "@app-repositories/models/Books";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { PostModelInterface } from "@app-repositories/models/Posts";
import {
  REPORT_SCHEMA,
  REPORT_STATUS,
  REPORT_TYPE,
  ReportModelInterface,
} from "@app-repositories/models/Reports";
import { UserModelInterface } from "@app-repositories/models/Users";
import TYPES from "@app-repositories/types";
import BookService from "@app-services/BookService";
import EventService from "@app-services/EventService";
import PostService from "@app-services/PostService";
import ReportService from "@app-services/ReportService";
import UserService from "@app-services/UserService";
import CONSTANTS from "@app-utils/Constants";
import { add } from "date-fns";
import { inject, injectable } from "inversify";

@injectable()
class ReportController {
  @inject(TYPES.ReportService) private readonly reportService: ReportService;
  @inject(TYPES.EventService) private readonly eventService: EventService;
  @inject(TYPES.BookService) private readonly bookService: BookService;
  @inject(TYPES.UserService) private readonly userService: UserService;
  @inject(TYPES.PostService) private readonly postService: PostService;

  async createReport(req: Request, res: Response) {
    try {
      const { title, content, type, schema, schemaId } = req.body;
      const { userId } = req.headers;

      if (schema === REPORT_SCHEMA.books) {
        const book: BookModelInterface = await this.bookService.getBookById(
          schemaId
        );

        if (!book) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
        }
        // to do
        // check post exist
        // else if (schema === REPORT_SCHEMA.POST)
      } else if (schema === REPORT_SCHEMA.users) {
        const user: UserModelInterface = await this.userService.getUserById(
          schemaId
        );

        if (!user) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
        }
      } else if (schema === REPORT_SCHEMA.posts) {
        const post: PostModelInterface = await this.postService.getPostById(
          schemaId
        );

        if (!post) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.POST_NOT_EXIST);
        }
      }

      const existedReport: ReportModelInterface =
        await this.reportService.checkExistReport(schemaId, userId);

      if (existedReport) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.REPORT_ALREADY_SUBMITTED);
      }

      const report: ReportModelInterface =
        await this.reportService.createReport(
          { title, content, type, schema, schemaId },
          userId
        );

      if (!report) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.REPORT,
        action: EVENT_ACTION.CREATE,
        schemaId,
        actor: userId,
        description: "/report/create",
      });

      return res.successRes({ data: report });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async getListReport(req: Request, res: Response) {
    try {
      const { page, limit, sort, keyword } = req.query;
      const { userId } = req.headers;

      const report = await this.reportService.getListReport({
        page: Number(page) - 1,
        limit: Number(limit),
        sort,
        keyword: keyword || "",
      });

      if (!report) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.REPORT,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: userId,
        description: "/report/list",
      });

      return res.successRes({ data: report });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async updateReportStatus(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const { status } = req.body;
      const { userId } = req.headers;

      const report: ReportModelInterface =
        await this.reportService.getReportById(reportId);

      if (!report) {
        return res.errorRes(CONSTANTS.SERVER_ERROR.REPORT_NOT_EXIST);
      }

      const { schema, schemaId, type } = report;

      if (
        type === REPORT_TYPE.REGISTER_FOR_AUTHOR &&
        schema === REPORT_SCHEMA.books
      ) {
        const book: BookModelInterface = await this.bookService.getBookById(
          String(schemaId)
        );

        if (!book) {
          return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
        }

        const updatedReport: ReportModelInterface =
          await this.reportService.handleRegisterForAuthor(
            reportId,
            status,
            userId
          );

        if (!updatedReport) {
          return res.internal({});
        }

        if (status === REPORT_STATUS.APPROVED) {
          const updatedBook: BookModelInterface =
            await this.bookService.showBook(String(book._id), userId);

          if (!updatedBook) {
            return res.internal({});
          }

          const user: UserModelInterface =
            await this.userService.makeUserAuthor(
              String(updatedBook.createdBy)
            );

          if (!user) {
            return res.internal({});
          }
        }

        return res.successRes({ data: {} });
      } else if (type === REPORT_TYPE.REPORT) {
        if (schema === REPORT_SCHEMA.books) {
          const book: BookModelInterface = await this.bookService.getBookById(
            String(schemaId)
          );

          if (!book) {
            const updatedReport: ReportModelInterface =
              await this.reportService.updateReportStatus(
                reportId,
                REPORT_STATUS.RESOLVED,
                userId
              );

            if (!updatedReport) {
              return res.internal({});
            }

            return res.errorRes(CONSTANTS.SERVER_ERROR.BOOK_NOT_EXIST);
          }

          if (status === REPORT_STATUS.APPROVED) {
            const updatedBook: BookModelInterface =
              await this.bookService.hideBook(
                String(book._id),
                String(add(new Date(), { months: 1 })),
                userId
              );

            if (!updatedBook) {
              return res.internal({});
            }

            return res.successRes({ data: {} });
          }
        } else if (schema === REPORT_SCHEMA.users) {
          const user: UserModelInterface = await this.userService.getUserById(
            String(schemaId)
          );

          if (!user) {
            const updatedReport: ReportModelInterface =
              await this.reportService.updateReportStatus(
                reportId,
                REPORT_STATUS.RESOLVED,
                userId
              );

            if (!updatedReport) {
              return res.internal({});
            }

            return res.errorRes(CONSTANTS.SERVER_ERROR.USER_NOT_EXIST);
          } else {
            const updatedUser: UserModelInterface =
              await this.userService.warnUser(
                String(user._id),
                CONSTANTS.WARN_FOR_VIOLATION,
                userId
              );

            if (!updatedUser) {
              return res.internal({});
            }

            return res.successRes({ data: {} });
          }
        }
      }
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default ReportController;
