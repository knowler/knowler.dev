-- CreateTable
CREATE TABLE "Webmention" (
    "target" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Webmention_target_key" ON "Webmention"("target");

-- CreateIndex
CREATE UNIQUE INDEX "Webmention_source_key" ON "Webmention"("source");
