// AUTO-GENERATED — FundChain v2 ABI (upgraded contract)
export const FUNDCHAIN_ABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "id", "type": "uint256" }, { "indexed": false, "name": "owner", "type": "address" }, { "indexed": false, "name": "title", "type": "string" }, { "indexed": false, "name": "target", "type": "uint256" }, { "indexed": false, "name": "deadline", "type": "uint256" }], "name": "CampaignCreated", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "campaignId", "type": "uint256" }, { "indexed": false, "name": "admin", "type": "address" }], "name": "CampaignVerified", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "campaignId", "type": "uint256" }, { "indexed": false, "name": "donor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "totalCollected", "type": "uint256" }], "name": "DonationReceived", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "campaignId", "type": "uint256" }, { "indexed": false, "name": "milestoneId", "type": "uint256" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "FundsWithdrawn", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "campaignId", "type": "uint256" }, { "indexed": false, "name": "milestoneId", "type": "uint256" }, { "indexed": false, "name": "approver", "type": "address" }], "name": "MilestoneApproved", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "campaignId", "type": "uint256" }, { "indexed": false, "name": "milestoneId", "type": "uint256" }, { "indexed": false, "name": "title", "type": "string" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "MilestoneAdded", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "campaignId", "type": "uint256" }, { "indexed": false, "name": "signer", "type": "address" }, { "indexed": false, "name": "confirmations", "type": "uint256" }], "name": "MultiSigConfirmed", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "campaignId", "type": "uint256" }, { "indexed": false, "name": "donor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "RefundIssued", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "name": "campaignId", "type": "uint256" }], "name": "RefundsEnabled", "type": "event" },
    {
        "inputs": [
            { "name": "_title", "type": "string" },
            { "name": "_description", "type": "string" },
            { "name": "_category", "type": "string" },
            { "name": "_target", "type": "uint256" },
            { "name": "_deadline", "type": "uint256" },
            { "name": "_ipfsImageHash", "type": "string" },
            { "name": "_multiSigners", "type": "address[]" }
        ],
        "name": "createCampaign",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    { "inputs": [{ "name": "_id", "type": "uint256" }], "name": "donate", "outputs": [], "stateMutability": "payable", "type": "function" },
    { "inputs": [{ "name": "_id", "type": "uint256" }], "name": "claimRefund", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "name": "_id", "type": "uint256" }], "name": "verifyCampaign", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "name": "_id", "type": "uint256" }], "name": "enableRefunds", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    {
        "inputs": [
            { "name": "_campaignId", "type": "uint256" },
            { "name": "_title", "type": "string" },
            { "name": "_amount", "type": "uint256" },
            { "name": "_requiredApprovals", "type": "uint256" }
        ],
        "name": "addMilestone",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    { "inputs": [{ "name": "_campaignId", "type": "uint256" }, { "name": "_milestoneId", "type": "uint256" }], "name": "approveMilestone", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "name": "_campaignId", "type": "uint256" }, { "name": "_milestoneId", "type": "uint256" }, { "name": "_ipfsHash", "type": "string" }], "name": "uploadMilestoneProof", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "name": "_campaignId", "type": "uint256" }, { "name": "_milestoneId", "type": "uint256" }], "name": "withdrawFunds", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "name": "_id", "type": "uint256" }], "name": "confirmWithdrawal", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "name": "_id", "type": "uint256" }], "name": "executeMultiSigWithdrawal", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "name": "_id", "type": "uint256" }], "name": "getDonors", "outputs": [{ "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "name": "_id", "type": "uint256" }], "name": "getMultiSigners", "outputs": [{ "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "name": "_campaignId", "type": "uint256" }, { "name": "_milestoneId", "type": "uint256" }], "name": "getMilestone", "outputs": [{ "name": "title", "type": "string" }, { "name": "amount", "type": "uint256" }, { "name": "approved", "type": "bool" }, { "name": "fundsReleased", "type": "bool" }, { "name": "approvalCount", "type": "uint256" }, { "name": "requiredApprovals", "type": "uint256" }, { "name": "ipfsProofHash", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getContractBalance", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "campaignCount", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "admin", "outputs": [{ "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    {
        "inputs": [{ "name": "", "type": "uint256" }],
        "name": "campaigns",
        "outputs": [
            { "name": "owner", "type": "address" },
            { "name": "title", "type": "string" },
            { "name": "description", "type": "string" },
            { "name": "category", "type": "string" },
            { "name": "ipfsImageHash", "type": "string" },
            { "name": "target", "type": "uint256" },
            { "name": "deadline", "type": "uint256" },
            { "name": "amountCollected", "type": "uint256" },
            { "name": "withdrawn", "type": "bool" },
            { "name": "verified", "type": "bool" },
            { "name": "refundsEnabled", "type": "bool" },
            { "name": "milestoneCount", "type": "uint256" },
            { "name": "donorCount", "type": "uint256" },
            { "name": "confirmationCount", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    { "inputs": [{ "name": "", "type": "uint256" }, { "name": "", "type": "address" }], "name": "donations", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

// ⚠️ Update this after redeploying!
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
