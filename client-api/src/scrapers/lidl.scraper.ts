import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "../config/prisma";
import { getIO } from "../sockets/socket";

const SUPERMARKET = "Lidl";
const ROOT_CATEGORY_URL = "/c/fagito-poto/s10068374";
const FETCH_SIZE = 12;

const lidlApi = axios.create({
  baseURL: "https://www.lidl-hellas.gr",
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36"
  }
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

type LidlSubcategory = {
  id: string;
  name: string;
  url: string;
};

async function getLidlSubcategories(): Promise<LidlSubcategory[]> {
  const response = await lidlApi.get(ROOT_CATEGORY_URL);
  const html = response.data as string;

  const $ = cheerio.load(html);
  const subcategories: LidlSubcategory[] = [];
  const seenIds = new Set<string>();

  // Look for links that point to subcategory pages like:
  // /h/freska-froyta-lachanika/h10071012
  $("a[href*='/h/']").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;

    const match = href.match(/\/h\/[^/]+\/h(\d+)/);
    if (!match) return;

    const subcategoryId = match[1];

    // Try to get the visible text from the link
    const name = $(element).text().replace(/\s+/g, " ").trim();

    if (!name) return;
    if (seenIds.has(subcategoryId)) return;

    seenIds.add(subcategoryId);

    subcategories.push({
      id: subcategoryId,
      name,
      url: href
    });
  });

  return subcategories;
}

async function scrapeSubcategoryProducts(subcategory: LidlSubcategory) {
  let offset = 0;
  let saved = 0;
  let skipped = 0;

  console.log(
    `\nScraping Lidl subcategory: ${subcategory.name} (${subcategory.id})`
  );

  while (true) {
    try {
      const response = await lidlApi.get("/q/api/search", {
        params: {
          offset,
          fetchsize: FETCH_SIZE,
          locale: "el_GR",
          assortment: "GR",
          version: "2.0.0",
          "category.id": subcategory.id
        }
      });

      const products = response.data?.items;

      if (!products || products.length === 0) {
        console.log(`No more products in subcategory: ${subcategory.name}`);
        break;
      }

      console.log(
        `Fetched ${products.length} products from ${subcategory.name} (offset ${offset})`
      );

      for (const item of products) {
        try {
          const data = item.gridbox?.data;

          if (!data) {
            skipped++;
            continue;
          }

          const name = data.title?.trim();
          const rawPrice = data.price?.price;
          const image = data.image ?? null;

          if (!name || rawPrice == null) {
            skipped++;
            continue;
          }

          const price = Number(rawPrice);

          if (Number.isNaN(price)) {
            skipped++;
            continue;
          }

          // Product key includes supermarket + subcategory + name
          // This reduces collisions for similarly named items
          const productKey = slugify(`${subcategory.name}-${name}`);

          await prisma.product.upsert({
            where: {
              productKey_supermarket: {
                productKey,
                supermarket: SUPERMARKET
              }
            },
            update: {
              name,
              price,
              photoURL: image,
              categoryName: subcategory.name
            },
            create: {
              name,
              price,
              photoURL: image,
              productKey,
              supermarket: SUPERMARKET,
              categoryName: subcategory.name
            }
          });

          saved++;
        } catch (error) {
          skipped++;
          console.error(
            `Failed to process product in ${subcategory.name}:`,
            error
          );
        }
      }

      offset += FETCH_SIZE;
    } catch (error) {
      console.error(
        `Failed to fetch products for subcategory ${subcategory.name} at offset ${offset}:`,
        error
      );
      break;
    }
  }

  return { saved, skipped };
}

export const scrapeLidl = async () => {
  console.log("Starting Lidl scraper...");

  let totalSaved = 0;
  let totalSkipped = 0;

  try {
    const subcategories = await getLidlSubcategories();

    if (subcategories.length === 0) {
      console.log("No Lidl subcategories found.");
      return;
    }

    console.log(`Found ${subcategories.length} Lidl subcategories:`);

    for (const subcategory of subcategories) {
      console.log(`- ${subcategory.name} (${subcategory.id})`);
    }

    for (const subcategory of subcategories) {
      const result = await scrapeSubcategoryProducts(subcategory);
      totalSaved += result.saved;
      totalSkipped += result.skipped;
    }

    console.log(`\nFinished Lidl scrape.`);
    console.log(`Saved ${totalSaved} Lidl products.`);
    console.log(`Skipped ${totalSkipped} Lidl products.`);
  } catch (error) {
    console.error("Lidl scraper failed:", error);
  }
  
    try {
    getIO().emit("prices-refreshed", {
      supermarket: SUPERMARKET,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Socket emit failed after Lidl scrape:", error);
  }
};