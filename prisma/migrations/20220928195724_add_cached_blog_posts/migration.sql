-- CreateTable
CREATE TABLE "CachedBlogPost" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "markdown" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "updatedAt" DATETIME,
    "cachedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedBlogPost_slug_key" ON "CachedBlogPost"("slug");
