-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "keyLearnings" TEXT,
ADD COLUMN     "keyLearningsTh" TEXT,
ADD COLUMN     "teamSize" VARCHAR(100),
ADD COLUMN     "teamSizeTh" VARCHAR(100),
ADD COLUMN     "techStackUsed" TEXT,
ADD COLUMN     "techStackUsedTh" TEXT,
ADD COLUMN     "timeline" VARCHAR(200),
ADD COLUMN     "timelineTh" VARCHAR(200);
