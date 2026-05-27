-- CreateIndex
CREATE INDEX "BlogPost_isPublished_publishedAt_idx" ON "BlogPost"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "Project_isVisible_isFeatured_sortOrder_idx" ON "Project"("isVisible", "isFeatured", "sortOrder");

-- CreateIndex
CREATE INDEX "Skill_isVisible_sortOrder_idx" ON "Skill"("isVisible", "sortOrder");

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "Skill"("category");
