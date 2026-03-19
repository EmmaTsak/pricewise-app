import { chromium, Page } from "playwright";
import * as cheerio from "cheerio";
import prisma from "../config/prisma";

const SUPERMARKET = "AB";
const BASE_URL = "https://www.ab.gr";
const MAX_SCROLL_ROUNDS = 50;

const CATEGORY_PATHS = [
  "/el/eshop/Oporopoleio/c/001",
  "/el/eshop/Galaktokomika-Fytika-Rofimata-and-Eidi-Psygeioy/c/003",
  "/el/eshop/Fresko-Kreas-and-Psaria/c/002",
  "/el/eshop/Tyria-Fytika-Anapliromata-and-Allantika/c/004",
  "/el/eshop/Proino-snacking-and-rofimata/c/009",
  "/el/eshop/Vasika-typopoiimena-trofima/c/010",
  "/el/eshop/Katepsygmena-trofima/c/005",
  "/el/eshop/Artos-Zacharoplasteio/c/006",
  "/el/eshop/Kava-anapsyktika-nera-xiroi-karpoi/c/008",
  "/el/eshop/Etoima-Geymata/c/007",
  "/el/eshop/Eidi-prosopikis-peripoiisis/c/012",
  "/el/eshop/Katharistika-Chartika-and-eidi-spitioy/c/013",
  "/el/eshop/Gia-katoikidia/c/014",
  "/el/eshop/Ola-gia-to-moro/c/011"
];

const CATEGORY_MAP: Record<string, string> = {
  "/el/eshop/Oporopoleio/c/001": "Fruits & Vegetables",
  "/el/eshop/Galaktokomika-Fytika-Rofimata-and-Eidi-Psygeioy/c/003": "Dairy",
  "/el/eshop/Fresko-Kreas-and-Psaria/c/002": "Meat & Fish",
  "/el/eshop/Tyria-Fytika-Anapliromata-and-Allantika/c/004": "Cheese & Deli",
  "/el/eshop/Proino-snacking-and-rofimata/c/009": "Breakfast Snacks & Drinks",
  "/el/eshop/Vasika-typopoiimena-trofima/c/010": "Basic Packaged Foods",
  "/el/eshop/Katepsygmena-trofima/c/005": "Frozen Foods",
  "/el/eshop/Artos-Zacharoplasteio/c/006": "Bread & Pastry",
  "/el/eshop/Kava-anapsyktika-nera-xiroi-karpoi/c/008": "Beverages & Snacks",
  "/el/eshop/Etoima-Geymata/c/007": "Canned & Packaged Foods",
  "/el/eshop/Eidi-prosopikis-peripoiisis/c/012": "Personal Care",
  "/el/eshop/Katharistika-Chartika-and-eidi-spitioy/c/013": "Cleaning Products - Stationery & Home Supplies",
  "/el/eshop/Gia-katoikidia/c/014": "Pet Supplies",
  "/el/eshop/Ola-gia-to-moro/c/011": "Baby Products"
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

function extractProductId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/p\/(\d+)/);
  return match ? match[1] : null;
}

function extractPrice(item: cheerio.Cheerio<any>): number | null {
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

  return Number((euros + cents / 100).toFixed(2));
}

async function scrollAndCollect(page: Page) {
  const seenProducts = new Set<string>();
  const collectedHtml: string[] = [];

  let stableRounds = 0;
  let lastUniqueCount = 0;

  for (let round = 1; round <= MAX_SCROLL_ROUNDS; round++) {
    const html = await page.content();
    const $ = cheerio.load(html);
    const items = $("li.product-item");

    let newThisRound = 0;

    for (const el of items.toArray()) {
      const item = $(el);

      const relativeUrl =
        item.find('[data-testid="product-block-name-link"]').attr("href") || null;

      const key =
        extractProductId(relativeUrl) ||
        item.find('[data-testid="product-block-name-link"]').text().trim();

      if (!key || seenProducts.has(key)) continue;

      seenProducts.add(key);
      collectedHtml.push($.html(el));
      newThisRound++;
    }

    console.log(
      `Scroll round ${round}: visible=${items.length}, new=${newThisRound}, total unique=${seenProducts.size}`
    );

    if (seenProducts.size === lastUniqueCount) {
      stableRounds++;
    } else {
      stableRounds = 0;
    }

    lastUniqueCount = seenProducts.size;

    if (stableRounds >= 5) {
      console.log("No new unique products found after several rounds. Stopping.");
      break;
    }

    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(1800);

    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await page.waitForTimeout(1200);
  }

  return collectedHtml;
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
    for (const categoryPath of CATEGORY_PATHS) {
      console.log("\n==========");
      console.log(`Scraping category: ${categoryPath}`);

      const url = `${BASE_URL}${categoryPath}`;

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000
      });

      await page.waitForTimeout(5000);
      await page.waitForSelector("li.product-item", { timeout: 20000 });

      const collectedItems = await scrollAndCollect(page);

      console.log(`Collected ${collectedItems.length} unique products`);

      for (const itemHtml of collectedItems) {
        try {
          const $item = cheerio.load(itemHtml);
          const item = $item("li.product-item").first();

          const nameLink = item.find('[data-testid="product-block-name-link"]');
          const brand = item.find('[data-testid="product-brand"]').text().trim();
          const productName = item.find('[data-testid="product-name"]').text().trim();

          const cleanBrand = brand === "-" ? "" : brand;
          const fullName = `${cleanBrand} ${productName}`.replace(/\s+/g, " ").trim();

          const relativeUrl = nameLink.attr("href") || null;
          const externalId = extractProductId(relativeUrl);

          const imageAnchor = item.find('[data-testid="product-block-image-link"]');
          const image =
            imageAnchor.find("img").attr("src") ||
            imageAnchor.find("img").attr("data-src") ||
            imageAnchor.find("img").attr("srcset") ||
            null;

          const price = extractPrice(item);

          if (!fullName || price == null) {
            totalSkipped++;
            continue;
          }

          const productKey = externalId || slugify(fullName);

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
              photoURL: image
            },
            create: {
              name: fullName,
              price,
              photoURL: image,
              productKey,
              supermarket: SUPERMARKET,
              category: CATEGORY_MAP[categoryPath]
            }
          });

          totalSaved++;
        } catch (error) {
          totalSkipped++;
          console.error("Failed to process product:", error);
        }
      }

      console.log(`Finished category: ${categoryPath}`);
      await page.waitForTimeout(2000);
    }

    console.log("\n==========");
    console.log(`TOTAL Saved: ${totalSaved}`);
    console.log(`TOTAL Skipped: ${totalSkipped}`);
  } catch (error) {
    console.error("AB scraper failed:", error);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
};