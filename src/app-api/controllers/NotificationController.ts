import { Request, Response } from "@app-helpers/http.extends";
import { EVENT_ACTION, EVENT_SCHEMA } from "@app-repositories/models/Events";
import { NotificationModelInterface } from "@app-repositories/models/Notifications";
import TYPES from "@app-repositories/types";
import EventService from "@app-services/EventService";
import NotificationService from "@app-services/NotificationService";
import CONSTANTS from "@app-utils/Constants";
import { inject, injectable } from "inversify";

@injectable()
class NotificationController {
  @inject(TYPES.NotificationService)
  private readonly notificationService: NotificationService;
  @inject(TYPES.EventService) private readonly eventService: EventService;

  async getSelfNotificationList(req: Request, res: Response) {
    try {
      const { userId } = req.headers;

      const notifications: Array<NotificationModelInterface> =
        await this.notificationService.getSelfNotificationList(userId);

      if (!notifications) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.NOTIFICATION,
        action: EVENT_ACTION.READ,
        schemaId: null,
        actor: userId,
        description: "/notification/self-list",
      });

      return res.successRes({ data: notifications });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { userId } = req.headers;
      const { notificationId } = req.params;

      const notification: NotificationModelInterface =
        await this.notificationService.getNotificationById(notificationId);

      if (String(notification.receiver) !== userId) {
        return res.errorRes(
          CONSTANTS.SERVER_ERROR.CANNOT_READ_OTHER_NOTIFICATION
        );
      }

      if (notification.read) {
        return res.successRes({ data: {} });
      }

      const updatedNotification: NotificationModelInterface =
        await this.notificationService.markAsRead(notificationId, userId);

      if (!updatedNotification) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.NOTIFICATION,
        action: EVENT_ACTION.UPDATE,
        schemaId: String(updatedNotification._id),
        actor: userId,
        description: "/notification/mark-as-read",
      });

      return res.successRes({ data: {} });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const { userId } = req.headers;

      const notifications: Array<NotificationModelInterface> =
        await this.notificationService.markAllAsRead(userId);

      if (!notifications) {
        return res.internal({});
      }

      await this.eventService.createEvent({
        schema: EVENT_SCHEMA.NOTIFICATION,
        action: EVENT_ACTION.UPDATE,
        schemaId: null,
        actor: userId,
        description: "/notification/mark-all-as-read",
      });

      const selfNotifications =
        await this.notificationService.getSelfNotificationList(userId);

      if (!selfNotifications) {
        return res.internal({});
      }

      return res.successRes({ data: selfNotifications });
    } catch (error) {
      console.log("error", error);
      return res.internal({ message: error.errorMessage });
    }
  }
}

export default NotificationController;
