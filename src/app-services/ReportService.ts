import { injectable } from "inversify";
import { GET_LIST_REPORT_SORT, IReportService } from "./interface";
import Reports, {
  REPORT_TYPE,
  REPORT_SCHEMA,
  ReportModelInterface,
  REPORT_STATUS,
} from "@app-repositories/models/Reports";
import { Types } from "mongoose";

@injectable()
class ReportService implements IReportService {
  async createReport(
    _report: {
      title: string;
      content: string;
      type: REPORT_TYPE;
      schema: REPORT_SCHEMA;
      schemaId: string;
    },
    actor: string
  ): Promise<ReportModelInterface> {
    const { title, content, type, schema, schemaId } = _report;

    const report: ReportModelInterface = await Reports.create({
      title,
      content,
      type,
      schema,
      schemaId: Types.ObjectId(schemaId),
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: Types.ObjectId(actor),
      createdBy: Types.ObjectId(actor),
      status: REPORT_STATUS.PENDING,
    });

    return report;
  }

  async checkExistReport(
    schemaId: string,
    actor: string
  ): Promise<ReportModelInterface> {
    const report: ReportModelInterface = await Reports.findOne({
      schemaId: Types.ObjectId(schemaId),
      createdBy: Types.ObjectId(actor),
    });

    return report;
  }

  async getListReport(filter: {
    page: number;
    limit: number;
    sort: GET_LIST_REPORT_SORT;
    keyword: string;
  }): Promise<{
    reports: ReportModelInterface[];
    page: number;
    total: number;
    totalPage: number;
  }> {
    const { page, limit, keyword } = filter;

    const skip = page * limit;

    let sort = {};

    switch (filter.sort) {
      case GET_LIST_REPORT_SORT.DATE_CREATED_ASC:
        sort = { createdAt: 1 };
        break;

      case GET_LIST_REPORT_SORT.DATE_CREATED_DESC:
        sort = { createdAt: -1 };
        break;

      case GET_LIST_REPORT_SORT.SCHEMA_ASC:
        sort = { schema: 1 };
        break;

      case GET_LIST_REPORT_SORT.SCHEMA_DESC:
        sort = { schema: -1 };
        break;

      case GET_LIST_REPORT_SORT.STATUS_ASC:
        sort = { status: 1 };
        break;

      case GET_LIST_REPORT_SORT.STATUS_DESC:
        sort = { status: -1 };
        break;

      case GET_LIST_REPORT_SORT.TITLE_ASC:
        sort = { title: 1 };
        break;

      case GET_LIST_REPORT_SORT.TITLE_DESC:
        sort = { title: -1 };
        break;

      case GET_LIST_REPORT_SORT.TYPE_ASC:
        sort = { type: 1 };
        break;

      case GET_LIST_REPORT_SORT.TYPE_DESC:
        sort = { type: -1 };
        break;

      default:
        break;
    }

    const [reports, total] = await Promise.all([
      Reports.find({
        $or: [
          {
            title: { $regex: keyword, $options: "i" },
            content: { $regex: keyword, $options: "i" },
            schema: { $regex: keyword, $options: "i" },
            status: { $regex: keyword, $options: "i" },
          },
        ],
      })
        .populate("schemaId")
        .populate({ path: "createdBy", select: "firstName lastName _id" })
        .sort(sort)
        .limit(limit)
        .skip(skip),

      Reports.find({
        $or: [
          {
            title: { $regex: keyword, $options: "i" },
            content: { $regex: keyword, $options: "i" },
            schema: { $regex: keyword, $options: "i" },
            status: { $regex: keyword, $options: "i" },
          },
        ],
      }).countDocuments(),
    ]);

    return {
      reports,
      total,
      page: page + 1,
      totalPage:
        total % limit === 0 ? total / limit : Math.floor(total / limit) + 1,
    };
  }
}

export default ReportService;
