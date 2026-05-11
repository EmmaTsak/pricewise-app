import { PrismaClient } from "@prisma/client";
import { getPriceWiseCategory } from "../src/utils/categoryMap";

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.product.findMany({
    select: {
      categoryName: true,
      supermarket: true,
    },
    distinct: ["categoryName", "supermarket"],
    orderBy: {
      categoryName: "asc",
    },
  });

  console.log("\nCATEGORY MAPPING CHECK\n");

  for (const item of categories) {
    const mappedCategory = getPriceWiseCategory(item.categoryName);

    console.log(
      `${item.supermarket} | ${item.categoryName ?? "NO CATEGORY"} -> ${mappedCategory.name}`
    );
  }

  const unknownCategories = categories.filter((item) => {
    const mappedCategory = getPriceWiseCategory(item.categoryName);
    return mappedCategory.slug === "unknown";
  });

  console.log("\nUNKNOWN CATEGORIES\n");

  if (unknownCategories.length === 0) {
    console.log("No unknown categories found.");
  } else {
    for (const item of unknownCategories) {
      console.log(`${item.supermarket} | ${item.categoryName ?? "NO CATEGORY"}`);
    }
  }

  console.log(`\nTotal category-store combinations: ${categories.length}`);
  console.log(`Unknown category-store combinations: ${unknownCategories.length}`);
}

main()
  .catch((error) => {
    console.error("Category check failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });