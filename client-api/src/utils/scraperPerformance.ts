import { Browser, BrowserContext } from "playwright";
import prisma from "../config/prisma";

export type ScrapedProductForSave = {
  name: string;
  productKey: string;
  price: number;
  supermarket: string;
  categoryName: string | null;
  photoURL: string | null;
  url?: string | null;
};

/**
 * Creates a faster Playwright context.
 *
 * We block images, fonts, and media files.
 *
 * Important:
 * The scraper can still read the image URL from the HTML.
 * We just stop the browser from downloading the actual image file.
 */
export async function createFastScraperContext(
  browser: Browser
): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: {
      width: 1366,
      height: 900
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    locale: "el-GR"
  });

  await context.route("**/*", async (route) => {
    const resourceType = route.request().resourceType();

    if (["image", "font", "media"].includes(resourceType)) {
      await route.abort();
      return;
    }

    await route.continue();
  });

  return context;
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  return chunks;
}

/**
 * Saves products in batches instead of one-by-one.
 *
 * This is faster than:
 * await prisma.product.upsert(...)
 * inside a normal for-loop.
 */
export async function upsertProductsInBatches(
  products: ScrapedProductForSave[],
  batchSize = 50
) {
  let saved = 0;
  let skipped = 0;

  const uniqueProducts = new Map<string, ScrapedProductForSave>();

  for (const product of products) {
    const key = `${product.supermarket}-${product.productKey}`;
    uniqueProducts.set(key, product);
  }

  const deduplicatedProducts = Array.from(uniqueProducts.values());
  const chunks = chunkArray(deduplicatedProducts, batchSize);

  for (const chunk of chunks) {
    try {
      await prisma.$transaction(
        chunk.map((product) =>
          prisma.product.upsert({
            where: {
              productKey_supermarket: {
                productKey: product.productKey,
                supermarket: product.supermarket
              }
            },
            update: {
              name: product.name,
              price: product.price,
              photoURL: product.photoURL,
              url: product.url ?? null,
              categoryName: product.categoryName
            },
            create: {
              name: product.name,
              price: product.price,
              photoURL: product.photoURL,
              url: product.url ?? null,
              productKey: product.productKey,
              supermarket: product.supermarket,
              categoryName: product.categoryName
            }
          })
        )
      );

      saved += chunk.length;
    } catch (error) {
      console.error("Batch save failed. Trying products one by one...", error);

      for (const product of chunk) {
        try {
          await prisma.product.upsert({
            where: {
              productKey_supermarket: {
                productKey: product.productKey,
                supermarket: product.supermarket
              }
            },
            update: {
              name: product.name,
              price: product.price,
              photoURL: product.photoURL,
              url: product.url ?? null,
              categoryName: product.categoryName
            },
            create: {
              name: product.name,
              price: product.price,
              photoURL: product.photoURL,
              url: product.url ?? null,
              productKey: product.productKey,
              supermarket: product.supermarket,
              categoryName: product.categoryName
            }
          });

          saved++;
        } catch (singleError) {
          skipped++;
          console.error(
            `Failed to save product "${product.name}":`,
            singleError
          );
        }
      }
    }
  }

  return { saved, skipped };
}