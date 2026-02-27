import { contractService } from './contractService';
import { prisma } from '../../index';
import { logger } from '../../utils/logger';

export async function initializeEventListener(io: any) {
  const provider = contractService.getProvider();
  // Example: listen to DonationMade(address donor, uint256 amount, bytes32 txHash)
  // Replace with actual contract ABI/address logic
  provider.on('block', async (n: number) => {
    logger.info('New block: ' + n);
  });
  // TODO: attach to contract events and enqueue jobs for sync
}
