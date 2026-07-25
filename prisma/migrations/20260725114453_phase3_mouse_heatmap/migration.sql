-- CreateTable
CREATE TABLE "MouseEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "targetSelector" TEXT,
    "hoverDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MouseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeatmapEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "xPct" DOUBLE PRECISION NOT NULL,
    "yPct" DOUBLE PRECISION NOT NULL,
    "viewportWidth" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeatmapEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MouseEvent_sessionId_idx" ON "MouseEvent"("sessionId");

-- CreateIndex
CREATE INDEX "MouseEvent_path_type_idx" ON "MouseEvent"("path", "type");

-- CreateIndex
CREATE INDEX "HeatmapEvent_path_type_idx" ON "HeatmapEvent"("path", "type");

-- AddForeignKey
ALTER TABLE "MouseEvent" ADD CONSTRAINT "MouseEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeatmapEvent" ADD CONSTRAINT "HeatmapEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
