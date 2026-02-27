import { Router } from 'express';
import * as campaignController from '../controllers/campaignController';

export default function campaignRoutes(io: any) {
  const r = Router();

  r.get('/', campaignController.getCampaigns);
  r.get('/:id', campaignController.getCampaignById);
  r.post('/', campaignController.createCampaign);

  return r;
}
