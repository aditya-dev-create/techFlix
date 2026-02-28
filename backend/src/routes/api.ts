import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import ngoRoutes from './ngos';
import campaignRoutes from './campaigns';
import donationRoutes from './donations';
import milestoneRoutes from './milestones';
import smileRoutes from './smile';
import adminRoutes from './admin';
import analyticsRoutes from './analytics';

export default function apiRouter(io: any) {
  const router = Router();
  router.use('/auth', authRoutes());
  router.use('/users', userRoutes());
  router.use('/ngos', ngoRoutes());
  router.use('/campaigns', campaignRoutes(io));
  router.use('/donations', donationRoutes(io));
  router.use('/milestones', milestoneRoutes());
  router.use('/smile', smileRoutes());
  router.use('/admin', adminRoutes());
  router.use('/analytics', analyticsRoutes());
  return router;
}
