import { injectable } from "inversify";
import { IReportService } from "./interface";
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
}

export default ReportService;
