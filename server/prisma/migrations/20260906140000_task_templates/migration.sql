-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "family" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTemplateItem" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "relative_days" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TaskTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskTemplate_type_active_idx" ON "TaskTemplate"("type", "active");

-- CreateIndex
CREATE INDEX "TaskTemplateItem_template_id_idx" ON "TaskTemplateItem"("template_id");

-- AddForeignKey
ALTER TABLE "TaskTemplateItem" ADD CONSTRAINT "TaskTemplateItem_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "TaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

