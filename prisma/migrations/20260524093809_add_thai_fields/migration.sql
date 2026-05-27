-- AlterTable
ALTER TABLE "About" ADD COLUMN     "bioTh" TEXT,
ADD COLUMN     "titleTh" VARCHAR(200);

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "contentTh" TEXT,
ADD COLUMN     "excerptTh" TEXT,
ADD COLUMN     "titleTh" VARCHAR(300);

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "degreeTh" VARCHAR(200),
ADD COLUMN     "descriptionTh" TEXT,
ADD COLUMN     "fieldOfStudyTh" VARCHAR(200);

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "descriptionTh" TEXT,
ADD COLUMN     "positionTh" VARCHAR(200);

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "descriptionTh" TEXT,
ADD COLUMN     "longDescriptionTh" TEXT,
ADD COLUMN     "titleTh" VARCHAR(200);

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "categoryTh" VARCHAR(100),
ADD COLUMN     "nameTh" VARCHAR(100);
