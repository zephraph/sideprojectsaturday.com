-- AlterTable
ALTER TABLE "account" ADD COLUMN "password" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN "image" TEXT;

-- CreateTable
CREATE TABLE "banner_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Insert default banner configuration
INSERT INTO "banner_config" ("id", "content", "enabled", "createdAt", "updatedAt") 
VALUES (
    'clzxyz123456789abcdefghij',
    '🚧 New site just launched, report bugs [here](https://github.com/zephraph/sideprojectsaturday.com/issues/new) 🚧',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_break" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_break" ("createdAt", "endDate", "id", "reason", "startDate", "updatedAt") SELECT "createdAt", "endDate", "id", "reason", "startDate", "updatedAt" FROM "break";
DROP TABLE "break";
ALTER TABLE "new_break" RENAME TO "break";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
