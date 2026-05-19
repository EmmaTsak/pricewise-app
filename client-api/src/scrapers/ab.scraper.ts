import { chromium, Page } from "playwright";
import { getIO } from "../sockets/socket";
import {
  createFastScraperContext,
  upsertProductsInBatches,
  ScrapedProductForSave
} from "../utils/scraperPerformance";
import {
  slugify,
  normalizeSpaces
} from "../utils/scraperCommon";


const SUPERMARKET = "AB";
const BASE_URL = "https://www.ab.gr";
const MAX_PAGES = 50;

type AbCategory = {
  path: string;
  name: string;
};

type AbSubcategory = {
  path: string;
  name: string;
  parentCategoryName: string;
};

function normalizeAbPath(path: string): string {
  if (!path) return path;
  if (path.startsWith("/el/")) return path;
  if (path.startsWith("/eshop/")) return `/el${path}`;

  return path;
}

function buildFullUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, BASE_URL).toString();
}

function buildPagedUrl(path: string, pageNumber: number): string {
  const normalizedPath = normalizeAbPath(path);
  const url = new URL(`${BASE_URL}${normalizedPath}`);

  url.searchParams.set("q", ":relevance");
  url.searchParams.set("sort", "relevance");

  if (pageNumber > 1) {
    url.searchParams.set("pageNumber", String(pageNumber));
  }

  return url.toString();
}

function extractProductId(url: string | null): string | null {
  if (!url) return null;

  const match = url.match(/\/p\/(\d+)/);
  return match ? match[1] : null;
}

function parseAbPrice(eurosText: string, centsText: string): number | null {
  const euros = Number(eurosText.replace(/[^\d]/g, ""));
  const cents = Number(centsText.replace(/[^\d]/g, ""));

  if (Number.isNaN(euros) || Number.isNaN(cents)) {
    return null;
  }

  const price = Number((euros + cents / 100).toFixed(2));

  if (price <= 0) {
    return null;
  }

  return price;
}

async function waitForProductsOrTimeout(
  page: Page,
  timeoutMs = 8000
): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const count = await page.locator('[data-testid="product-name"]').count();

    if (count > 0) {
      return true;
    }

    await page.waitForTimeout(400);
  }

  return false;
}

async function getAbCategories(page: Page): Promise<AbCategory[]> {
  const url = buildFullUrl("/el/eshop");

  console.log(`Opening AB categories page: ${url}`);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  await page.waitForTimeout(1500);

  const categories = await page.evaluate(() => {
    const results: { path: string; name: string }[] = [];
    const seen = new Set<string>();
    const links = Array.from(document.querySelectorAll("a"));

    for (const link of links) {
      const href = link.getAttribute("href") || "";

      const textFromImage =
        link.querySelector("img")?.getAttribute("alt")?.trim() || "";

      const textFromLink =
        (link.textContent || "").replace(/\s+/g, " ").trim();

      const text = textFromImage || textFromLink;

      if (!/^\/(?:el\/)?eshop\/[^/]+\/c\/\d+$/.test(href)) {
        continue;
      }

      if (!text) {
        continue;
      }

      const normalizedPath = href.startsWith("/el/") ? href : `/el${href}`;

      if (seen.has(normalizedPath)) {
        continue;
      }

      seen.add(normalizedPath);
      results.push({ path: normalizedPath, name: text });
    }

    return results;
  });

  const cleaned = categories.filter((category) => category.name.length > 1);

  console.log(`Found ${cleaned.length} AB categories.`);

  return cleaned;
}

async function getAbSubcategories(
  page: Page,
  category: AbCategory
): Promise<AbSubcategory[]> {
  const url = buildFullUrl(normalizeAbPath(category.path));

  console.log(`Opening AB category page: ${category.name}`);
  console.log(`URL: ${url}`);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  await page.waitForTimeout(1500);

  const subcategories = await page.evaluate((parentCategoryName) => {
    const results: {
      path: string;
      name: string;
      parentCategoryName: string;
    }[] = [];

    const seen = new Set<string>();
    const links = Array.from(document.querySelectorAll("a"));

    function isNoisyCategoryName(text: string) {
      const normalized = text.replace(/\s+/g, " ").trim().toLowerCase();

      return (
        normalized.includes("κάθε μέρα χαμηλή τιμή") ||
        normalized.includes("καθε μερα χαμηλη τιμη") ||
        normalized.includes("προσφορά") ||
        normalized.includes("προσφορα") ||
        normalized.includes("offer") ||
        /\d{3,}$/.test(normalized)
      );
    }

    for (const link of links) {
      const href = link.getAttribute("href") || "";
      const text = (link.textContent || "").replace(/\s+/g, " ").trim();

      const isSubcategory = /^\/(?:el\/)?eshop\/.+\/.+\/c\/\d+$/.test(href);
      const isTopLevel = /^\/(?:el\/)?eshop\/[^/]+\/c\/\d+$/.test(href);

      if (!isSubcategory || isTopLevel) continue;
      if (!text) continue;
      if (isNoisyCategoryName(text)) continue;
      if (seen.has(href)) continue;

      seen.add(href);

      results.push({
        path: href.startsWith("/el/") ? href : `/el${href}`,
        name: text,
        parentCategoryName
      });
    }

    return results;
  }, category.name);

  const cleaned = subcategories.filter((sub) => sub.name.length > 1);

  console.log(
    `Found ${cleaned.length} subcategories in category "${category.name}".`
  );

  return cleaned;
}

async function extractAbProductsFromPage(
  page: Page,
  categoryName: string
): Promise<{
  products: ScrapedProductForSave[];
  invalid: number;
}> {
  const rawProducts = await page.evaluate(() => {
    type BrowserProduct = {
      brand: string;
      productName: string;
      relativeUrl: string | null;
      image: string | null;
      eurosText: string;
      centsText: string;
    };

    function getImageUrl(img: HTMLImageElement | null): string | null {
      if (!img) return null;

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

    const cards = Array.from(document.querySelectorAll<HTMLElement>("li.product-item"));

    return cards.map((card): BrowserProduct => {
      const brand =
        card
          .querySelector('[data-testid="product-brand"]')
          ?.textContent?.trim() || "";

      const productName =
        card
          .querySelector('[data-testid="product-name"]')
          ?.textContent?.trim() || "";

      const nameLink = card.querySelector<HTMLAnchorElement>(
        '[data-testid="product-block-name-link"]'
      );

      const imageLink = card.querySelector<HTMLAnchorElement>(
        '[data-testid="product-block-image-link"]'
      );

      const relativeUrl =
        nameLink?.getAttribute("href") ||
        imageLink?.getAttribute("href") ||
        null;

      const img = card.querySelector<HTMLImageElement>(
        '[data-testid="product-block-image-link"] img'
      );

      const image = getImageUrl(img);

      const footer = card.querySelector('[data-testid="product-tile-footer"]');

      const priceContainer = footer?.querySelector(
        '[data-testid="product-block-price"]'
      );

      const divs = Array.from(priceContainer?.querySelectorAll("div") || []);

      const eurosText = divs[divs.length - 1]?.textContent?.trim() || "";
      const centsText =
        priceContainer?.querySelector("sup")?.textContent?.trim() || "";

      return {
        brand,
        productName,
        relativeUrl,
        image,
        eurosText,
        centsText
      };
    });
  });

  const products: ScrapedProductForSave[] = [];
  let invalid = 0;

  for (const raw of rawProducts) {
    const cleanBrand = raw.brand === "-" ? "" : raw.brand;

    const fullName = normalizeSpaces(`${cleanBrand} ${raw.productName}`);

    const price = parseAbPrice(raw.eurosText, raw.centsText);

    if (!fullName || price == null) {
      invalid++;
      continue;
    }

    const externalId = extractProductId(raw.relativeUrl);
    const productKey = externalId || slugify(`${categoryName}-${fullName}`);

    products.push({
      name: fullName,
      price,
      photoURL: raw.image,
      url: raw.relativeUrl ? buildFullUrl(raw.relativeUrl) : null,
      productKey,
      supermarket: SUPERMARKET,
      categoryName
    });
  }

  return { products, invalid };
}

async function scrapeListingByPages(
  page: Page,
  listingPath: string,
  categoryName: string,
  logLabel: string
) {
  console.log("\n----------");
  console.log(`Scraping AB listing: ${logLabel}`);

  let saved = 0;
  let skipped = 0;

  const seenProductKeys = new Set<string>();

  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber++) {
    const url = buildPagedUrl(listingPath, pageNumber);

    console.log(`Opening AB page ${pageNumber}: ${url}`);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    /*
      We do not need a fixed 2-4 second wait here because
      waitForProductsOrTimeout already waits for product content.
    */
    const hasProducts = await waitForProductsOrTimeout(page, 8000);

    if (!hasProducts) {
      console.log(`No AB products found on page ${pageNumber}. Stopping.`);
      break;
    }

    const { products, invalid } = await extractAbProductsFromPage(
      page,
      categoryName
    );

    console.log(`Found ${products.length} valid products on page ${pageNumber}.`);

    if (products.length === 0) {
      console.log(`No valid products on page ${pageNumber}. Stopping.`);
      break;
    }

    const newProducts = products.filter((product) => {
      if (seenProductKeys.has(product.productKey)) {
        return false;
      }

      seenProductKeys.add(product.productKey);
      return true;
    });

    const saveResult = await upsertProductsInBatches(newProducts);

    saved += saveResult.saved;
    skipped += invalid + saveResult.skipped;

    console.log(
      `Page ${pageNumber} finished. New unique products: ${newProducts.length}, invalid/skipped: ${invalid + saveResult.skipped}`
    );

    if (pageNumber > 1 && newProducts.length === 0) {
      console.log(`No new products on page ${pageNumber}. Stopping.`);
      break;
    }
  }

  console.log(`Finished AB listing: ${logLabel}`);
  console.log(`Saved: ${saved}, skipped: ${skipped}`);

  return { saved, skipped };
}

export const scrapeAB = async () => {
  console.log("Starting AB scraper with Playwright...");

  const browser = await chromium.launch({
    headless: true
  });

  const context = await createFastScraperContext(browser);
  const page = await context.newPage();

  let totalSaved = 0;
  let totalSkipped = 0;

  try {
    const categories = await getAbCategories(page);

    if (categories.length === 0) {
      console.log("No AB categories found.");
      return;
    }

    for (const category of categories) {
      try {
        const subcategories = await getAbSubcategories(page, category);

        if (subcategories.length === 0) {
          console.log(
            `No subcategories found for "${category.name}", scraping category directly.`
          );

          const result = await scrapeListingByPages(
            page,
            category.path,
            category.name,
            category.name
          );

          totalSaved += result.saved;
          totalSkipped += result.skipped;

          await page.waitForTimeout(750);
          continue;
        }

        for (const subcategory of subcategories) {
          try {
            const result = await scrapeListingByPages(
              page,
              subcategory.path,
              subcategory.name,
              `${subcategory.parentCategoryName} > ${subcategory.name}`
            );

            totalSaved += result.saved;
            totalSkipped += result.skipped;
          } catch (error) {
            console.error(
              `AB subcategory scrape failed: ${subcategory.name}`,
              error
            );
          }

          await page.waitForTimeout(750);
        }
      } catch (error) {
        console.error(`AB category scrape failed: ${category.name}`, error);
      }
    }

    console.log("\n==========");
    console.log("Finished AB scrape.");
    console.log(`TOTAL Saved: ${totalSaved}`);
    console.log(`TOTAL Skipped: ${totalSkipped}`);

    try {
      getIO().emit("prices-refreshed", {
        supermarket: SUPERMARKET,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Socket emit failed after AB scrape:", error);
    }
  } catch (error) {
    console.error("AB scraper failed:", error);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
};