import { Router } from 'express';
import { authController } from '../controllers/authController';

export default function authRoutes() {
  const r = Router();
  r.post('/register', authController.register);
  r.post('/login', authController.login);
  r.post('/wallet-login', authController.walletLogin);
  r.post('/refresh', authController.refresh);
  return r;
}
