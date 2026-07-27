import "server-only";
import ExcelJS from "exceljs";

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export async function buildWorkbookBuffer(
  sheetName: string,
  columns: ExcelColumn[],
  rows: Record<string, unknown>[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 18 }));
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };
  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}
