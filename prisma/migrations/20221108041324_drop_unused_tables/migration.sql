/*
  Warnings:

  - You are about to drop the `CachedBlogPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CachedPage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MicroBlogPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CachedBlogPost";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CachedPage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MicroBlogPost";
PRAGMA foreign_keys=on;
