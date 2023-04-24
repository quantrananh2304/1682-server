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
import PostService from "@app-services/PostService";
import PostController from "@app-api/controllers/PostController";
import PaymentController from "@app-api/controllers/PaymentController";
import PaymentService from "@app-services/PaymentService";
import NotificationService from "@app-services/NotificationService";
import NotificationController from "@app-api/controllers/NotificationController";

const container = new Container();

container.bind(UserController).toSelf();
container.bind(AuthenticationController).toSelf();
container.bind(TopicController).toSelf();
container.bind(BookController).toSelf();
container.bind(ReportController).toSelf();
container.bind(PostController).toSelf();
container.bind(PaymentController).toSelf();
container.bind(NotificationController).toSelf();

container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<EventService>(TYPES.EventService).to(EventService);
container.bind<NodeMailer>(TYPES.NodeMailer).to(NodeMailer);
container.bind<TopicService>(TYPES.TopicService).to(TopicService);
container.bind<BookService>(TYPES.BookService).to(BookService);
container.bind<ReportService>(TYPES.ReportService).to(ReportService);
container.bind<PostService>(TYPES.PostService).to(PostService);
container.bind<PaymentService>(TYPES.PaymentService).to(PaymentService);
container
  .bind<NotificationService>(TYPES.NotificationService)
  .to(NotificationService);

export default container;
