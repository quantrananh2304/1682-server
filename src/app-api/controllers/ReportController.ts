import { Request, Response } from "@app-helpers/http.extends";
import { BookModelInterface } from "@app-repositories/models/Books";
import { EVENT_ACTION } from "@app-repositories/models/Events";
import {
  REPORT_SCHEMA,
  ReportModelInterface,
} from "@app-repositories/models/Reports";
import { UserModelInterface } from "@app-repositories/models/Users";
import TYPES from "@app-repositories/types";
import BookService from "@app-services/BookService";
import EventService from "@app-services/EventService";
import ReportService from "@app-services/ReportService";
import UserService from "@app-services/UserService";
import CONSTANTS from "@app-utils/Constants";
import { inject, injectable } from "inversify";

@injectable()
class ReportController {
  @inject(TYPES.ReportService) private readonly reportService: ReportService;
  @inject(TYPES.EventService) private readonly eventService: EventService;
  @inject(TYPES.BookService) private readonly bookService: BookService;
  @inject(TYPES.UserService) private readonly userService: UserService;

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
        schema,
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
}

export default ReportController;
