import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting product groups...");

  await prisma.product.updateMany({
    data: {
      productGroupId: null,
      categoryId: null,
      normalizedName: null,
      size: null,
    },
  });

  await prisma.productGroup.deleteMany();
  await prisma.category.deleteMany();

  console.log("Product groups reset.");
}

main()
  .catch((error) => {
    console.error("Reset failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });