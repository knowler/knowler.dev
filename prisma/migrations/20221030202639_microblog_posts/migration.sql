/*
  Warnings:

  - The primary key for the `MicroBlogPost` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `slug` on the `MicroBlogPost` table. All the data in the column will be lost.
  - The required column `id` was added to the `MicroBlogPost` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MicroBlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_MicroBlogPost" ("content", "publishedAt") SELECT "content", "publishedAt" FROM "MicroBlogPost";
DROP TABLE "MicroBlogPost";
ALTER TABLE "new_MicroBlogPost" RENAME TO "MicroBlogPost";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
