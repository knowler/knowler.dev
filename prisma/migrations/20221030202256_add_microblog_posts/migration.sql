-- CreateTable
CREATE TABLE "MicroBlogPost" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
