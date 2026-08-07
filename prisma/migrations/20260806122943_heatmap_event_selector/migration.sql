-- AlterTable
ALTER TABLE "HeatmapEvent" ADD COLUMN     "elementText" TEXT,
ADD COLUMN     "selector" TEXT;

-- CreateIndex
CREATE INDEX "HeatmapEvent_path_type_selector_idx" ON "HeatmapEvent"("path", "type", "selector");
