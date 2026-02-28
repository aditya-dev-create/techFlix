const API_URL = 'http://localhost:4000/api';

export const fetchCampaigns = async () => {
    const response = await fetch(`${API_URL}/campaigns`);
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return response.json();
};

export const fetchCampaignById = async (id: string) => {
    const response = await fetch(`${API_URL}/campaigns/${id}`);
    if (!response.ok) throw new Error('Failed to fetch campaign');
    return response.json();
};

export const createCampaign = async (campaignData: any) => {
    const response = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
    });
    if (!response.ok) throw new Error('Failed to create campaign');
    return response.json();
};

export const fetchDashboardData = async (walletAddress: string) => {
    const response = await fetch(`${API_URL}/users/dashboard?walletAddress=${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
};

export const recordDonation = async (donationData: { campaignId: string; wallet: string; amount: number; txHash: string }) => {
    const response = await fetch(`${API_URL}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData),
    });
    if (!response.ok) throw new Error('Failed to record donation');
    return response.json();
};
export const releaseMilestone = async (data: { id: string; milestoneIndex: number }) => {
    const response = await fetch(`${API_URL}/campaigns/release-milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to release milestone');
    return response.json();
};
export const approveMilestonevirtually = async (data: { id: string; milestoneIndex: number }) => {
    const response = await fetch(`${API_URL}/campaigns/approve-milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to approve milestone');
    return response.json();
};
