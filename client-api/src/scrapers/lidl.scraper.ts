import axios from "axios";
import prisma from "../config/prisma";

const SUPERMARKET = "Lidl";
const CATEGORY_ID = "10068374";
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

export const scrapeLidl = async () => {

  console.log("Starting Lidl API scraper...");

  let offset = 0;
  let totalSaved = 0;
  let totalSkipped = 0;

  while (true) {

    try {

      const response = await lidlApi.get("/q/api/search", {
        params: {
          offset: offset,
          fetchsize: FETCH_SIZE,
          locale: "el_GR",
          assortment: "GR",
          version: "2.0.0",
          "category.id": CATEGORY_ID
        }
      });

      const products = response.data.items;

      if (!products || products.length === 0) {
        console.log("No more Lidl products.");
        break;
      }

      console.log(`Fetched ${products.length} products (offset ${offset})`);

      for (const item of products) {

        try {

          const data = item.gridbox?.data;

          if (!data) {
            totalSkipped++;
            continue;
          }

          const name = data.title?.trim();
          const rawPrice = data.price?.price;
          const image = data.image ?? null;

          if (!name || rawPrice == null) {
            totalSkipped++;
            continue;
          }

          const price = Number(rawPrice);

          if (Number.isNaN(price)) {
            totalSkipped++;
            continue;
          }

          const productKey = slugify(name);

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
              photoURL: image
            },
            create: {
              name,
              price,
              photoURL: image,
              productKey,
              supermarket: SUPERMARKET,
              category: "Food & Beverages"
            }
          });

          totalSaved++;

        } catch (error) {

          totalSkipped++;
          console.error("Failed to process Lidl product:", error);

        }

      }

      offset += FETCH_SIZE;

    } catch (error) {

      console.error(`Failed to fetch Lidl products at offset ${offset}:`, error);
      break;

    }

  }

  console.log(`Saved ${totalSaved} Lidl products.`);
  console.log(`Skipped ${totalSkipped} Lidl products.`);
};