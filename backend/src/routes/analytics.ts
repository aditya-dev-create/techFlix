import { Router } from 'express';

export default function analyticsRoutes() {
  const r = Router();
  r.get('/dashboard', async (req, res) => res.json({ ok: true }));
  r.get('/campaign/:id', async (req, res) => res.json({ ok: true }));
  return r;
}
