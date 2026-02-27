import { Request, Response } from 'express';
import { smileService } from '../services/smileService';

export const smileController = {
  verify: async (req: Request, res: Response) => {
    const { image } = req.body; // base64 or url
    const result = await smileService.verifySmile(image);
    res.json(result);
  },
  reward: async (req: Request, res: Response) => {
    const { userId, score } = req.body;
    const result = await smileService.issueReward(userId, score);
    res.json(result);
  },
};
