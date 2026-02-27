import { Router } from 'express';

export default function adminRoutes() {
  const r = Router();
  r.post('/ngo/:id/approve', async (req, res) => res.json({ ok: true }));
  r.post('/campaign/:id/suspend', async (req, res) => res.json({ ok: true }));
  r.get('/audit', async (req, res) => res.json({ ok: true }));
  return r;
}
