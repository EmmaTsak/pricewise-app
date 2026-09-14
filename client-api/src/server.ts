import http from "http";
import dotenv from "dotenv";
import app from "./app";
import { initSocket } from "./sockets/socket";
import { startScrapers, runAllScrapers } from "./scrapers/scheduler";
import { mailTransporter } from "./config/mail";

dotenv.config();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
const shouldRunScrapeOnStart = process.env.RUN_SCRAPE_ON_START === "true";

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

const scrapersEnabled = process.env.ENABLE_SCRAPERS === "true";

if (scrapersEnabled) {
  startScrapers();
  console.log("Scraper scheduler enabled.");
} else {
  console.log("Scraper scheduler disabled.");
}

if (scrapersEnabled && shouldRunScrapeOnStart) {
    console.log("RUN_SCRAPE_ON_START is true. Running scrapers now...");
    await runAllScrapers();
  } else {
    console.log("Skipping immediate scrape on startup.");
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      await mailTransporter.verify();
      console.log("Email transporter is ready.");
    } catch (error) {
      console.error("Email transporter verification failed:", error);
    }
  }
});
