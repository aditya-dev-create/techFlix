import { Request, Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';

export const donationController = {
  createDonationRecord: async (req: Request, res: Response, io?: any) => {
    try {
      const { campaignId, wallet, amount, txHash } = req.body;
      const normalizedWallet = wallet.toLowerCase();

      if (!campaignId || !wallet || !amount || !txHash) {
        return res.status(400).json({ error: 'Missing donation details' });
      }

      // Start transaction to ensure both records are updated
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the donation record
        const donation = await tx.donation.create({
          data: {
            campaignId,
            wallet: normalizedWallet,
            amount: amount.toString(),
            txHash,
          }
        });

        // 2. Update the campaign's amountCollected
        const campaign = await tx.campaign.update({
          where: { id: campaignId },
          data: {
            amountCollected: {
              increment: amount
            }
          },
          include: {
            donations: {
              orderBy: { timestamp: 'desc' }
            },
            ngo: true,
            milestones: true
          }
        });

        // 3. Optional: Link to user if exists
        const user = await tx.user.findUnique({ where: { wallet: normalizedWallet } });
        if (user) {
          await tx.donation.update({
            where: { id: donation.id },
            data: { userId: user.id }
          });
        }

        // Emit socket event if io is provided
        if (io) {
          io.emit('CAMPAIGN_UPDATED', campaign);
          io.emit('NEW_DONATION', { campaignId, donation });
        }

        return { donation, campaign };
      });

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error recording donation:', error);
      res.status(500).json({ error: 'Failed to record donation' });
    }
  },

  handleSyncWebhook: async (req: Request, res: Response) => {
    // This could be used by the event listener (already implemented in another file possibly)
    res.json({ message: 'Sync not implemented via this endpoint yet' });
  }
};
