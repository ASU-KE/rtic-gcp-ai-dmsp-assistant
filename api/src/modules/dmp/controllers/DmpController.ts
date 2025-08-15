import { Request, Response } from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { Submission } from '../../../entities/submission.entity';
import { AppDataSource } from '../../../config/data-source.config';
import { User } from '../../../entities/user.entity';

export interface DmpReportByIdRequestBody {
  dmpId: string;
}

export interface DmpReportByTextRequestBody {
  dmpText: string;
}

export interface DmpDependencies {
  dmpService: {
    getDmpResource(dmpId: string): Promise<string>;
  };
  pdfService: {
    fetchPdfInMemory(url: string): Promise<Uint8Array>;
    extractText(buffer: Buffer): Promise<string>;
  };
  llmService: {
    queryLlm(
      planText: string,
      ws?: WebSocket,
      wss?: WebSocketServer
    ): Promise<
      { response: string; metadata?: Record<string, unknown> } | undefined
    >;
  };
}

export const DmpController = ({
  dmpService,
  pdfService,
  llmService,
}: DmpDependencies) => {
  const submissionRepo = AppDataSource.getRepository(Submission);
  return {
    getDmpReportById: async (
      req: Request<unknown, unknown, DmpReportByIdRequestBody>,
      res: Response
    ): Promise<void> => {
      const { dmpId } = req.body;

      if (!dmpId || typeof dmpId !== 'string') {
        res.status(400).json({
          status: 400,
          error: { message: '`dmpId` must be a non-empty string' },
        });
        return;
      }

      try {
        const wss = req.app.locals.wss as WebSocketServer;
        const dmpPdfUrl = await dmpService.getDmpResource(dmpId);
        const pdfDocument = await pdfService.fetchPdfInMemory(dmpPdfUrl);
        const dmpText = await pdfService.extractText(Buffer.from(pdfDocument));
        const llmResult = await llmService.queryLlm(dmpText, undefined, wss).catch((err) => {
          console.error('Failed to fetch LLM response: ', err);
          throw err;
        });

        const submission = submissionRepo.create({
          username: (req.user as User)?.username,
          dmspText: dmpText,
          llmResponse: llmResult?.response,
        });
        await submissionRepo.save(submission);
        console.log(`DMP submission saved successfully for user: ${submission.username}`);

        res.status(202).json({
          status: 202,
          data: {
            id: dmpId,
            document_url: dmpPdfUrl,
            documentText: dmpText,
          },
        });
      } catch (error: unknown) {
        const err = error as { message: string; status?: number };
        if (err.status === 404) {
          res.status(404).json({
            status: 404,
            error: {
              message:
                'No plan found with the provided DMP ID. Please verify and try again.',
            },
          });
          return;
        }

        res.status(500).json({
          status: 500,
          error: {
            message:
              'Oops! Something went wrong on our end. Please try again in a moment.',
          },
        });
      }
    },

    getDmpReportByText: async (
      req: Request<unknown, unknown, DmpReportByTextRequestBody>,
      res: Response
    ): Promise<void> => {
      const { dmpText } = req.body;

      if (!dmpText || typeof dmpText !== 'string') {
        res.status(400).json({
          status: 400,
          error: { message: '`dmpText` must be a non-empty string' },
        });
        return;
      }
      try {
        const wss = req.app.locals.wss as WebSocketServer;
        const llmResult = await llmService.queryLlm(dmpText, undefined, wss).catch((err) => {
          console.error('Failed to fetch LLM response: ', err);
          throw err;
        });

        const submission = submissionRepo.create({
          username: (req.user as User)?.username,
          dmspText: dmpText,
          llmResponse: llmResult?.response,
        });
        await submissionRepo.save(submission);
        console.log(`DMP submission saved successfully for user: ${submission.username}`);

        res.status(202).json({
          status: 202,
          data: {
            documentText: dmpText,
          },
        });
      } catch (error: unknown) {
        const err = error as { message: string; status?: number };
        if (err.status === 404) {
          res
            .status(404)
            .json({ status: 404, error: { message: err.message } });
          return;
        }

        res.status(500).json({ status: 500, error: { message: err.message } });
      }
    },
  };
};
