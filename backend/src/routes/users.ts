import { Router } from 'express';
import * as userController from '../controllers/userController';

export default function userRoutes() {
  const r = Router();
  r.get('/dashboard', userController.getDashboardData);
  return r;
}
