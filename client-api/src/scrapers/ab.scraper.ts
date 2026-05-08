import { chromium, Page } from "playwright";
import * as cheerio from "cheerio";
import prisma from "../config/prisma";
import { getIO } from "../sockets/socket";

const SUPERMARKET = "AB";
const BASE_URL = "https://www.ab.gr";

type AbCategory = {
  path: string;
  name: string;
};

type AbSubcategory = {
  path: string;
  name: string;
  parentCategoryName: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

function normalizeAbPath(path: string): string {
  if (!path) return path;
  if (path.startsWith("/el/")) return path;
  if (path.startsWith("/eshop/")) return `/el${path}`;

  return path;
}

function buildPagedUrl(path: string, pageNumber: number): string {
  const normalizedPath = normalizeAbPath(path);
  const url = new URL(`${BASE_URL}${normalizedPath}`);

  // AB uses q=:relevance and sort=relevance on page 1
  url.searchParams.set("q", ":relevance");
  url.searchParams.set("sort", "relevance");

  // Only page 2+ has pageNumber
  if (pageNumber > 1) {
    url.searchParams.set("pageNumber", String(pageNumber));
  }

  return url.toString();
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

    await page.waitForTimeout(500);
  }

  return false;
}

function extractProductId(url: string | null): string | null {
  if (!url) return null;

  const match = url.match(/\/p\/(\d+)/);
  return match ? match[1] : null;
}

function extractPrice(item: any): number | null {
  const footer = item.find('[data-testid="product-tile-footer"]');
  const priceContainer = footer.find('[data-testid="product-block-price"]');

  const euroParts = priceContainer.find("div");
  const eurosText = euroParts.last().text().trim();
  const centsText = priceContainer.find("sup").first().text().trim();

  const euros = Number(eurosText);
  const cents = Number(centsText);

  if (Number.isNaN(euros) || Number.isNaN(cents)) {
    return null;
  }

  const price = Number((euros + cents / 100).toFixed(2));

  // Do not allow zero or negative prices
  if (price <= 0) {
    return null;
  }

  return price;
}

function extractImageUrl(item: any): string | null {
  const img = item.find('[data-testid="product-block-image-link"] img').first();

  const src = img.attr("src")?.trim();
  if (src) return src;

  const dataSrc = img.attr("data-src")?.trim();
  if (dataSrc) return dataSrc;

  const srcset = img.attr("srcset")?.trim();
  if (srcset) {
    // Take the first URL from srcset: "url1 1x, url2 2x"
    const firstEntry = srcset.split(",")[0]?.trim();
    const firstUrl = firstEntry?.split(" ")[0]?.trim();
    return firstUrl || null;
  }

  return null;
}

/**
 * Finds the main AB e-shop category links automatically.
 * This replaces the old hardcoded CATEGORY_PATHS and CATEGORY_MAP.
 */
async function getAbCategories(page: Page): Promise<AbCategory[]> {
  console.log("Loading AB homepage to collect categories from dropdown menu...");

  await page.goto(BASE_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  await page.waitForTimeout(3000);

  // Optional: close cookie banner if it appears
  try {
    const acceptCookiesButton = page.locator(
      'button:has-text("Αποδοχή"), button:has-text("Accept")'
    );
    if (await acceptCookiesButton.first().isVisible({ timeout: 2000 })) {
      await acceptCookiesButton.first().click();
      await page.waitForTimeout(1000);
    }
  } catch {
    // No cookie popup found, continue
  }

  // Open the Eshop dropdown menu
  try {
    const eshopTrigger = page.locator('text=Eshop').first();

    await eshopTrigger.waitFor({ state: "visible", timeout: 10000 });

    // First try hover, because many desktop dropdowns open on hover
    await eshopTrigger.hover();
    await page.waitForTimeout(1500);

    // If the dropdown still does not appear, click as fallback
    const categoryMenu = page.locator('ul[data-testid="header-menu-category"]');

    if (!(await categoryMenu.isVisible().catch(() => false))) {
      await eshopTrigger.click();
      await page.waitForTimeout(1500);
    }
  } catch (error) {
    console.log("Could not open Eshop dropdown.");
    console.log(`Current page URL: ${page.url()}`);
    return [];
  }

  const categoryMenu = page.locator('ul[data-testid="header-menu-category"]');

  try {
    await categoryMenu.waitFor({ state: "visible", timeout: 10000 });
  } catch {
    console.log("Category dropdown menu did not appear.");
    console.log(`Current page URL: ${page.url()}`);
    return [];
  }

  const categories = await page
    .locator('ul[data-testid="header-menu-category"] a[data-testid="category-item-link"]')
    .evaluateAll((links) => {
      const results: { path: string; name: string }[] = [];
      const seen = new Set<string>();

      for (const link of links) {
        const href = link.getAttribute("href") || "";

        // Matches:
        // /eshop/Oporopoleio/c/001
        // /el/eshop/Oporopoleio/c/001
        const isCategoryLink = /^\/(?:el\/)?eshop\/.+\/c\/\d+$/.test(href);
        if (!isCategoryLink) continue;
        if (seen.has(href)) continue;

        const textFromLabel =
          link.querySelector("div:last-child")?.textContent?.trim() || "";

        const textFromImage =
          link.querySelector("img")?.getAttribute("alt")?.trim() || "";

        const name = textFromLabel || textFromImage;
        if (!name) continue;

        seen.add(href);

        results.push({
          path: href.startsWith("/el/") ? href : `/el${href}`,
          name
        });
      }

      return results;
    });

  console.log(`Found ${categories.length} AB categories:`);

  for (const category of categories) {
    console.log(`- ${category.name} (${category.path})`);
  }

  return categories;
}

async function getAbSubcategories(
  page: Page,
  category: AbCategory
): Promise<AbSubcategory[]> {
  const url = `${BASE_URL}${normalizeAbPath(category.path)}`;

  console.log(`Opening category page for subcategories: ${category.name}`);
  console.log(`URL: ${url}`);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  await page.waitForTimeout(4000);

  const subcategories = await page.evaluate((parentCategoryName) => {
    const results: {
      path: string;
      name: string;
      parentCategoryName: string;
    }[] = [];

    const seen = new Set<string>();

    // Collect all links that look like deeper category pages
    const links = Array.from(document.querySelectorAll("a"));

    for (const link of links) {
      const href = link.getAttribute("href") || "";
      const text = (link.textContent || "").replace(/\s+/g, " ").trim();

      // Example deeper paths:
      // /eshop/Oporopoleio/Froyta/c/001001
      // /eshop/Oporopoleio/Lachanika/c/001002
      const isSubcategory =
        /^\/(?:el\/)?eshop\/.+\/.+\/c\/\d+$/.test(href);

      // Skip if it looks like only a top-level category:
      const isTopLevel =
        /^\/(?:el\/)?eshop\/[^/]+\/c\/\d+$/.test(href);

      if (!isSubcategory || isTopLevel) continue;
      if (!text) continue;
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

  // Deduplicate further and remove noisy items
  const cleaned = subcategories.filter((sub) => {
    return sub.name.length > 1;
  });

  console.log(
    `Found ${cleaned.length} subcategories in category "${category.name}":`
  );

  for (const sub of cleaned) {
    console.log(`- ${sub.name} (${sub.path})`);
  }

  return cleaned;
}

async function scrapeSubcategoryByPages(
  page: Page,
  subcategory: AbSubcategory
) {
  console.log("\n----------");
  console.log(`Scraping subcategory: ${subcategory.name}`);
  console.log(`Parent category: ${subcategory.parentCategoryName}`);

  let saved = 0;
  let skipped = 0;

  const seenProductKeys = new Set<string>();
  const MAX_PAGES = 50;

  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber++) {
    const url = buildPagedUrl(subcategory.path, pageNumber);

    console.log(`Opening page ${pageNumber}: ${url}`);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    // Give the page time to hydrate
    await page.waitForTimeout(4000);

    // Wait for actual product content, not only li wrappers
    const hasProducts = await waitForProductsOrTimeout(page, 8000);

    if (!hasProducts) {
      console.log(`No product-name elements found on page ${pageNumber}. Stopping.`);
      break;
    }

    const html = await page.content();
    const $ = cheerio.load(html);
    const items = $("li.product-item");

    console.log(`Found ${items.length} product tiles on page ${pageNumber}`);

    if (items.length === 0) {
      console.log(`No products on page ${pageNumber}. Stopping.`);
      break;
    }

    let newProductsThisPage = 0;
    let invalidProductsThisPage = 0;

    for (const el of items.toArray()) {
      try {
        const item = $(el);

        const nameLink = item.find('[data-testid="product-block-name-link"]');
        const brand = item.find('[data-testid="product-brand"]').text().trim();
        const productName = item.find('[data-testid="product-name"]').text().trim();

        const cleanBrand = brand === "-" ? "" : brand;
        const fullName = `${cleanBrand} ${productName}`.replace(/\s+/g, " ").trim();

        const relativeUrl = nameLink.attr("href") || null;
        const externalId = extractProductId(relativeUrl);
        const image = extractImageUrl(item);
        const price = extractPrice(item);

        if (!fullName || price == null) {
          invalidProductsThisPage++;
          skipped++;
          continue;
        }

        const productKey = externalId || slugify(`${subcategory.name}-${fullName}`);

        if (seenProductKeys.has(productKey)) {
          continue;
        }

        seenProductKeys.add(productKey);
        newProductsThisPage++;

        await prisma.product.upsert({
          where: {
            productKey_supermarket: {
              productKey,
              supermarket: SUPERMARKET
            }
          },
          update: {
            name: fullName,
            price,
            photoURL: image,
            categoryName: subcategory.name
          },
          create: {
            name: fullName,
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
        invalidProductsThisPage++;
        console.error(
          `Failed to process product in subcategory ${subcategory.name}:`,
          error
        );
      }
    }

    console.log(
      `Page ${pageNumber} finished. New unique products: ${newProductsThisPage}, invalid/skipped: ${invalidProductsThisPage}`
    );

    // Stop only after page 2+ returns no new items
    // This avoids falsely stopping on page 1 if the first page behaves differently.
    if (pageNumber > 1 && newProductsThisPage === 0) {
      console.log(`No new products on page ${pageNumber}. Stopping.`);
      break;
    }
  }

  console.log(`Finished subcategory: ${subcategory.name}`);

  return { saved, skipped };
}

async function scrapeCategoryByPages(page: Page, category: AbCategory) {
  console.log("\n==========");
  console.log(`Scraping category directly: ${category.name}`);

  let saved = 0;
  let skipped = 0;

  const seenProductKeys = new Set<string>();
  const MAX_PAGES = 50;

  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber++) {
    const url = buildPagedUrl(category.path, pageNumber);

    console.log(`Opening page ${pageNumber}: ${url}`);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForTimeout(4000);

    const hasProducts = await waitForProductsOrTimeout(page, 8000);

    if (!hasProducts) {
      console.log(`No product-name elements found on page ${pageNumber}. Stopping.`);
      break;
    }

    const html = await page.content();
    const $ = cheerio.load(html);
    const items = $("li.product-item");

    console.log(`Found ${items.length} product tiles on page ${pageNumber}`);

    if (items.length === 0) {
      console.log(`No products on page ${pageNumber}. Stopping.`);
      break;
    }

    let newProductsThisPage = 0;
    let invalidProductsThisPage = 0;

    for (const el of items.toArray()) {
      try {
        const item = $(el);

        const nameLink = item.find('[data-testid="product-block-name-link"]');
        const brand = item.find('[data-testid="product-brand"]').text().trim();
        const productName = item.find('[data-testid="product-name"]').text().trim();

        const cleanBrand = brand === "-" ? "" : brand;
        const fullName = `${cleanBrand} ${productName}`.replace(/\s+/g, " ").trim();

        const relativeUrl = nameLink.attr("href") || null;
        const externalId = extractProductId(relativeUrl);
        const image = extractImageUrl(item);
        const price = extractPrice(item);

        if (!fullName || price == null) {
          invalidProductsThisPage++;
          skipped++;
          continue;
        }

        const productKey = externalId || slugify(`${category.name}-${fullName}`);

        if (seenProductKeys.has(productKey)) {
          continue;
        }

        seenProductKeys.add(productKey);
        newProductsThisPage++;

        await prisma.product.upsert({
          where: {
            productKey_supermarket: {
              productKey,
              supermarket: SUPERMARKET
            }
          },
          update: {
            name: fullName,
            price,
            photoURL: image,
            categoryName: category.name
          },
          create: {
            name: fullName,
            price,
            photoURL: image,
            productKey,
            supermarket: SUPERMARKET,
            categoryName: category.name
          }
        });

        saved++;
      } catch (error) {
        skipped++;
        invalidProductsThisPage++;
        console.error(`Failed to process product in category ${category.name}:`, error);
      }
    }

    console.log(
      `Page ${pageNumber} finished. New unique products: ${newProductsThisPage}, invalid/skipped: ${invalidProductsThisPage}`
    );

    if (pageNumber > 1 && newProductsThisPage === 0) {
      console.log(`No new products on page ${pageNumber}. Stopping.`);
      break;
    }
  }

  console.log(`Finished category: ${category.name}`);

  return { saved, skipped };
}

export const scrapeAB = async () => {
  console.log("Starting AB scraper with Playwright...");

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    locale: "el-GR"
  });

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

          const result = await scrapeCategoryByPages(page, category);
          totalSaved += result.saved;
          totalSkipped += result.skipped;
          await page.waitForTimeout(2000);
          continue;
        }

        for (const subcategory of subcategories) {
          try {
            const result = await scrapeSubcategoryByPages(page, subcategory);
            totalSaved += result.saved;
            totalSkipped += result.skipped;
          } catch (error) {
            console.error(
              `Subcategory scrape failed: ${subcategory.name}`,
              error
            );
          }

          await page.waitForTimeout(2000);
        }
      } catch (error) {
        console.error(`Category scrape failed: ${category.name}`, error);
      }
    }

    console.log("\n==========");
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