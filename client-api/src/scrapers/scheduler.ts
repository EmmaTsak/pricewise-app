import cron from "node-cron";

import prisma from "../config/prisma";
import { clearProductCache } from "../utils/cache";
import { getIO } from "../sockets/socket";

import { scrapeLidl } from "./lidl.scraper";
import { scrapeAB } from "./ab.scraper";
import { scrapeSklavenitis } from "./sklavenitis.scraper";
import { scrapeGalaxias } from "./galaxias.scraper";

import { rebuildProductGroups } from "../services/productGrouping.service";

let isRunning = false;

type ScraperJob = {
  supermarket: string;
  run: () => Promise<void>;
};

const scraperJobs: ScraperJob[] = [
  {
    supermarket: "Galaxias",
    run: scrapeGalaxias,
  },
  {
    supermarket: "Sklavenitis",
    run: scrapeSklavenitis,
  },
  {
    supermarket: "Lidl",
    run: scrapeLidl,
  },
  {
    supermarket: "AB",
    run: scrapeAB,
  },
];

async function deleteStaleProductsForSupermarket(
  supermarket: string,
  beforeRun: Date
) {
  const result = await prisma.product.deleteMany({
    where: {
      supermarket,
      updatedAt: {
        lt: beforeRun,
      },
    },
  });

  console.log(
    `Deleted ${result.count} stale products for ${supermarket}.`
  );
}

export const runAllScrapers = async () => {
  if (isRunning) {
    console.log("Scrapers are already running. Skipping this cycle.");
    return;
  }

  const runStartedAt = new Date();
  const successfullyScrapedSupermarkets: string[] = [];

  try {
    isRunning = true;

    console.log("Starting scraper run...");

    for (const scraperJob of scraperJobs) {
      try {
        console.log(`Starting ${scraperJob.supermarket} scraper...`);

        await scraperJob.run();

        successfullyScrapedSupermarkets.push(scraperJob.supermarket);

        console.log(`${scraperJob.supermarket} scraper completed.`);
      } catch (error) {
        console.error(`${scraperJob.supermarket} scraper failed:`, error);
      }
    }

    for (const supermarket of successfullyScrapedSupermarkets) {
      await deleteStaleProductsForSupermarket(supermarket, runStartedAt);
    }

    const groupingResult = await rebuildProductGroups();

    clearProductCache();

    getIO().emit("prices-refreshed", {
      supermarkets: successfullyScrapedSupermarkets,
      timestamp: new Date().toISOString(),
      grouping: groupingResult,
    });

    console.log("Scraper run completed.");
  } catch (error) {
    console.error("Scraper run failed:", error);
  } finally {
    isRunning = false;
  }
};

export const startScrapers = () => {
  const cronSchedule = process.env.SCRAPER_CRON || "0 */24 * * *";

  if (!cron.validate(cronSchedule)) {
    console.error(`Invalid SCRAPER_CRON value: ${cronSchedule}`);
    return;
  }

  console.log(`Scraper scheduler started with cron: ${cronSchedule}`);

  cron.schedule(cronSchedule, async () => {
    await runAllScrapers();
  });
};