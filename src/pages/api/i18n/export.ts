// src/pages/api/i18n/export.ts  (تحسين رسائل الخطأ + معالجة PDF)
import type { NextApiRequest, NextApiResponse } from "next";
import { readDicts, readMeta, getLangs, unionKeys } from "@/server/i18n-admin";
import fs from "fs";
import path from "path";

export const config = { api: { responseLimit: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = process.env.I18N_ADMIN_TOKEN;
    if (token && req.headers["x-admin-token"] !== token) return res.status(401).send("unauthorized");

    const format = String(req.query.format || "xlsx").toLowerCase();
    const dicts = await readDicts();
    const meta = await readMeta();
    const langs = await getLangs();
    const keys = unionKeys(dicts);

    const rows: any[][] = [["Key", ...langs, "Description", "Routes", "Selector", "Icon", "Visible"]];
    for (const k of keys) {
      rows.push([
        k,
        ...langs.map(l => dicts[l]?.[k] ?? ""),
        meta[k]?.desc || "",
        (meta[k]?.routes || []).join(", "),
        meta[k]?.selector || "",
        meta[k]?.icon || "",
        meta[k]?.visible === false ? "no" : "yes"
      ]);
    }

    if (format === "csv") {
      const csv = rows.map(r => r.map(v => {
        const s = String(v ?? ""); return /[\",\\n]/.test(s) ? `"${s.replace(/\"/g,'\"\"')}"` : s;
      }).join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="i18n.csv"`);
      return res.status(200).send(csv);
    }

    if (format === "xlsx") {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Translations");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="i18n.xlsx"`);
      return res.status(200).send(buf);
    }

    if (format === "docx") {
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun } = await import("docx");
      const doc = new Document({ sections: [{
        properties: {},
        children: [
          new Paragraph({ children: [new TextRun({ text: "Ain Oman – Translations", bold: true })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows.map(r => new TableRow({ children: r.map(c =>
              new TableCell({ children: [new Paragraph({ children: [new TextRun(String(c ?? ""))] })] })
            ) }))
          })
        ]
      }]});
      const buf = await Packer.toBuffer(doc);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="i18n.docx"`);
      return res.status(200).send(buf);
    }

    if (format === "pdf") {
      const fontRegular = path.join(process.cwd(), "src", "server", "fonts", "NotoNaskhArabic-Regular.ttf");
      const fontBold = path.join(process.cwd(), "src", "server", "fonts", "NotoNaskhArabic-Bold.ttf");
      if (!fs.existsSync(fontRegular) || !fs.existsSync(fontBold)) {
        return res.status(500).send("Arabic fonts not found under src/server/fonts");
      }

      const PdfPrinter = (await import("pdfmake")).default as any;
      const printer = new PdfPrinter({
        NotoNaskhArabic: { normal: fontRegular, bold: fontBold, italics: fontRegular, bolditalics: fontBold }
      });

      const docDefinition: any = {
        defaultStyle: { font: "NotoNaskhArabic" },
        content: [
          { text: "Ain Oman – Translations", style: "h" },
          { table: { headerRows: 1, body: rows }, layout: "lightHorizontalLines" }
        ],
        styles: { h: { fontSize: 14, bold: true, margin: [0,0,0,8] } }
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition, {});
      const chunks: Buffer[] = [];
      pdfDoc.on("data", c => chunks.push(c));
      pdfDoc.on("end", () => {
        const buf = Buffer.concat(chunks);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="i18n.pdf"`);
        res.status(200).send(buf);
      });
      pdfDoc.end();
      return;
    }

    return res.status(400).send("unsupported format");
  } catch (e: any) {
    // رسالة واضحة تُعرض في نافذة الخطأ بالواجهة
    return res.status(500).send(e?.message || "internal error");
  }
}
