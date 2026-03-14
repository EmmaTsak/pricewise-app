import { chromium } from "playwright";
import prisma from "../config/prisma";

const LIDL_URL = "https://www.lidl-hellas.gr/c/fagito-poto/s10068374";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

function parsePrice(priceText: string) {
  const cleaned = priceText
    .replace(/[^\d,.-]/g, "")
    .replace(".", "")
    .replace(",", ".");

  return Number(cleaned);
}

export const scrapeLidl = async () => {

  console.log("Starting Lidl scraper...");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(LIDL_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  // accept cookie popup if present
  try {
    await page.click('button:has-text("Αποδοχή")', { timeout: 5000 });
  } catch {}

  // scroll to trigger lazy loading
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));

  // wait for products
  await page.waitForSelector(".product-grid-box__title", {
    timeout: 30000
  });

  const products = await page.$$eval(".product-grid-box", cards =>
    cards.map(card => ({
      name: card.querySelector(".product-grid-box__title")?.textContent?.trim(),
      price: card.querySelector(".ods-price__value")?.textContent?.trim(),
      image: card.querySelector("img")?.getAttribute("src")
    }))
  );

  console.log("Products found:", products.length);

  for (const product of products) {

    if (!product.name || !product.price) continue;

    const price = parsePrice(product.price);
    const productKey = slugify(product.name);

    await prisma.product.upsert({
      where: {
        productKey_supermarket: {
          productKey,
          supermarket: "Lidl"
        }
      },
      update: {
        price,
        photoURL: product.image ?? ""
      },
      create: {
        name: product.name,
        price,
        photoURL: product.image ?? "",
        productKey,
        supermarket: "Lidl",
        category: "Food & Drink"
      }
    });

  }

  console.log("Saved products:", products.length);

  await browser.close();
};