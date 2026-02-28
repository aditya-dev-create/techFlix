import { Router } from 'express';
import * as campaignController from '../controllers/campaignController';

export default function campaignRoutes(io: any) {
  const r = Router();

  r.use((req: any, _res, next) => {
    req.io = io;
    next();
  });

  r.get('/', campaignController.getCampaigns);
  r.get('/:id', campaignController.getCampaignById);
  r.post('/', campaignController.createCampaign);
  r.post('/release-milestone', campaignController.releaseMilestone);
  r.post('/approve-milestone', campaignController.approveMilestoneVirtually);

  return r;
}
