import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const authController = {
  register: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    res.json(user);
  },
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json(tokens);
  },
  walletLogin: async (req: Request, res: Response) => {
    const { address, signature } = req.body;
    const tokens = await authService.walletLogin(address, signature);
    res.json(tokens);
  },
  refresh: async (req: Request, res: Response) => {
    const { token } = req.body;
    const tokens = await authService.refreshToken(token);
    res.json(tokens);
  },
};
