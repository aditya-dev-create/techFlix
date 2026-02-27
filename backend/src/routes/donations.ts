import { Router } from 'express';
import { donationController } from '../controllers/donationController';

export default function donationRoutes() {
  const r = Router();
  r.post('/sync', donationController.handleSyncWebhook);
  r.post('/', donationController.createDonationRecord);
  return r;
}
