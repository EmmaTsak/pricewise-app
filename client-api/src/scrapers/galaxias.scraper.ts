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

const SUPERMARKET = "Galaxias";
const BASE_URL = "https://galaxias.shop";
const ESHOP_URL = `${BASE_URL}/eshop`;

type GalaxiasCategory = {
  name: string;
  index: number;
};

type GalaxiasSubcategory = {
  name: string;
  index: number;
  parentCategoryName: string;
};

type GalaxiasProduct = {
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

async function waitForAngularRender(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", {
        timeout: 5000
    }).catch(() => {
  });

  await page.waitForTimeout(800);
}

async function waitForMainCategories(page: Page) {
  await page.waitForSelector("#categories-eshop .menu-prod-tile", {
    timeout: 30000
  });
}

async function waitForProductCards(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector("product-card", {
      timeout: 8000
    });

    return true;
  } catch {
    return false;
  }
}

async function getGalaxiasCategories(page: Page): Promise<GalaxiasCategory[]> {
  console.log("Opening Galaxias e-shop...");

  await page.goto(ESHOP_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  await closeCookiePopup(page);
  await waitForMainCategories(page);
  await waitForAngularRender(page);

  const categories = await page.evaluate(() => {
    const tiles = Array.from(
      document.querySelectorAll<HTMLElement>(
        "#categories-eshop .menu-prod-tile"
      )
    );

    return tiles
      .map((tile, index) => {
        const nameFromText =
          tile.querySelector("p")?.textContent?.replace(/\s+/g, " ").trim() ||
          "";

        const nameFromImage =
          tile.querySelector("img")?.getAttribute("alt")?.trim() || "";

        return {
          name: nameFromText || nameFromImage,
          index
        };
      })
      .filter((category) => category.name.length > 0);
  });

  console.log(`Found ${categories.length} Galaxias main categories:`);

  for (const category of categories) {
    console.log(`- ${category.name}`);
  }

  return categories;
}

async function openMainCategory(page: Page, category: GalaxiasCategory) {
  console.log(`Opening Galaxias category: ${category.name}`);

  await page.goto(ESHOP_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  await closeCookiePopup(page);
  await waitForMainCategories(page);
  await waitForAngularRender(page);

  const tiles = page.locator("#categories-eshop .menu-prod-tile");
  const tile = tiles.nth(category.index);

  await tile.scrollIntoViewIfNeeded();
  await tile.click();

  await waitForAngularRender(page);
}

async function waitForSubcategoryCarousel(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector("app-category-bubbles", {
      timeout: 5000
    });

    await page.waitForFunction(
      () => {
        const desktopItems = document.querySelectorAll(
          "app-category-bubbles .showsDesktopDashboardMenu .simple-carousel-item"
        );

        const anyItems = document.querySelectorAll(
          "app-category-bubbles .simple-carousel-item"
        );

        return desktopItems.length > 0 || anyItems.length > 0;
      },
      undefined,
      {
        timeout: 5000
      }
    );

    return true;
  } catch {
    return false;
  }
}

async function getGalaxiasSubcategories(
    page: Page,
    parentCategoryName: string
    ): Promise<GalaxiasSubcategory[]> {
    const hasCarousel = await waitForSubcategoryCarousel(page);

    if (!hasCarousel) {
        console.log(`No subcategory carousel found for ${parentCategoryName}.`);
        return [];
    }

    const subcategories = await page.evaluate((parent) => {
        function readItems(selector: string) {
        const items = Array.from(document.querySelectorAll<HTMLElement>(selector));

        return items
            .map((item, index) => {
            const nameFromText =
                item
                .querySelector(".text-center")
                ?.textContent?.replace(/\s+/g, " ")
                .trim() || "";

            const nameFromImage =
                item.querySelector("img")?.getAttribute("alt")?.trim() || "";

            return {
                name: nameFromText || nameFromImage,
                index,
                parentCategoryName: parent
            };
            })
            .filter((item) => item.name.length > 0);
        }

        const desktopItems = readItems(
        "app-category-bubbles .showsDesktopDashboardMenu .simple-carousel-item"
        );

        if (desktopItems.length > 0) {
        return desktopItems;
        }

        return readItems("app-category-bubbles .simple-carousel-item");
    }, parentCategoryName);

    console.log(
        `Found ${subcategories.length} subcategories in ${parentCategoryName}:`
    );

    for (const subcategory of subcategories) {
        console.log(`- ${subcategory.name}`);
    }

    return subcategories;
    }

    async function openSubcategory(
    page: Page,
    subcategory: GalaxiasSubcategory
    ) {
    console.log(`Opening Galaxias subcategory: ${subcategory.name}`);

    const desktopSelector =
        "app-category-bubbles .showsDesktopDashboardMenu .simple-carousel-item";

    const fallbackSelector = "app-category-bubbles .simple-carousel-item";

    const desktopCount = await page.locator(desktopSelector).count();

    if (desktopCount > 0) {
        const item = page
        .locator(desktopSelector)
        .filter({ hasText: subcategory.name })
        .first();

        await item.scrollIntoViewIfNeeded();
        await item.click();

        await waitForAngularRender(page);
        return;
    }

    const fallbackItem = page
        .locator(fallbackSelector)
        .filter({ hasText: subcategory.name })
        .first();

    await fallbackItem.scrollIntoViewIfNeeded();
    await fallbackItem.click();

    await waitForAngularRender(page);
    }

    async function extractProductsFromCurrentPage(
    page: Page,
    categoryName: string
    ): Promise<GalaxiasProduct[]> {
    const rawProducts = await page.evaluate((categoryNameFromNode) => {
        type BrowserProduct = {
        name: string;
        href: string;
        image: string | null;
        priceText: string;
        categoryName: string;
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

    const cards = Array.from(
        document.querySelectorAll<HTMLElement>("product-card")
    );

    const results: BrowserProduct[] = [];
    const seen = new Set<string>();

    for (const card of cards) {
        const productLink = card.querySelector<HTMLAnchorElement>(
            'a[href^="/product/"]'
        );

        if (!productLink) continue;

        const href = productLink.getAttribute("href");
        if (!href) continue;

        if (seen.has(href)) continue;
        seen.add(href);

        const img = card.querySelector<HTMLImageElement>(
            'a[href^="/product/"] img[src], img[src], img[data-src], img[srcset]'
        );

        const imageAlt =
            img?.getAttribute("alt")?.replace(/\s+image$/i, "").trim() || "";

        const nameLinks = Array.from(
            card.querySelectorAll<HTMLAnchorElement>('a[href^="/product/"]')
            );

            const nameFromText =
            nameLinks
                .map((link) => link.textContent?.replace(/\s+/g, " ").trim() || "")
                .find((text) => text.length > 0 && !text.includes("€")) || "";

        const name = nameFromText || imageAlt;

        const mainPriceText =
            card
            .querySelector(".fw-900.fs-4")
            ?.textContent?.replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim() || "";

        const fallbackText =
            card.textContent?.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim() ||
            "";

        const priceText = mainPriceText || fallbackText;

        if (!name || !priceText.includes("€")) continue;

        results.push({
            name,
            href,
            image: getImageUrl(img),
            priceText,
            categoryName: categoryNameFromNode
        });
        }

        return results;
    }, categoryName);

    const products: GalaxiasProduct[] = [];

    for (const rawProduct of rawProducts) {
        const price = parseGreekPrice(rawProduct.priceText);

        if (price == null) {
        continue;
        }

        const productKey = slugify(rawProduct.href);

        products.push({
        name: normalizeSpaces(rawProduct.name),
        productKey,
        price,
        photoURL: rawProduct.image,
        url: buildFullUrl(rawProduct.href),
        categoryName: rawProduct.categoryName
        });
    }

    return products;
    }

    async function scrollUntilNoMoreProducts(page: Page) {
    console.log("Scrolling Galaxias product list...");

    let previousCount = 0;
    let stableRounds = 0;

    const MAX_SCROLLS = 22;
    const MAX_STABLE_ROUNDS = 3;

    for (let scrollNumber = 1; scrollNumber <= MAX_SCROLLS; scrollNumber++) {
        const currentCount = await page.locator("product-card").count();

            console.log(
        `Scroll ${scrollNumber}: currently found ${currentCount} product cards.`
        );

        if (currentCount === previousCount) {
            stableRounds++;
        } else {
            stableRounds = 0;
            previousCount = currentCount;
        }

        if (stableRounds >= MAX_STABLE_ROUNDS) {
        console.log("Product count stopped increasing. Finished scrolling.");
        break;
        }

        await page.evaluate(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "auto"
        });
        });

        await page.waitForTimeout(1000);
        await page.mouse.wheel(0, 2500);
        await page.waitForTimeout(800);
    }

    const finalCount = await page.locator("product-card").count();

    console.log(`Finished scrolling. Final product-card count: ${finalCount}`);
    }

    async function scrapeCurrentListingByScroll(
        page: Page,
        categoryName: string
        ) {
        let saved = 0;
        let skipped = 0;

    const seenProductKeys = new Set<string>();

    console.log(`Scraping Galaxias listing by scrolling: ${categoryName}`);

    const hasProducts = await waitForProductCards(page);

    if (!hasProducts) {
        console.log(`No product cards found for ${categoryName}.`);
        return { saved, skipped };
    }

    await scrollUntilNoMoreProducts(page);

    const products = await extractProductsFromCurrentPage(page, categoryName);

    console.log(`Found ${products.length} products after scrolling.`);

    const uniqueProducts = products.filter((product) => {
        if (seenProductKeys.has(product.productKey)) {
        return false;
        }

        seenProductKeys.add(product.productKey);
        return true;
    });

    const result = await upsertProductsInBatches(
        uniqueProducts.map((product) => ({
        ...product,
        supermarket: SUPERMARKET
        }))
    );

    saved += result.saved;
    skipped += result.skipped;

    console.log(
        `Finished ${categoryName}. Saved: ${saved}, skipped: ${skipped}`
    );

    return { saved, skipped };
    }

    async function scrapeSubcategory(
    page: Page,
    category: GalaxiasCategory,
    subcategory: GalaxiasSubcategory
    ) {
    console.log("\n----------");
    console.log(`Scraping Galaxias subcategory: ${subcategory.name}`);
    console.log(`Parent category: ${category.name}`);

    await openSubcategory(page, subcategory);

    const result = await scrapeCurrentListingByScroll(page, subcategory.name);

    console.log(
        `Finished subcategory ${subcategory.name}. Saved: ${result.saved}, skipped: ${result.skipped}`
    );

    return result;
    }

    async function scrapeCategoryDirectly(
    page: Page,
    category: GalaxiasCategory
    ) {
    console.log("\n----------");
    console.log(`Scraping Galaxias category directly: ${category.name}`);

    const result = await scrapeCurrentListingByScroll(page, category.name);

    console.log(
        `Finished category ${category.name}. Saved: ${result.saved}, skipped: ${result.skipped}`
    );

    return result;
    }

    export const scrapeGalaxias = async () => {
    console.log("Starting Galaxias scraper with Playwright...");

    const browser = await chromium.launch({
        headless: true
    });

    const context = await createFastScraperContext(browser);

    const page = await context.newPage();

    let totalSaved = 0;
    let totalSkipped = 0;

    try {
        const categories = await getGalaxiasCategories(page);

        if (categories.length === 0) {
        console.log("No Galaxias categories found.");
        return;
        }

        for (const category of categories) {
        try {
            await openMainCategory(page, category);

            const subcategories = await getGalaxiasSubcategories(
            page,
            category.name
            );

            if (subcategories.length === 0) {
            const result = await scrapeCategoryDirectly(page, category);

            totalSaved += result.saved;
            totalSkipped += result.skipped;

            await page.waitForTimeout(1500);
            continue;
            }

            for (const subcategory of subcategories) {
            try {
                await openMainCategory(page, category);

                const result = await scrapeSubcategory(
                page,
                category,
                subcategory
                );

                totalSaved += result.saved;
                totalSkipped += result.skipped;
            } catch (error) {
                console.error(
                `Failed to scrape Galaxias subcategory "${subcategory.name}":`,
                error
                );
            }

            await page.waitForTimeout(1500);
            }
        } catch (error) {
            console.error(
            `Failed to scrape Galaxias category "${category.name}":`,
            error
            );
        }
        }

        console.log("\n==========");
        console.log("Finished Galaxias scrape.");
        console.log(`Saved ${totalSaved} Galaxias products.`);
        console.log(`Skipped ${totalSkipped} Galaxias products.`);

        try {
        getIO().emit("prices-refreshed", {
            supermarket: SUPERMARKET,
            updatedAt: new Date().toISOString()
        });
        } catch (error) {
        console.error("Socket emit failed after Galaxias scrape:", error);
        }
    } catch (error) {
        console.error("Galaxias scraper failed:", error);
    } finally {
        await page.close();
        await context.close();
        await browser.close();
    }
};