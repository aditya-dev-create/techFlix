import { Router } from 'express';
import { smileController } from '../controllers/smileController';

export default function smileRoutes() {
  const r = Router();
  r.post('/verify', smileController.verify);
  r.post('/reward', smileController.reward);
  return r;
}
