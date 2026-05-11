import cron from "node-cron";
import { scrapeLidl } from "./lidl.scraper";
import { scrapeAB } from "./ab.scraper";
import { scrapeSklavenitis } from "./sklavenitis.scraper";

let isRunning = false;

export const runAllScrapers = async () => {
  if (isRunning) {
    console.log("Scrapers are already running. Skipping this cycle.");
    return;
  }

  try {
    isRunning = true;
    console.log("Starting scraper run...");

    await scrapeSklavenitis();
    await scrapeLidl();
    await scrapeAB();


    console.log("Scraper run completed.");
  } catch (error) {
    console.error("Scraper run failed:", error);
  } finally {
    isRunning = false;
  }
};

export const startScrapers = () => {
  const cronSchedule = process.env.SCRAPER_CRON || "0 */6 * * *";

  if (!cron.validate(cronSchedule)) {
    console.error(`Invalid SCRAPER_CRON value: ${cronSchedule}`);
    return;
  }

  console.log(`Scraper scheduler started with cron: ${cronSchedule}`);

  cron.schedule(cronSchedule, async () => {
    await runAllScrapers();
  });
};