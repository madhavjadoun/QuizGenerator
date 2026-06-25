import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';

export interface PDFParseResult {
  text: string;
  pages: number;
  pageTexts: string[];
}

/**
 * Parses a PDF file from an ArrayBuffer page-by-page.
 * Returns the full concatenated text, total page count, and pageTexts array.
 */
export async function parsePDF(arrayBuffer: ArrayBuffer): Promise<PDFParseResult> {
  const data = new Uint8Array(arrayBuffer);
  
  // Use legacy pdfjs build configuration
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item) => {
          const textItem = item as { str?: string };
          return textItem.str ?? '';
        })
        .join(' ');
        
      pageTexts.push(pageText.trim());
    } catch (err) {
      console.error(`[PDF Parser] Error parsing page ${pageNum}:`, err);
      pageTexts.push('');
    }
  }

  const fullText = pageTexts.join('\n\n');

  return {
    text: fullText,
    pages: numPages,
    pageTexts,
  };
}
