import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const smileService = {
  verifySmile: async (image: string) => {
    // Call external Smile Detection API
    // This is a placeholder. Replace with real provider integration.
    const resp = await axios.post(process.env.SMILE_API_URL || 'https://example.com/verify', { image });
    return resp.data;
  },
  issueReward: async (userId: string, score: number) => {
    // Prevent duplicate abuse via DB checks (e.g., recent reward)
    const recent = await prisma.smileReward.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    if (recent && recent.rewarded) {
      // simple anti-abuse: require gap
      const delta = Date.now() - recent.createdAt.getTime();
      if (delta < 1000 * 60 * 5) return { ok: false, reason: 'Too many requests' };
    }
    // compute reward
    const rewardAmt = score >= 0.8 ? 1 : score >= 0.5 ? 0.2 : 0;
    const rec = await prisma.smileReward.create({ data: { userId, score, rewarded: rewardAmt > 0, rewardAmt: rewardAmt.toString() } });
    return { ok: true, rec };
  },
};
