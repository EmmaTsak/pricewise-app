-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "supermarket" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "photoURL" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_supermarket_idx" ON "Product"("supermarket");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");
