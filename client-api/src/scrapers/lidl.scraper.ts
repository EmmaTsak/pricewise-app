import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "../config/prisma";

const LIDL_URL = "https://www.lidl-hellas.gr/?utm_source=google&utm_medium=cpc&utm_campaign=Search_Brand&gad_source=1&gad_campaignid=18499859694&gbraid=0AAAAAo7mbU9BoN2od3g3t6JzI6sUZwQnW&gclid=CjwKCAjwyMnNBhBNEiwA-Kcgu6whOnJrnxPNWLVdPP5cFwmKdkXa90HEwPCmhXup2HM97KBrqoOE1BoCz-0QAvD_BwE#";

export const scrapeLidl = async () => {
    try {
        const { data } = await axios.get(LIDL_URL);
        const $ = cheerio.load(data);
        const products: any[] = [];

        $(".product-card").each((_, element) => {
            const name = $(element).find(".product-title").text().trim();
            const price = $(element).find(".price").text().trim();
            const photoURL = $(element).find(".img").attr("src");
            const productKey = name.toLowerCase().replace(/\s+/g, "-");

            products.push({
                name,
                price,
                photoURL,
                productKey,
                supermarket: "Lidl",
                category: "Unknown"
            });
        });

        // Save products to database
        for (const product of products) {
            await prisma.product.upsert({
                where: {
                    productKey_supermarket: {
                        productKey: product.productKey,
                        supermarket: "Lidl"
                }
                },
                update: {
                    price: product.price,
                    photoURL: product.photoURL
                },
                create: product
            });
            }

            console.log(`Lidl scraper saved ${products.length} products`);

        } catch (error) {
            console.error("Lidl scraper failed:", error);
        }
    };