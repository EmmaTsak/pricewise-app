import http from "http";
import dotenv from "dotenv";
import app from "./app";
import { initSocket } from "./sockets/socket";
import { startScrapers, runAllScrapers } from "./scrapers/scheduler";

dotenv.config();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
const shouldRunScrapeOnStart = process.env.RUN_SCRAPE_ON_START === "true";

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  startScrapers();

  if (shouldRunScrapeOnStart) {
    console.log("RUN_SCRAPE_ON_START is enabled. Running scrapers now...");
    await runAllScrapers();
  } else {
    console.log("Skipping immediate scrape on startup.");
  }
});