import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = '15m';
const JWT_REFRESH_EXPIRES = '7d';

export const authService = {
  register: async (email: string, password: string) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email in use');
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash: hash } });
    return { id: user.id, email: user.email };
  },
  login: async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) throw new Error('Invalid credentials');
    const access = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const refresh = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });
    return { access, refresh };
  },
  walletLogin: async (address: string, signature: string) => {
    // verify signature for a nonce-based challenge (omitted: challenge retrieval)
    // Simple validation: recover address
    const msg = `Login to TrustyCrowdFlow at ${new Date().toISOString()}`;
    const recovered = ethers.verifyMessage(msg, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) throw new Error('Invalid signature');
    let user = await prisma.user.findUnique({ where: { wallet: address } });
    if (!user) {
      user = await prisma.user.create({ data: { wallet: address } });
    }
    const access = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const refresh = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });
    return { access, refresh };
  },
  refreshToken: async (token: string) => {
    try {
      const payload: any = jwt.verify(token, JWT_SECRET);
      const access = jwt.sign({ sub: payload.sub }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      return { access };
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  },
};
