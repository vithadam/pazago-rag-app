import "dotenv/config";
import { MDocument } from "@mastra/rag";
import { initVectorStore, insertDocument } from "../src/lib/vector-store";
import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";

async function ingest() {
  await initVectorStore();
  console.log("✓ Vector store initialized");

  const docsDir = path.join(process.cwd(), "documents");
  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".pdf"));
  console.log(`Found ${files.length} PDFs`);

  for (const file of files) {
    console.log(`Processing: ${file}`);
    const year = file.match(/\d{4}/)?.[0] || "unknown";

    const buffer = fs.readFileSync(path.join(docsDir, file));
    const pdfParse = new PDFParse({ data: buffer });
    const textResult = await pdfParse.getText();
    await pdfParse.destroy();

    const doc = new MDocument({ docs: [{ text: textResult.text }], type: "text" });
    const chunks = await doc.chunk({ strategy: "recursive", size: 1000, overlap: 200 });

    for (let i = 0; i < chunks.length; i++) {
      await insertDocument(`${file}-${i}`, chunks[i].text, file, year);
    }
    console.log(`✓ ${file}: ${chunks.length} chunks`);
  }

  console.log("Done!");
  process.exit(0);
}

ingest();