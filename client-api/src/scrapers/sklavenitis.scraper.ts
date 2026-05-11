import { chromium, Page } from "playwright";
import prisma from "../config/prisma";
import { getIO } from "../sockets/socket";

const SUPERMARKET = "Sklavenitis";
const BASE_URL = "https://www.sklavenitis.gr";
const CATEGORIES_URL = `${BASE_URL}/katigories/`;

type SklavenitisSubcategory = {
  name: string;
  url: string;
};

type SklavenitisProduct = {
  name: string;
  productKey: string;
  price: number;
  photoURL: string | null;
  url: string | null;
  categoryName: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

function buildFullUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, BASE_URL).toString();
}

function parseGreekPrice(priceText: string): number | null {
  const cleaned = priceText
    .replace("€", "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "")
    .trim();

  const price = Number(cleaned);

  if (Number.isNaN(price) || price <= 0) {
    return null;
  }

  return Number(price.toFixed(2));
}

async function closeCookiePopup(page: Page) {
  try {
    const button = page
      .locator(
        'button:has-text("Αποδοχή"), button:has-text("Αποδέχομαι"), button:has-text("Accept")'
      )
      .first();

    if (await button.isVisible({ timeout: 2000 })) {
      await button.click();
      await page.waitForTimeout(1000);
    }
  } catch {
    // No cookie popup appeared.
  }
}

/**
 * Sklavenitis needs a selected area/hub before the eMarket pages work properly.
 * You found this exact link:
 *
 * <a data-plugin-previewhub="..." data-instance="28">Αττικής</a>
 */
async function selectAtticaHub(page: Page) {
  console.log("Opening Sklavenitis homepage...");
  await page.goto(BASE_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  await closeCookiePopup(page);
  await page.waitForTimeout(3000);

  console.log("Selecting Sklavenitis area: Αττικής...");

  const atticaHub = page
    .locator('a[data-plugin-previewhub][data-instance="28"]')
    .first();

  try {
    await atticaHub.waitFor({ state: "visible", timeout: 10000 });
    await atticaHub.click();

    // The click triggers site JavaScript/AJAX.
    await page.waitForTimeout(5000);

    console.log("Αττικής selected.");
  } catch (error) {
    console.log("Could not click Αττικής hub using data-instance=28.");
    console.log("Trying fallback by text...");

    try {
      await page.locator('a:has-text("Αττικής")').first().click();
      await page.waitForTimeout(5000);
      console.log("Αττικής selected using text fallback.");
    } catch (fallbackError) {
      console.error("Could not select Αττικής.");
      throw fallbackError;
    }
  }
}

/**
 * Gets all subcategory links from:
 *
 * .categories_item
 *   .categories_subs
 *     a[href]
 *
 * Example:
 * /eidi-artozacharoplasteioy/psomi-artoskeyasmata/
 */
async function getSklavenitisSubcategories(
  page: Page
): Promise<SklavenitisSubcategory[]> {
  console.log("Opening Sklavenitis categories page...");

  await page.goto(CATEGORIES_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  await page.waitForTimeout(4000);

  const subcategories = await page.evaluate(() => {
    const results: { name: string; url: string }[] = [];
    const seen = new Set<string>();

    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        ".categories_item .categories_subs a[href]"
      )
    );

    for (const link of links) {
      const name = (link.textContent || "").replace(/\s+/g, " ").trim();
      const href = link.getAttribute("href");

      if (!name || !href) continue;
      if (seen.has(href)) continue;

      seen.add(href);

      results.push({
        name,
        url: href
      });
    }

    return results;
  });

  console.log(`Found ${subcategories.length} Sklavenitis subcategories:`);

  for (const subcategory of subcategories) {
    console.log(`- ${subcategory.name} (${subcategory.url})`);
  }

  return subcategories;
}

/**
 * Extract products from one Sklavenitis subcategory page.
 *
 * We use the exact structure you found:
 *
 * Price:
 * .main-price .price[data-price]
 *
 * Name/photo:
 * a img[alt]
 */
async function extractProductsFromCurrentPage(
  page: Page,
  categoryName: string
): Promise<SklavenitisProduct[]> {
  const products = await page.evaluate((categoryNameFromNode) => {
    type BrowserProduct = {
      name: string;
      priceText: string;
      priceData: string | null;
      image: string | null;
      href: string | null;
      categoryName: string;
    };

    function findProductCard(priceElement: Element): HTMLElement | null {
      let current = priceElement.parentElement;

      for (let depth = 0; depth < 10; depth++) {
        if (!current) return null;

        const image = current.querySelector("a[href] img[alt]");
        const price = current.querySelector(".main-price .price[data-price]");

        if (image && price) {
          return current;
        }

        current = current.parentElement;
      }

      return null;
    }

    function getImageUrl(img: HTMLImageElement): string | null {
      const src = img.getAttribute("src")?.trim();
      if (src) return new URL(src, window.location.origin).toString();

      const dataSrc = img.getAttribute("data-src")?.trim();
      if (dataSrc) return new URL(dataSrc, window.location.origin).toString();

      const srcset = img.getAttribute("srcset")?.trim();
      if (srcset) {
        const firstEntry = srcset.split(",")[0]?.trim();
        const firstUrl = firstEntry?.split(" ")[0]?.trim();

        if (firstUrl) {
          return new URL(firstUrl, window.location.origin).toString();
        }
      }

      return null;
    }

    const results: BrowserProduct[] = [];
    const seen = new Set<string>();

    const priceElements = Array.from(
      document.querySelectorAll<HTMLElement>(".main-price .price[data-price]")
    );

    for (const priceElement of priceElements) {
      const card = findProductCard(priceElement);
      if (!card) continue;

      const img = card.querySelector<HTMLImageElement>("a[href] img[alt]");
      if (!img) continue;

      const link = img.closest<HTMLAnchorElement>("a[href]");
      const href = link?.getAttribute("href") || null;

      const name =
        img.getAttribute("alt")?.trim() ||
        img.getAttribute("title")?.trim() ||
        "";

      const priceText = priceElement.textContent?.trim() || "";
      const priceData = priceElement.getAttribute("data-price");

      if (!name || !href) continue;

      const uniqueKey = `${href}-${priceData || priceText}`;
      if (seen.has(uniqueKey)) continue;
      seen.add(uniqueKey);

      results.push({
        name,
        priceText,
        priceData,
        image: getImageUrl(img),
        href,
        categoryName: categoryNameFromNode
      });
    }

    return results;
  }, categoryName);

  const cleanedProducts: SklavenitisProduct[] = [];

  for (const product of products) {
    const price = parseGreekPrice(product.priceData || product.priceText);

    if (price == null) {
      continue;
    }

    const fullProductUrl = product.href ? buildFullUrl(product.href) : null;
    const productKey = slugify(product.href || product.name);

    cleanedProducts.push({
      name: product.name,
      price,
      productKey,
      photoURL: product.image,
      url: fullProductUrl,
      categoryName: product.categoryName
    });
  }

  return cleanedProducts;
}

async function scrapeSubcategory(
  page: Page,
  subcategory: SklavenitisSubcategory
) {
  console.log("\n----------");
  console.log(`Scraping Sklavenitis subcategory: ${subcategory.name}`);
  console.log(`URL: ${buildFullUrl(subcategory.url)}`);

  let saved = 0;
  let skipped = 0;

  try {
    await page.goto(buildFullUrl(subcategory.url), {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForTimeout(4000);

    const products = await extractProductsFromCurrentPage(
      page,
      subcategory.name
    );

    console.log(`Found ${products.length} products in ${subcategory.name}.`);

    for (const product of products) {
      try {
        await prisma.product.upsert({
          where: {
            productKey_supermarket: {
              productKey: product.productKey,
              supermarket: SUPERMARKET
            }
          },
          update: {
            name: product.name,
            price: product.price,
            photoURL: product.photoURL,
            url: product.url,
            categoryName: product.categoryName
          },
          create: {
            name: product.name,
            price: product.price,
            photoURL: product.photoURL,
            url: product.url,
            productKey: product.productKey,
            supermarket: SUPERMARKET,
            categoryName: product.categoryName
          }
        });

        saved++;
      } catch (error) {
        skipped++;
        console.error(
          `Failed to save Sklavenitis product "${product.name}":`,
          error
        );
      }
    }
  } catch (error) {
    console.error(
      `Failed to scrape Sklavenitis subcategory "${subcategory.name}":`,
      error
    );
  }

  console.log(
    `Finished ${subcategory.name}. Saved: ${saved}, skipped: ${skipped}`
  );

  return { saved, skipped };
}

export const scrapeSklavenitis = async () => {
  console.log("Starting Sklavenitis scraper with Playwright...");

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    locale: "el-GR"
  });

  const page = await context.newPage();

  let totalSaved = 0;
  let totalSkipped = 0;

  try {
    await selectAtticaHub(page);

    const subcategories = await getSklavenitisSubcategories(page);

    if (subcategories.length === 0) {
      console.log("No Sklavenitis subcategories found.");
      return;
    }

    for (const subcategory of subcategories) {
      const result = await scrapeSubcategory(page, subcategory);

      totalSaved += result.saved;
      totalSkipped += result.skipped;

      await page.waitForTimeout(1500);
    }

    console.log("\n==========");
    console.log("Finished Sklavenitis scrape.");
    console.log(`Saved ${totalSaved} Sklavenitis products.`);
    console.log(`Skipped ${totalSkipped} Sklavenitis products.`);

    try {
      getIO().emit("prices-refreshed", {
        supermarket: SUPERMARKET,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Socket emit failed after Sklavenitis scrape:", error);
    }
  } catch (error) {
    console.error("Sklavenitis scraper failed:", error);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
};