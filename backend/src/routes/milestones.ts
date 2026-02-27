import { Router } from 'express';

export default function milestoneRoutes() {
  const r = Router();
  r.post('/:id/proof', async (req, res) => res.json({ ok: true }));
  r.post('/:id/approve', async (req, res) => res.json({ ok: true }));
  return r;
}
