-- AlterTable
ALTER TABLE "About" ADD COLUMN     "goals" TEXT,
ADD COLUMN     "goalsTh" TEXT,
ADD COLUMN     "nowLearning" TEXT,
ADD COLUMN     "nowLearningTh" TEXT,
ADD COLUMN     "strengths" TEXT,
ADD COLUMN     "strengthsTh" TEXT;

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readingTime" INTEGER;

-- CreateTable
CREATE TABLE "EngineeringHighlight" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "titleTh" VARCHAR(200),
    "icon" VARCHAR(100),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EngineeringHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EngineeringHighlight_isVisible_sortOrder_idx" ON "EngineeringHighlight"("isVisible", "sortOrder");
