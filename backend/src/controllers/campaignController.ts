import { Request, Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';

export const getCampaigns = async (req: Request, res: Response) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            include: {
                ngo: true,
                milestones: { orderBy: { milestoneIndex: 'asc' } },
                donations: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(campaigns);
    } catch (error) {
        logger.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
};

export const createCampaign = async (req: Request, res: Response) => {
    try {
        const { title, description, targetAmount, deadline, ngoId, milestones, blockchainId } = req.body;
        const normalizedNgoId = ngoId.toLowerCase();

        // Basic validation
        if (!title || !description || !targetAmount || !deadline || !ngoId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Dev Helper: Ensure the NGO/User exists for the given wallet
        const user = await prisma.user.upsert({
            where: { wallet: normalizedNgoId },
            update: {},
            create: {
                wallet: normalizedNgoId,
                role: 'NGO',
                ngoProfile: {
                    create: {
                        name: `NGO (${ngoId.slice(0, 6)})`,
                        description: 'Automatically created NGO profile',
                        wallet: ngoId,
                        ipfsHash: 'default',
                    }
                }
            },
            include: { ngoProfile: true }
        });

        if (!user.ngoProfile) {
            throw new Error('Failed to create or find NGO profile');
        }

        const campaign = await prisma.campaign.create({
            data: {
                title,
                description,
                targetAmount,
                deadline: new Date(deadline),
                ngoId: user.ngoProfile.id, // Use the actual profile ID
                blockchainId,
                milestones: {
                    create: milestones?.map((m: any, index: number) => ({
                        milestoneIndex: index,
                        title: m.title,
                        amount: m.amount,
                        requiredApprovals: m.requiredApprovals || 1
                    })) || [],
                },
            },
            include: {
                milestones: true,
            },
        });

        res.status(201).json(campaign);
    } catch (error) {
        logger.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
};

export const getCampaignById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                ngo: true,
                milestones: { orderBy: { milestoneIndex: 'asc' } },
                donations: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.json(campaign);
    } catch (error) {
        logger.error('Error fetching campaign:', error);
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
};
export const releaseMilestone = async (req: Request, res: Response) => {
    try {
        const { id, milestoneIndex } = req.body;
        const campaign = await prisma.campaign.findFirst({
            where: { OR: [{ id }, { blockchainId: id.toString() }] },
            include: { milestones: true, ngo: true }
        });

        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        const ms = campaign.milestones.find(m => m.milestoneIndex === milestoneIndex);
        if (!ms) return res.status(404).json({ error: 'Milestone not found' });

        const updated = await prisma.milestone.update({
            where: { id: ms.id },
            data: { fundsReleased: true, approved: true }
        });

        const updatedCampaign = await prisma.campaign.findUnique({
            where: { id },
            include: { milestones: { orderBy: { milestoneIndex: 'asc' } }, ngo: true }
        });

        // @ts-ignore
        req.io.emit('CAMPAIGN_UPDATED', updatedCampaign);

        res.json({ message: 'Milestone released (Virtual)', milestone: updated });
    } catch (error) {
        logger.error('Error releasing milestone:', error);
        res.status(500).json({ error: 'Failed to release milestone' });
    }
};
export const approveMilestoneVirtually = async (req: Request, res: Response) => {
    try {
        const { id, milestoneIndex } = req.body;
        const campaign = await prisma.campaign.findFirst({
            where: { OR: [{ id }, { blockchainId: id.toString() }] },
            include: { milestones: true, ngo: true }
        });

        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        const ms = campaign.milestones.find(m => m.milestoneIndex === milestoneIndex);
        if (!ms) return res.status(404).json({ error: 'Milestone not found' });

        const updated = await prisma.milestone.update({
            where: { id: ms.id },
            data: { approved: true }
        });

        const updatedCampaign = await prisma.campaign.findUnique({
            where: { id: campaign.id },
            include: { milestones: { orderBy: { milestoneIndex: 'asc' } }, ngo: true }
        });

        // @ts-ignore
        req.io.emit('CAMPAIGN_UPDATED', updatedCampaign);

        res.json({ message: 'Milestone approved virtually', milestone: updated });
    } catch (error) {
        logger.error('Error approving milestone virtually:', error);
        res.status(500).json({ error: 'Failed to approve milestone' });
    }
};
