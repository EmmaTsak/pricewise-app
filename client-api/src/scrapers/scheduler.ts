import cron from "node-cron";
import { scrapeLidl } from "./lidl.scraper";
import { scrapeAB } from "./ab.scraper";

let isRunning = false;

export const runAllScrapers = async () => {
  if (isRunning) {
    console.log("Scrapers are already running. Skipping this cycle.");
    return;
  }

  try {
    isRunning = true;
    console.log("Starting scheduled scraper run...");

    await scrapeLidl();
    await scrapeAB();

    console.log("Scheduled scraper run completed.");
  } catch (error) {
    console.error("Scheduled scraper run failed:", error);
  } finally {
    isRunning = false;
  }
};

export const startScrapers = () => {
  console.log("Scraper scheduler started.");

  // Run every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    await runAllScrapers();
  });
};