import UserController from "@app-api/controllers/UserController";
import UserService from "@app-services/UserService";
import { Container } from "inversify";
import TYPES from "./types";
import EventService from "@app-services/EventService";
import NodeMailer from "./smtp";
import AuthenticationController from "@app-api/controllers/AuthenticationController";
import TopicController from "@app-api/controllers/TopicController";
import TopicService from "@app-services/TopicService";
import BookService from "@app-services/BookService";
import BookController from "@app-api/controllers/BookController";
import ReportService from "@app-services/ReportService";
import ReportController from "@app-api/controllers/ReportController";

const container = new Container();

container.bind(UserController).toSelf();
container.bind(AuthenticationController).toSelf();
container.bind(TopicController).toSelf();
container.bind(BookController).toSelf();
container.bind(ReportController).toSelf();

container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<EventService>(TYPES.EventService).to(EventService);
container.bind<NodeMailer>(TYPES.NodeMailer).to(NodeMailer);
container.bind<TopicService>(TYPES.TopicService).to(TopicService);
container.bind<BookService>(TYPES.BookService).to(BookService);
container.bind<ReportService>(TYPES.ReportService).to(ReportService);

export default container;
