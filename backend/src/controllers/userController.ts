import { Request, Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.query;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        const address = walletAddress as string;

        // Find the user by wallet
        const user = await prisma.user.findUnique({
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
                donations: {
                    include: {
                        campaign: true,
                    },
                },
            },
        });

        if (!user) {
            // If user doesn't exist yet, they have nothing
            return res.json({
                myCampaigns: [],
                myDonations: [],
                totalDonated: 0,
                totalRaised: 0
            });
        }

        const myCampaigns = user.ngoProfile?.campaigns || [];
        const myDonations = user.donations || [];

        const totalDonated = myDonations.reduce((sum, d) => sum + Number(d.amount), 0);
        const totalRaised = myCampaigns.reduce((sum, c) => sum + Number(c.amountCollected), 0);

        res.json({
            myCampaigns,
            myDonations,
            totalDonated,
            totalRaised,
            user
        });
    } catch (error) {
        logger.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};
