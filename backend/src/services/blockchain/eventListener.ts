import { contractService } from './contractService';
import { prisma } from '../../index';
import { logger } from '../../utils/logger';

export async function initializeEventListener(io: any) {
  const contract = contractService.getContract();
  const provider = contractService.getProvider();

  logger.info('Initializing Blockchain Event Listener...');
  const contractAddress = await contract.getAddress();
  logger.info(`Listening on contract: ${contractAddress}`);

  // Process a single donation event
  const processDonationEvent = async (campaignId: bigint, donor: string, amount: bigint, totalCollected: bigint, event: any) => {
    try {
      const txHash = event.transactionHash || event.log?.transactionHash;
      if (!txHash) return;

      const amountEth = Number(amount) / 1e18;
      const totalEth = Number(totalCollected) / 1e18;
      const normalizedDonor = donor.toLowerCase();

      logger.info(`Donation detected: Campaign ${campaignId}, Donor ${normalizedDonor}, Amount ${amountEth} ETH`);

      // 1. Check if campaign exists
      const campaign = await prisma.campaign.findFirst({
        where: { blockchainId: campaignId.toString() }
      });

      if (!campaign) {
        logger.warn(`Campaign with blockchainId ${campaignId} not found in DB. Skipping sync.`);
        return;
      }

      // 2. Check if donation record already exists
      const existingDonation = await prisma.donation.findUnique({
        where: { txHash }
      });

      if (existingDonation) {
        return;
      }

      // 3. Update DB
      const updatedCampaign = await prisma.$transaction(async (tx) => {
        let user = await tx.user.upsert({
          where: { wallet: normalizedDonor },
          create: { wallet: normalizedDonor },
          update: {}
        });

        await tx.donation.create({
          data: {
            campaignId: campaign.id,
            userId: user.id,
            wallet: normalizedDonor,
            amount: amountEth,
            txHash: txHash,
          }
        });

        return await tx.campaign.update({
          where: { id: campaign.id },
          data: { amountCollected: totalEth },
          include: {
            donations: { orderBy: { timestamp: 'desc' }, take: 10 },
            ngo: true,
            milestones: true
          }
        });
      });

      // 4. Emit socket events
      io.emit('CAMPAIGN_UPDATED', updatedCampaign);
      io.emit('NEW_DONATION', {
        campaignId: campaign.id,
        donor: normalizedDonor,
        amount: amountEth,
        txHash: txHash,
        campaign: updatedCampaign
      });

      logger.info(`Successfully synced donation from block/event.`);
    } catch (err) {
      logger.error('Error in processDonationEvent:', err);
    }
  };

  const processMilestoneAdded = async (campaignId: bigint, mIndex: bigint, title: string, amount: bigint, requiredApprovals: bigint) => {
    try {
      const amountEth = Number(amount) / 1e18;
      const campaign = await prisma.campaign.findFirst({ where: { blockchainId: campaignId.toString() } });
      if (!campaign) return;

      await prisma.milestone.create({
        data: {
          campaignId: campaign.id,
          milestoneIndex: Number(mIndex),
          title,
          amount: amountEth,
          requiredApprovals: Number(requiredApprovals)
        }
      });

      const updated = await prisma.campaign.findUnique({ where: { id: campaign.id }, include: { milestones: true, ngo: true } });
      io.emit('CAMPAIGN_UPDATED', updated);
      logger.info(`Milestone added sync: Campaign ${campaignId}, Index ${mIndex}`);
    } catch (err) {
      logger.error('Error in processMilestoneAdded:', err);
    }
  };

  const processMilestoneApproved = async (campaignId: bigint, mIndex: bigint, approver: string) => {
    try {
      const campaign = await prisma.campaign.findFirst({ where: { blockchainId: campaignId.toString() } });
      if (!campaign) return;

      const ms = await prisma.milestone.findFirst({
        where: { campaignId: campaign.id, milestoneIndex: Number(mIndex) }
      });

      if (ms) {
        const updatedMs = await prisma.milestone.update({
          where: { id: ms.id },
          data: { approvals: { increment: 1 } }
        });

        // Check if it should be marked as approved
        if (updatedMs.approvals >= updatedMs.requiredApprovals) {
          await prisma.milestone.update({
            where: { id: ms.id },
            data: { approved: true }
          });
        }

        const updatedCampaign = await prisma.campaign.findUnique({ where: { id: campaign.id }, include: { milestones: { orderBy: { milestoneIndex: 'asc' } }, ngo: true } });
        io.emit('CAMPAIGN_UPDATED', updatedCampaign);
        logger.info(`Milestone approved sync: Campaign ${campaignId}, Index ${mIndex}, Approver ${approver}`);
      }
    } catch (err) {
      logger.error('Error in processMilestoneApproved:', err);
    }
  };

  const processProofUploaded = async (campaignId: bigint, mIndex: bigint, ipfsHash: string) => {
    try {
      const campaign = await prisma.campaign.findFirst({ where: { blockchainId: campaignId.toString() } });
      if (!campaign) return;

      const ms = await prisma.milestone.findFirst({
        where: { campaignId: campaign.id, milestoneIndex: Number(mIndex) }
      });

      if (ms) {
        await prisma.milestone.update({
          where: { id: ms.id },
          data: { proofIpfs: ipfsHash }
        });
        const updatedCampaign = await prisma.campaign.findUnique({ where: { id: campaign.id }, include: { milestones: { orderBy: { milestoneIndex: 'asc' } }, ngo: true } });
        io.emit('CAMPAIGN_UPDATED', updatedCampaign);
        logger.info(`Proof uploaded sync: Campaign ${campaignId}, Index ${mIndex}, Hash ${ipfsHash}`);
      }
    } catch (err) {
      logger.error('Error in processProofUploaded:', err);
    }
  };

  const processFundsWithdrawn = async (campaignId: bigint, mIndex: bigint, amount: bigint) => {
    try {
      const campaign = await prisma.campaign.findFirst({ where: { blockchainId: campaignId.toString() } });
      if (!campaign) return;

      // If mIndex is max uint256, it's a multisig full withdrawal
      if (mIndex === BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")) {
        // Already handled in donations or separate logic? 
        // For now just log or mark campaign as withdrawn
        return;
      }

      const ms = await prisma.milestone.findFirst({
        where: { campaignId: campaign.id, milestoneIndex: Number(mIndex) }
      });

      if (ms) {
        await prisma.milestone.update({
          where: { id: ms.id },
          data: { approved: true, fundsReleased: true }
        });
        const updatedCampaign = await prisma.campaign.findUnique({ where: { id: campaign.id }, include: { milestones: { orderBy: { milestoneIndex: 'asc' } }, ngo: true } });
        io.emit('CAMPAIGN_UPDATED', updatedCampaign);
        logger.info(`Funds withdrawn sync: Campaign ${campaignId}, Milestone index ${mIndex}`);
      }
    } catch (err) {
      logger.error('Error in processFundsWithdrawn:', err);
    }
  };

  // 1. Real-time Listeners
  contract.on('DonationReceived', processDonationEvent);
  contract.on('MilestoneAdded', processMilestoneAdded);
  contract.on('MilestoneApproved', processMilestoneApproved);
  contract.on('MilestoneProofUploaded', processProofUploaded);
  contract.on('FundsWithdrawn', processFundsWithdrawn);

  // 2. Catch-up: Scan last 100 blocks
  try {
    const currentBlock = await provider.getBlockNumber();
    const startBlock = Math.max(0, currentBlock - 100);
    logger.info(`Scanning blocks ${startBlock} to ${currentBlock} for missed events...`);

    // Donations
    const donationLogs = await contract.queryFilter(contract.filters.DonationReceived(), startBlock, currentBlock);
    for (const log of donationLogs) {
      if ('args' in log) await processDonationEvent(log.args[0], log.args[1], log.args[2], log.args[3], log);
    }

    // Milestones Added
    const msAddedLogs = await contract.queryFilter(contract.filters.MilestoneAdded(), startBlock, currentBlock);
    for (const log of msAddedLogs) {
      if ('args' in log) await processMilestoneAdded(log.args[0], log.args[1], log.args[2], log.args[3], log.args[4]);
    }

    // Milestones Approved
    const msApprovedLogs = await contract.queryFilter(contract.filters.MilestoneApproved(), startBlock, currentBlock);
    for (const log of msApprovedLogs) {
      if ('args' in log) await processMilestoneApproved(log.args[0], log.args[1], log.args[2]);
    }

    // Proofs Uploaded
    const proofLogs = await contract.queryFilter(contract.filters.MilestoneProofUploaded(), startBlock, currentBlock);
    for (const log of proofLogs) {
      if ('args' in log) await processProofUploaded(log.args[0], log.args[1], log.args[2]);
    }

    // Withdrawals
    const withdrawnLogs = await contract.queryFilter(contract.filters.FundsWithdrawn(), startBlock, currentBlock);
    for (const log of withdrawnLogs) {
      if ('args' in log) await processFundsWithdrawn(log.args[0], log.args[1], log.args[2]);
    }

    logger.info(`Catch-up scan completed.`);
  } catch (err) {
    logger.error('Catch-up scan failed:', err);
  }

  logger.info('Blockchain Event Listener Active.');
}
