import { SOURCE, EMAIL_USER, GOOGLE_APP_PASSWORD } from "@app-configs";
import { ServerError } from "@app-utils/ServerError";
import CONSTANTS from "@app-utils/Constants";
import { injectable } from "inversify";
import nodemailer = require("nodemailer");

@injectable()
class NodeMailer {
  async nodeMailer() {
    try {
      //gmail
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        // config mail server
        auth: {
          user: EMAIL_USER, // email address
          pass: GOOGLE_APP_PASSWORD, // email app password
        },
      });

      return transporter;
    } catch (error) {
      console.log("error", error);
      throw new ServerError(
        CONSTANTS.SERVER_ERROR.INTERNAL_EMAIL_ERROR.errorCode,
        CONSTANTS.SERVER_ERROR.INTERNAL_EMAIL_ERROR.message
      );
    }
  }

  async nodeMailerSendMail(
    toAddresses: string[],
    subject: string,
    body: string
  ) {
    try {
      const mainOptions = {
        from: SOURCE,
        to: toAddresses,
        subject: subject,
        html: body,
      };

      const transporter = await this.nodeMailer();

      await transporter.sendMail(mainOptions);
    } catch (error) {
      console.log("error", error);
      throw new ServerError(
        CONSTANTS.SERVER_ERROR.INTERNAL_EMAIL_ERROR.errorCode,
        CONSTANTS.SERVER_ERROR.INTERNAL_EMAIL_ERROR.message
      );
    }
  }
}

export default NodeMailer;
