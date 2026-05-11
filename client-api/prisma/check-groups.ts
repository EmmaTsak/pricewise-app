import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.productGroup.findMany({
    select: {
      id: true,
      name: true,
      size: true,
      categoryId: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  console.log("\nPRODUCT GROUP CHECK\n");

  let singleProductGroups = 0;
  let multiProductGroups = 0;

  const multiProductExamples: typeof groups = [];
  const singleProductExamples: typeof groups = [];

  for (const group of groups) {
    const productCount = await prisma.product.count({
      where: {
        productGroupId: group.id,
      },
    });

    if (productCount === 1) {
      singleProductGroups++;

      if (singleProductExamples.length < 30) {
        singleProductExamples.push(group);
      }
    }

    if (productCount >= 2) {
      multiProductGroups++;

      if (multiProductExamples.length < 20) {
        multiProductExamples.push(group);
      }
    }
  }

  console.log(`Total groups: ${groups.length}`);
  console.log(`Groups with 1 product: ${singleProductGroups}`);
  console.log(`Groups with 2+ products: ${multiProductGroups}`);

  console.log("\nEXAMPLES OF GROUPS WITH 2+ PRODUCTS\n");

  for (const group of multiProductExamples) {
    const products = await prisma.product.findMany({
      where: {
        productGroupId: group.id,
      },
      select: {
        name: true,
        supermarket: true,
        price: true,
        size: true,
        categoryName: true,
      },
    });

    console.log(`\n${group.name}`);
    console.log(`Size: ${group.size ?? "No size"}`);

    for (const product of products) {
      console.log(
        `- ${product.supermarket} | ${product.name} | ${product.size ?? "No size"} | €${product.price}`
      );
    }
  }

  console.log("\nEXAMPLES OF GROUPS WITH ONLY 1 PRODUCT\n");

  for (const group of singleProductExamples) {
    const product = await prisma.product.findFirst({
      where: {
        productGroupId: group.id,
      },
      select: {
        name: true,
        supermarket: true,
        size: true,
        categoryName: true,
      },
    });

    if (!product) continue;

    console.log(`\n${group.name}`);
    console.log(`Size: ${group.size ?? "No size"}`);
    console.log(
      `- ${product.supermarket} | ${product.name} | ${product.size ?? "No size"} | ${product.categoryName ?? "No raw category"}`
    );
  }
}

main()
  .catch((error) => {
    console.error("Group check failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });