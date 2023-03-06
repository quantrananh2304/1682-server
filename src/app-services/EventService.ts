import { injectable } from "inversify";
import { IEventService } from "./interface";
import Events, {
  EVENT_ACTION,
  EVENT_SCHEMA,
  EventModelInterface,
} from "@app-repositories/models/Events";
import { Types } from "mongoose";

@injectable()
class EventService implements IEventService {
  async createEvent(_event: {
    schema: EVENT_SCHEMA;
    action: EVENT_ACTION;
    schemaId: string;
    actor: string;
    description: string;
  }): Promise<EventModelInterface> {
    const event = await Events.create({
      schema: _event.schema,
      action: _event.action,
      schemaId: Types.ObjectId(_event.schemaId),
      actor: Types.ObjectId(_event.actor),
      description: _event.description,
      createdAt: new Date(),
    });

    return event;
  }
}

export default EventService;
