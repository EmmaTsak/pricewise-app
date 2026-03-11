-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "productKey" TEXT NOT NULL,
    "price" DECIMAL(6,2) NOT NULL,
    "supermarket" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "photoURL" TEXT NOT NULL,
    "url" TEXT,
    "size" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_supermarket_idx" ON "Product"("supermarket");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_productKey_idx" ON "Product"("productKey");
