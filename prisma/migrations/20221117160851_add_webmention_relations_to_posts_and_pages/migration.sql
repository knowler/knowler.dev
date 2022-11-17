-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Webmention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "content" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "pageId" TEXT,
    "postId" TEXT,
    CONSTRAINT "Webmention_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Webmention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Webmention" ("approved", "content", "createdAt", "id", "source", "target", "updatedAt") SELECT "approved", "content", "createdAt", "id", "source", "target", "updatedAt" FROM "Webmention";
DROP TABLE "Webmention";
ALTER TABLE "new_Webmention" RENAME TO "Webmention";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
