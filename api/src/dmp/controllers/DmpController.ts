import DmpService from '../services/DmpService';
import PdfService from '../services/PdfService';
import LlmService from '../services/KE_LLM_Service';

export default {
  getDmpReportById: async (req: any, res: any) => {
    const dmpId = req.body.dmpId;

    // TODO: validate DMP ID

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
    } catch (error: any) {
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
  getDmpReportByText: async (req: any, res: any) => {
    const dmpText = req.body.dmpText;

    // TODO: validate and sanitize text

    // Process the request
    try {
      const llmResponse = await LlmService.queryLlm(dmpText);

      return await res.status(200).json({
        status: res.status,
        data: {
          analysis: llmResponse.response,
          metadata: llmResponse.metadata,
        },
      });
    } catch (error: any) {
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
