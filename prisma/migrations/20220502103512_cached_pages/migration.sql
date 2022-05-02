-- CreateTable
CREATE TABLE "CachedPage" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "markdown" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "cachedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedPage_slug_key" ON "CachedPage"("slug");
