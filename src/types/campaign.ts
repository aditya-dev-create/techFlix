export interface Campaign {
  id: string;
  blockchainId?: string | number;
  owner: string;
  title: string;
  description: string;
  category: CampaignCategory;
  target: string; // in ETH
  deadline: number; // unix timestamp
  amountCollected: string; // in ETH
  withdrawn: boolean;
  verified: boolean;
  milestones: Milestone[];
  donors: Donation[];
  imageUrl: string;
  ipfsImageHash?: string;
}

export interface Milestone {
  id: number;
  title: string;
  amount: string;
  approved: boolean;
  approvalCount: number;
  requiredApprovals: number;
}

export interface Donation {
  donor: string;
  amount: string;
  timestamp: number;
  txHash: string;
}

export type CampaignCategory =
  | 'defi'
  | 'nft'
  | 'gaming'
  | 'social'
  | 'infrastructure'
  | 'education'
  | 'charity';

export const CATEGORY_LABELS: Record<CampaignCategory, string> = {
  defi: 'DeFi',
  nft: 'NFT & Art',
  gaming: 'Gaming',
  social: 'Social Impact',
  infrastructure: 'Infrastructure',
  education: 'Education',
  charity: 'Charity',
};

export const CATEGORY_COLORS: Record<CampaignCategory, string> = {
  defi: 'text-primary',
  nft: 'text-accent',
  gaming: 'text-warning',
  social: 'text-primary',
  infrastructure: 'text-muted-foreground',
  education: 'text-accent',
  charity: 'text-primary',
};
