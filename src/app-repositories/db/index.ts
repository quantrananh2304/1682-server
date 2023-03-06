import mongoose = require("mongoose");
import { MONGO_DB_URI } from "@app-configs";
export class DbConnection {
  public static async initConnection() {
    console.log("MONGO_DB_URI", MONGO_DB_URI);
    await DbConnection.connect(MONGO_DB_URI);
  }

  public static async connect(connStr: string) {
    return mongoose
      .connect(connStr, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        autoIndex: false,
      })
      .then(() => {
        console.log(`Connection db has been established successfully!`);
      })
      .catch((error) => {
        console.error("Error connecting to database: ", error);
        return process.exit(1);
      });
  }

  public static setAutoReconnect() {
    mongoose.connection.on("disconnected", () =>
      DbConnection.connect(MONGO_DB_URI)
    );
  }

  public static async disconnect() {
    await mongoose.connection.close();
  }
}
