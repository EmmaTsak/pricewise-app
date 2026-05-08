-- DropIndex
DROP INDEX "Product_productKey_idx";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "matchKey" TEXT,
ADD COLUMN     "normalizedCategory" TEXT,
ADD COLUMN     "normalizedName" TEXT,
ADD COLUMN     "productGroupId" TEXT,
ADD COLUMN     "sizeUnit" TEXT,
ADD COLUMN     "sizeValue" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ProductGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "sizeValue" DOUBLE PRECISION,
    "sizeUnit" TEXT,
    "category" TEXT,
    "matchKey" TEXT NOT NULL,
    "photoURL" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductGroup_matchKey_key" ON "ProductGroup"("matchKey");

-- CreateIndex
CREATE INDEX "Product_normalizedCategory_idx" ON "Product"("normalizedCategory");

-- CreateIndex
CREATE INDEX "Product_matchKey_idx" ON "Product"("matchKey");

-- CreateIndex
CREATE INDEX "Product_productGroupId_idx" ON "Product"("productGroupId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productGroupId_fkey" FOREIGN KEY ("productGroupId") REFERENCES "ProductGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
