import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { DeleteResult } from 'typeorm';

import { RubricService } from '../services/RubricService';
import { Rubric } from '../../../entities/rubric.entity';

export default class RubricController {
  private rubricService: RubricService;

  constructor(rubricService: RubricService) {
    this.rubricService = rubricService;
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

        res.status(200).json({
          status: true,
          data: { rubrics: rubricDtos },
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

  createRubric = async (
    req: Request<object, object, { agency: string; rubricText: string }>,
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

    try {
      const rubric = await this.rubricService.createRubric({
        agency: agency.toUpperCase(),
        rubricText: rubricText,
      });

      const safeRubric = plainToClass(Rubric, rubric, {
        excludeExtraneousValues: true,
      });

      return res.status(201).json({
        status: true,
        data: { rubric: safeRubric },
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
      res.status(400).json({
        status: false,
        data: null,
        error: { message: 'Agency is required.' },
      });
      return;
    }

    this.rubricService
      .findRubric({ agency })
      .then((rubric: Rubric | null) => {
        if (!rubric) {
          res.status(404).json({
            status: false,
            data: null,
            error: { message: 'Rubric not found.' },
          });
          return;
        }

        const rubricDto = plainToClass(Rubric, rubric, {
          excludeExtraneousValues: true,
        });

        res.status(200).json({
          status: true,
          data: { rubric: rubricDto },
          error: null,
        });
      })
      .catch((err: Error) => {
        res.status(500).json({
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

    try {
      const result = await this.rubricService.updateRubric(
        { agency: agency.toUpperCase() },
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
        agency: agency.toUpperCase(),
      });
      const safeRubric = plainToClass(Rubric, updatedRubric, {
        excludeExtraneousValues: true,
      });

      return res.status(200).json({
        status: true,
        data: { rubric: safeRubric },
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

    this.rubricService
      .deleteRubric({ agency })
      .then((result: DeleteResult) => {
        const deleted = result.affected ?? 0;
        res.status(200).json({
          status: true,
          data: {
            numberOfRubricsDeleted: deleted,
          },
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
}
