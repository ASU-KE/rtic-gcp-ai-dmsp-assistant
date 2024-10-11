const DmpService = require('../services/DmpService');
const PdfService = require('../services/PdfService');
const LlmService = require('../services/KE_LLM_Service');

module.exports = {
  getDmpReportById: async (req, res) => {
    const dmpId = req.body.dmpId;

    // Process the request
    try {
      const dmpPdfUrl = await DmpService.getDmpResource(dmpId);
      const pdfDocument = await PdfService.fetchPdfInMemory(dmpPdfUrl);
      const dmpText = await PdfService.extractText(pdfDocument);
      const llmResponse = await LlmService.queryLlm(dmpText);

      return await res.status(200).json({
        status: res.status,
        data: {
          id: dmpId,
          document_url: await dmpPdfUrl,
          documentText: await dmpText,
          analysis: llmResponse.response,
          metadata: llmResponse.metadata,
        },
      });
    } catch (error) {
      if (error.status === 404) {
        return res.status(404).json({
          status: error.status,
          error: {
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        status: res.status,
        error: {
          message: error.message,
        },
      });
    }
  },
};
