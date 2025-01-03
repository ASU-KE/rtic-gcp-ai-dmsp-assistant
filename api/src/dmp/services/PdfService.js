const pdfParse = require('pdf-parse');

// const PDFExtract = require('pdf.js-extract').PDFExtract;

module.exports = {
  fetchPdfInMemory: async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    // return PDF as a Uint8Array buffer object
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  },

  extractText: async (buffer) => {
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
