import { Router } from 'express';
import { donationController } from '../controllers/donationController';

export default function donationRoutes(io: any) {
  const r = Router();
  r.post('/sync', (req, res) => donationController.handleSyncWebhook(req, res));
  r.post('/', (req, res) => donationController.createDonationRecord(req, res, io));
  return r;
}
