import pdfParse from 'pdf-parse';

// import { PDFExtract } from 'pdf.js-extract';
// const PDFExtract = PDFExtract()

export default {
  fetchPdfInMemory: async (url: string): Promise<Uint8Array> => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  },

  extractText: async (buffer: Buffer): Promise<string> => {
    const pdfData = await pdfParse(buffer);
    return pdfData.text;
  },
};
