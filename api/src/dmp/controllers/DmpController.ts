import DmpService from '../services/DmpService';
import PdfService from '../services/PdfService';
import LlmService from '../services/KE_LLM_Service';
import { Request, Response } from 'express';


const DmpController =  {
  getDmpReportById: async (req: Request, res: Response): Promise<void> => {
    const dmpId = req.body.dmpId;

    // TODO: validate DMP ID

    // Process the request
    try {
      const dmpPdfUrl = await DmpService.getDmpResource(dmpId);
      const pdfDocument = await PdfService.fetchPdfInMemory(dmpPdfUrl);
      const dmpText = await PdfService.extractText(Buffer.from(pdfDocument));
      const llmResponse = await LlmService.queryLlm(dmpText);

      if (!llmResponse) {
        res.status(500).json({
          status: 500,
          error: { message: 'Failed to fetch LLM response.' },
        });
        return;
      }

      res.status(200).json({
        status: 200,
        data: {
          id: dmpId,
          document_url: dmpPdfUrl,
          documentText: dmpText,
          analysis: llmResponse.response,
          metadata: llmResponse.metadata,
        },
      });
    } catch (error: unknown) {
      const err = error as HttpError;
      if (err.status === 404) {
        res.status(404).json({
          status: 404,
          error: {
            message: err.message,
          },
        });
        return;
      }

      res.status(500).json({
        status: 500,
        error: {
          message: err.message,
        },
      });
    }
  },
  getDmpReportByText: async (req: Request, res: Response): Promise<void> => {
    const dmpText = req.body.dmpText;

    // TODO: validate and sanitize text

    // Process the request
    try {
      const llmResponse = await LlmService.queryLlm(dmpText);

      if (!llmResponse) {
        res.status(500).json({
          status: 500,
          error: { message: 'Failed to fetch LLM response.' },
        });
        return;
      }


      res.status(200).json({
        status: 200,
        data: {
          analysis: llmResponse.response,
          metadata: llmResponse.metadata,
        },
      });
    } catch (error: unknown) {
      const err = error as HttpError;
      if (err.status === 404) {
        res.status(404).json({
          status: 404,
          error: {
            message: err.message,
          },
        });
        return;
      }

      res.status(500).json({
        status: 500,
        error: {
          message: err.message,
        },
      });
    }
  },
};

export default DmpController;
