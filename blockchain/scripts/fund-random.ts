import { ethers } from 'ethers';

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: ts-node scripts/fund-random.ts <targetAddress> [minEth] [maxEth]');
    process.exit(1);
  }

  const minEth = Number(process.argv[3] ?? 0.01);
  const maxEth = Number(process.argv[4] ?? 0.1);
  const rand = Math.random() * (maxEth - minEth) + minEth;
  const amount = ethers.parseEther(rand.toFixed(6));

  // Connect to local Hardhat node
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

  // Use the first hardhat account (index 0)
  const signer = await provider.getSigner(0);
  const senderAddr = await signer.getAddress();
  console.log('Using sender:', senderAddr);

  const tx = await signer.sendTransaction({ to: target, value: amount });
  console.log('Sent', rand.toFixed(6), 'ETH ->', target, 'txHash:', tx.hash);
  await tx.wait();
  console.log('Confirmed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
