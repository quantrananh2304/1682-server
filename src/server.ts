/* eslint-disable */

import "reflect-metadata";
import * as express from "express";
import * as cors from "cors";
import * as helmet from "helmet";
import { httpResponse } from "@app-helpers";
import { api } from "@app-api/router";
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*", transports: ["websocket", "polling"] },
});

// check cors
// const whitelistCORS = [
//   "http://localhost:3001/",
//   SERVER_URL,
//   "http://localhost:3000/",
// ];

app.use((req: any, res: any, next) => {
  res.io = io;
  next();
});

app.get("/", (req, res) => res.send("hello"));

const corsOptions = {
  origin: function (origin: string, callback: any) {
    // if (!origin || whitelistCORS.indexOf(origin) !== -1) {
    //   callback(null, true);
    // } else {
    //   callback(new Error("Not allowed by CORS"));
    // }
    callback(null, true);
  },
};

// init firebase
app.use(helmet());
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

//app.use(forms.array("files"));
// return response
app.use(httpResponse);
app.use("/api", api);

export default server;
