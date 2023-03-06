import UserController from "@app-api/controllers/UserController";
import UserService from "@app-services/UserService";
import { Container } from "inversify";
import TYPES from "./types";
import EventService from "@app-services/EventService";
import NodeMailer from "./smtp";

const container = new Container();

container.bind(UserController).toSelf();

container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<EventService>(TYPES.EventService).to(EventService);
container.bind<NodeMailer>(TYPES.NodeMailer).to(NodeMailer);

export default container;
