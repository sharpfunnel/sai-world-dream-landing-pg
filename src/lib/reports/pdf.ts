import "server-only";
import PDFDocument from "pdfkit";

export interface PdfStatRow {
  label: string;
  value: string;
}

export function buildSummaryPdf(title: string, rangeLabel: string, stats: PdfStatRow[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").text(title);
    doc.moveDown(0.2);
    doc.fontSize(11).font("Helvetica").fillColor("#666666").text(rangeLabel);
    doc.moveDown(1);

    stats.forEach(({ label, value }) => {
      doc.fillColor("#111111").fontSize(11).font("Helvetica").text(label, { continued: true, width: 260 });
      doc.font("Helvetica-Bold").text(`  ${value}`);
      doc.moveDown(0.35);
    });

    doc.end();
  });
}
