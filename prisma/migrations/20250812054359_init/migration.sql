-- CreateTable
CREATE TABLE "SerialCounter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entity" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventType" TEXT NOT NULL,
    "actorId" TEXT,
    "resource" TEXT,
    "resourceId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "SerialCounter_entity_year_key" ON "SerialCounter"("entity", "year");
