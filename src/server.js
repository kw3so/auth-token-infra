import "dotenv/config";
import app from "./app.js";
import { connectDB, disconnectDB, prisma } from "./config/db.js";

const PORT = process.env.PORT || 3003;
const SHUTDOWN_TIMEOUT_MS = 10000;

let server;
let isShuttingDown = false;
//Start server function
const startServer = async () => {

  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`The server has started at ${PORT}`);
  });
};

//Shut down server
const shutdown = async (signal, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received - Server shutting down`);

  if (server) {
    //If server is open don't accept any connections
    server.close(async (err) => {
      if (err) {
        console.error(`Failed to shutdown server ${err.message}`);
      }
      //disconnectDB
      await disconnectDB();
      // clearTimeout(forceShutDown);
      process.exit(exitCode);
    });
  } 
};

// Handle gracefully shutdown
process.on("unhandledRejection", (err) => {
  console.error(`unhandled rejection: ${err.message}`);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (err) => {
  console.error(`uncaught exception: ${err.message}`);
  shutdown("uncaughtException", 1);
});

//SIG handling
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer().catch(async (err) => {
  console.error("Failed to start server", err);
  await disconnectDB();
  shutdown("Failed start", 1);
});
