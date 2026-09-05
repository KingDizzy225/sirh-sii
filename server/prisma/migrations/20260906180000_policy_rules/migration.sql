-- CreateTable
CREATE TABLE "PolicyRule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Autre',
    "content" TEXT NOT NULL,
    "source" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PolicyRule_active_category_idx" ON "PolicyRule"("active", "category");

