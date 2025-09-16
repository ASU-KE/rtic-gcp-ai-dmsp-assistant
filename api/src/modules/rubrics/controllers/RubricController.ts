import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { DeleteResult } from 'typeorm';

import { RubricService } from '../services/RubricService';
import { Rubric, FundingAgency } from '../../../entities/rubric.entity';

export default class RubricController {
  private rubricService: RubricService;

  constructor(rubricService: RubricService) {
    this.rubricService = rubricService;
  }

  private normalizeAgency(agency: string): FundingAgency | null {
    const normalized = agency.toUpperCase();
    return Object.values(FundingAgency).includes(normalized as FundingAgency)
      ? (normalized as FundingAgency)
      : null;
  }

  getAllRubrics = (req: Request, res: Response) => {
    this.rubricService
      .findAllRubrics()
      .then((rubrics: Rubric[]) => {
        const rubricDtos = rubrics.map((rubric) =>
          plainToClass(Rubric, rubric, {
            excludeExtraneousValues: true,
          })
        );

        return res.status(200).json({
          status: true,
          data: { rubrics: rubricDtos },
          error: null,
        });
      })
      .catch((err: Error) => {
        return res.status(500).json({
          status: false,
          data: null,
          error: err,
        });
      });
  };

  createRubric = async (
    req: Request<object, object, { agency: FundingAgency; rubricText: string }>,
    res: Response
  ) => {
    const { agency, rubricText } = req.body;

    if (!agency || !rubricText) {
      return res.status(400).json({
        status: false,
        data: null,
        error: { message: 'Agency and rubricText are required.' },
      });
    }

    const normalizedAgency = this.normalizeAgency(agency);
    if (!normalizedAgency) {
      return res.status(400).json({
        status: false,
        data: null,
        error: { message: `Invalid agency: ${agency}` },
      });
    }

    try {
      const rubric = await this.rubricService.createRubric({
        agency,
        rubricText: rubricText,
      });

      const rubricDto = plainToClass(Rubric, rubric, {
        excludeExtraneousValues: true,
      });

      return res.status(201).json({
        status: true,
        data: { rubric: rubricDto },
        error: null,
      });
    } catch (err: any) {
      if (
        err.code === '23505' ||
        err.code === 'ER_DUP_ENTRY' ||
        err.errno === 1062
      ) {
        return res.status(400).json({
          status: false,
          data: null,
          error: {
            message: `A rubric for agency "${agency}" already exists.`,
          },
        });
      }

      return res.status(500).json({
        status: false,
        data: null,
        error: { message: err.message || 'Internal server error' },
      });
    }
  };

  getRubric = (req: Request, res: Response) => {
    const { agency } = req.params;

    if (!agency) {
      return res.status(400).json({
        status: false,
        data: null,
        error: { message: 'Agency is required.' },
      });
    }

    const normalizedAgency = this.normalizeAgency(agency);
    if (!normalizedAgency) {
      return res.status(400).json({
        status: false,
        data: null,
        error: { message: `Invalid agency: ${agency}` },
      });
    }

    this.rubricService
      .findRubric({ agency: normalizedAgency })
      .then((rubric: Rubric | null) => {
        if (!rubric) {
          return res.status(404).json({
            status: false,
            data: null,
            error: { message: 'Rubric not found.' },
          });
        }

        const rubricDto = plainToClass(Rubric, rubric, {
          excludeExtraneousValues: true,
        });

        return res.status(200).json({
          status: true,
          data: { rubric: rubricDto },
          error: null,
        });
      })
      .catch((err: Error) => {
        return res.status(500).json({
          status: false,
          data: null,
          error: { message: err.message },
        });
      });
  };

  updateRubric = async (
    req: Request<{ agency: string }, object, { rubricText: string }>,
    res: Response
  ) => {
    const { agency } = req.params;
    const { rubricText } = req.body;

    if (!agency || !rubricText) {
      return res.status(400).json({
        status: false,
        data: null,
        error: { message: 'Agency and rubricText are required.' },
      });
    }

    const normalizedAgency = this.normalizeAgency(agency);
    if (!normalizedAgency) {
      return res.status(400).json({
        status: false,
        data: null,
        error: { message: `Invalid agency: ${agency}` },
      });
    }

    try {
      const result = await this.rubricService.updateRubric(
        { agency: normalizedAgency },
        { rubricText: rubricText }
      );

      if ((result.affected ?? 0) === 0) {
        return res.status(404).json({
          status: false,
          data: null,
          error: { message: `Rubric for agency "${agency}" not found.` },
        });
      }

      // Fetch the updated rubric to return
      const updatedRubric = await this.rubricService.findRubric({
        agency: normalizedAgency,
      });
      const rubricDto = plainToClass(Rubric, updatedRubric, {
        excludeExtraneousValues: true,
      });

      return res.status(200).json({
        status: true,
        data: { rubric: rubricDto },
        error: null,
      });
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        data: null,
        error: { message: err.message || 'Internal server error' },
      });
    }
  };

  deleteRubric = (req: Request<{ agency: string }>, res: Response) => {
    const { agency } = req.params;

    if (!agency) {
      return res.status(400).json({
        status: false,
        data: null,
        error: { message: 'Agency is required.' },
      });
    }

    const normalizedAgency = this.normalizeAgency(agency);
    if (!normalizedAgency) {
      return res.status(400).json({
        status: false,
        data: null,
        error: { message: `Invalid agency: ${agency}` },
      });
    }

    this.rubricService
      .deleteRubric({ agency: normalizedAgency })
      .then((result: DeleteResult) => {
        const deleted = result.affected ?? 0;

        if (deleted === 0) {
          return res.status(404).json({
            status: false,
            data: null,
            error: { message: `Rubric for agency "${agency}" not found.` },
          });
        }

        return res.status(200).json({
          status: true,
          data: {
            numberOfRubricsDeleted: deleted,
          },
          error: null,
        });
      })
      .catch((err: Error) => {
        return res.status(500).json({
          status: false,
          data: null,
          error: err.message || 'Internal server error',
        });
      });
  };
}
