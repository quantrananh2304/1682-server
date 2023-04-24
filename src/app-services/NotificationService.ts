import { injectable } from "inversify";
import { INotificationService } from "./interface";
import { EVENT_SCHEMA } from "@app-repositories/models/Events";
import Notifications, {
  NOTIFICATION_TYPE,
  NotificationModelInterface,
} from "@app-repositories/models/Notifications";
import { Types } from "mongoose";

@injectable()
class NotificationService implements INotificationService {
  async createNotification(
    userId: string,
    _notification: {
      content: string;
      schema: EVENT_SCHEMA;
      schemaId: string;
      receiver: string;
      notiType: NOTIFICATION_TYPE;
    }
  ): Promise<NotificationModelInterface> {
    const { content, schema, schemaId, receiver, notiType } = _notification;

    const notification: NotificationModelInterface = await Notifications.create(
      {
        content,
        schema,
        schemaId: Types.ObjectId(schemaId),
        read: false,
        receiver: Types.ObjectId(receiver),
        notiType,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: Types.ObjectId(userId),
        createdBy: Types.ObjectId(userId),
      }
    );

    return notification;
  }

  async getSelfNotificationList(
    userId: string
  ): Promise<NotificationModelInterface[]> {
    const notifications: Array<NotificationModelInterface> =
      await Notifications.find({ receiver: Types.ObjectId(userId) }).lean();

    return notifications;
  }

  async markAsRead(
    notificationId: string,
    actor: string
  ): Promise<NotificationModelInterface> {
    const notification: NotificationModelInterface =
      await Notifications.findByIdAndUpdate(
        notificationId,
        {
          $set: {
            read: true,
            updatedAt: new Date(),
            updatedBy: Types.ObjectId(actor),
          },
        },
        { new: true, useFindAndModify: false }
      );

    return notification;
  }

  async getNotificationById(
    notificationId: string
  ): Promise<NotificationModelInterface> {
    const notification: NotificationModelInterface =
      await Notifications.findById(notificationId).lean();

    return notification;
  }

  async markAllAsRead(userId: string): Promise<NotificationModelInterface[]> {
    const notifications: Array<NotificationModelInterface> =
      await Notifications.updateMany(
        {
          receiver: Types.ObjectId(userId),
          read: false,
        },
        {
          $set: {
            read: true,
            updatedAt: new Date(),
            updatedBy: Types.ObjectId(userId),
          },
        },
        {
          new: true,
          useFindAndModify: false,
        }
      ).lean();

    return notifications;
  }
}

export default NotificationService;
