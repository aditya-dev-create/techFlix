import { Request, Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.query;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        const address = (walletAddress as string).toLowerCase();

        // Ensure user exists if we are going to fetch ngo profiles
        let user = await prisma.user.findUnique({
            where: { wallet: address },
            include: {
                ngoProfile: {
                    include: {
                        campaigns: {
                            include: {
                                donations: true,
                                milestones: true,
                            },
                        },
                    },
                },
            },
        });

        // 1. Fetch campaigns (NGO created)
        const myCampaigns = user?.ngoProfile?.campaigns || [];

        // 2. Fetch donations by wallet explicitly 
        // We do this because a user might not have a full "User" record if they only donated
        const myDonations = await prisma.donation.findMany({
            where: { wallet: address },
            include: {
                campaign: {
                    include: {
                        donations: true,
                        ngo: true,
                    },
                },
            },
            orderBy: {
                timestamp: 'desc',
            }
        });

        const totalDonated = myDonations.reduce((sum, d) => sum + Number(d.amount), 0);
        const totalRaised = myCampaigns.reduce((sum, c) => sum + Number(c.amountCollected), 0);

        let totalReleased = 0;
        myCampaigns.forEach(c => {
            c.milestones.forEach(m => {
                if (m.fundsReleased) totalReleased += Number(m.amount);
            });
        });

        res.json({
            myCampaigns,
            myDonations,
            totalDonated,
            totalRaised,
            totalReleased,
            user
        });
    } catch (error) {
        logger.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};
