import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

dotenv.config();

const RPC = process.env.RPC_URL || 'http://127.0.0.1:8545';
const provider = new ethers.JsonRpcProvider(RPC);
const CONTRACT_ADDRESS = '0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8';

// Absolute path from the current file's directory to the blockchain artifacts
const ABI_PATH = path.resolve(__dirname, '../../../../blockchain/artifacts/contracts/FundChain.sol/FundChain.json');
const FUNDCHAIN_ABI = require(ABI_PATH).abi;

export const contractService = {
  getProvider: () => provider,
  getContract: () => new ethers.Contract(CONTRACT_ADDRESS, FUNDCHAIN_ABI, provider),
};
