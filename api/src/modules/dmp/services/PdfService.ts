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

    // number of pages
    // console.log('numpages:', pdfData.numpages);
    // number of rendered pages
    // console.log('numrender', pdfData.numrender);
    // PDF info
    // console.log('info:', pdfData.info);
    // PDF metadata
    // console.log('metadata:', pdfData.metadata);

    return pdfData.text;
  },
};
