-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "BlogPost_sortOrder_idx" ON "BlogPost"("sortOrder");
