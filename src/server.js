import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 3003;
const SHUTDOWN_TIMEOUT_MS = 10000;
let server;

let isShuttingDown = false;
//Start server function
const startServer = () => {
  //Connect the db here

  app.listen(PORT, () => {
    console.log(`The server has started at ${PORT}`);
  });
};

//Shut down server
const shutdown = (signal, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received - Serve shutting down`);

  const forceShutDown = setTimeout(() => {
    console.error("Graceful exit timed out - forcing shutdown");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceShutDown.unref();

  if (server) {
    //If server is open don't accept any connections
    server.close((err) => {
      if (err) {
        console.error(`Failed to shutdown server ${err.message}`);
      }
      //disconnectDB
      clearTimeout(forceShutDown);
      process.exit(exitCode);
    });
  } else {
    //else just shut down
    clearTimeout(forceShutDown);
    process.exit(exitCode);
  }
};

// Handle gracefully shutdown
process.on("unhandledRejection", (err) => {
  console.err(`unhandled rejection: ${err.message}`);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (err) => {
  console.err(`uncaught exception: ${err.message}`);
  shutdown("uncaughtException", 1);
});

//SIG handling
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer().catch((err) => {
  console.error(`Failed to start to server: ${err.message}`);
  shutdown("failed-start", 1);
});
