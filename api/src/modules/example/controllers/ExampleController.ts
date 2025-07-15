import { Request, Response } from 'express';

export default {
  getHello: (req: Request, res: Response): void => {
    res.status(200).json({
      status: true,
      message: 'Hello!',
    });
    return;
  },
};
