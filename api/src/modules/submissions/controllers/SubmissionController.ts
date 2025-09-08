import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';

import { SubmissionService } from '../services/SubmissionService';
import { Submission } from '../../../entities/submission.entity';
import { utils, write } from 'xlsx';
import { format } from 'date-fns';

export default class SubmissionController {
  private submissionService: SubmissionService;

  constructor(submissionService: SubmissionService) {
    this.submissionService = submissionService;
  }

  getAllSubmissions = (req: Request, res: Response) => {
    this.submissionService
      .findAllSubmissions()
      .then((submissions: Submission[]) => {
        const submissionDtos = submissions.map((submission) =>
          plainToClass(Submission, submission, {
            excludeExtraneousValues: true,
          })
        );

        res.status(200).json({
          status: true,
          data: { submissions: submissionDtos },
          error: null,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
          status: false,
          data: null,
          error: err,
        });
      });
  };

  exportSubmissionsExcel = async (req: Request, res: Response) => {
    try {
      const submissions = await this.submissionService.findAllSubmissions();

      // Convert to plain objects (DTOs)
      const submissionDtos = submissions.map((submission) => {
        const dto = plainToClass(Submission, submission, {
          excludeExtraneousValues: true,
        });

        return {
          submittedAt: format(new Date(dto.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          dmspText: dto.dmspText,
          llmResponse: dto.llmResponse,
        };
      });

      // Convert JSON → worksheet
      const worksheet = utils.json_to_sheet(submissionDtos);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Submissions');

      // Generate buffer
      const buffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `submissions_${timestamp}.xlsx`;

      // Send as file response
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.send(buffer);
    } catch (err) {
      res.status(500).json({
        status: false,
        data: null,
        error: err,
      });
    }
  };
}
