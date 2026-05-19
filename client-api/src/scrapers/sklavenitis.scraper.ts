import { chromium, Page } from "playwright";
import { getIO } from "../sockets/socket";
import {
  createFastScraperContext,
  upsertProductsInBatches
} from "../utils/scraperPerformance";
import {
  slugify,
  buildFullUrl as buildUrl,
  parseGreekPrice,
  closeCookiePopup,
  normalizeSpaces
} from "../utils/scraperCommon";

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

function buildFullUrl(pathOrUrl: string): string {
  return buildUrl(pathOrUrl, BASE_URL);
}

async function selectAtticaHub(page: Page) {
  console.log("Opening Sklavenitis homepage...");

  await page.goto(BASE_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  await closeCookiePopup(page);

  console.log("Selecting Sklavenitis area: Αττικής...");

  const atticaHub = page
    .locator('a[data-plugin-previewhub][data-instance="28"]')
    .first();

  try {
    await atticaHub.waitFor({ state: "visible", timeout: 10000 });
    await atticaHub.click();

    await page.waitForLoadState("networkidle", {
      timeout: 8000
    }).catch(() => {
      // Sklavenitis may keep background requests open.
    });

    await page.waitForTimeout(1000);

    console.log("Αττικής selected.");
  } catch {
    console.log("Could not click Αττικής hub using data-instance=28.");
    console.log("Trying fallback by text...");

    await page.locator('a:has-text("Αττικής")').first().click();

    await page.waitForLoadState("networkidle", {
      timeout: 8000
    }).catch(() => {
      // Ignore networkidle timeout.
    });

    await page.waitForTimeout(1000);

    console.log("Αττικής selected using text fallback.");
  }
}

async function getSklavenitisSubcategories(
    page: Page
): Promise<SklavenitisSubcategory[]> {
    console.log("Opening Sklavenitis categories page...");

    await page.goto(CATEGORIES_URL, {
        waitUntil: "domcontentloaded",
        timeout: 60000
    });

    await page.waitForFunction(
        () => {
            return document.querySelectorAll(
            ".categories_item .categories_subs a[href]"
            ).length > 0;
        },
        undefined,
        {
            timeout: 10000
        }
    );

await page.waitForTimeout(500);

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
      name: normalizeSpaces(product.name),
      price,
      productKey,
      photoURL: product.image,
      url: fullProductUrl,
      categoryName: product.categoryName
    });
  }

  return cleanedProducts;
}

function parseSklavenitisProductCounter(text: string) {

  const normalized = text.replace(/\s+/g, " ").trim();
  const match = normalized.match(/(\d+)\s+από\s+τα\s+(\d+)/i);

  if (!match) {
    return null;
  }

  return {
    visible: Number(match[1]),
    total: Number(match[2])
  };
}

async function getSklavenitisProductCounter(page: Page) {
  try {
    const counterText = await page
      .locator(".current-page")
      .first()
      .textContent({
        timeout: 2000
      });

    if (!counterText) {
      return null;
    }

    return parseSklavenitisProductCounter(counterText);
  } catch {
    return null;
  }
}

async function scrollUntilAllSklavenitisProductsLoaded(page: Page) {
  console.log("Scrolling Sklavenitis product list...");

  const MAX_SCROLLS = 80;
  const MAX_STABLE_ROUNDS = 10;

  let previousVisible = 0;
  let stableRounds = 0;

  for (let scrollNumber = 1; scrollNumber <= MAX_SCROLLS; scrollNumber++) {
    const counterBefore = await getSklavenitisProductCounter(page);

    if (counterBefore) {
      console.log(
        `Scroll ${scrollNumber}: ${counterBefore.visible} από τα ${counterBefore.total} προϊόντα`
      );

      if (counterBefore.visible >= counterBefore.total) {
        console.log("All Sklavenitis products are loaded.");
        return;
      }

      if (counterBefore.visible === previousVisible) {
        stableRounds++;
      } else {
        stableRounds = 0;
        previousVisible = counterBefore.visible;
      }

      if (stableRounds >= MAX_STABLE_ROUNDS) {
        console.log(
          "Product counter stopped increasing for several rounds. Stopping scroll."
        );
        return;
      }
    }

    /*
      Important:
      Do NOT jump straight to document.body.scrollHeight.
      Sklavenitis lazy loading needs gradual scrolling.
    */

    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(700);

    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(700);

    const productPriceCount = await page
      .locator(".main-price .price[data-price]")
      .count();

    if (productPriceCount > 0) {
      await page
        .locator(".main-price .price[data-price]")
        .nth(productPriceCount - 1)
        .scrollIntoViewIfNeeded()
        .catch(() => {
        });

      await page.waitForTimeout(1200);
    }

    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(1500);
  }

  console.log("Reached max Sklavenitis scroll attempts.");
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

    await page.waitForSelector(".main-price .price[data-price], .current-page", {
      timeout: 10000
    }).catch(() => {
    });

    await page.waitForTimeout(2000);

    await scrollUntilAllSklavenitisProductsLoaded(page);

    const products = await extractProductsFromCurrentPage(
      page,
      subcategory.name
    );

    console.log(`Found ${products.length} products in ${subcategory.name}.`);

    const result = await upsertProductsInBatches(
      products.map((product) => ({
        ...product,
        supermarket: SUPERMARKET
      }))
    );

    saved += result.saved;
    skipped += result.skipped;
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

  const context = await createFastScraperContext(browser);

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