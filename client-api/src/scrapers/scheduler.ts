import cron from "node-cron";
import { scrapeLidl } from "./lidl.scraper";

export const startScrapers = () => {

  // run every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("Running Lidl scraper...");
    await scrapeLidl();
  });

};