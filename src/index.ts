import server from "@server";
import { PORT, NODE_ENV } from "@app-configs";
import { DbConnection } from "@app-repositories/db";

DbConnection.initConnection()
  .then(() => {
    DbConnection.setAutoReconnect();

    server.listen(PORT, async () => {
      console.log(`Service start port ${PORT} ${NODE_ENV}`);
    });
  })
  .catch((e) => {
    console.log("Connect DB Error", e.message);
    process.exit(1);
  });
