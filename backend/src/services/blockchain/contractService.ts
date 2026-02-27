import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const RPC = process.env.RPC_URL || 'http://127.0.0.1:8545';
const provider = new ethers.JsonRpcProvider(RPC);

export const contractService = {
  getProvider: () => provider,
  // Load contract, send tx helper, verify tx, etc.
};
