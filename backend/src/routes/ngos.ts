import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function ngoRoutes() {
  const r = Router();
  r.post('/apply', async (req, res) => {
    // upload to IPFS, create NGOProfile entry, mark unverified
    res.json({ ok: true });
  });
  r.get('/', async (req, res) => res.json({ ok: true }));
  return r;
}
