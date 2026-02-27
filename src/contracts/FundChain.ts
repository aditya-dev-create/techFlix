// SPDX-License-Identifier: MIT
// Reference Solidity contract for FundChain
// Deploy to Sepolia or Polygon Mumbai

/*
pragma solidity ^0.8.19;

contract FundChain {
    struct Milestone {
        string title;
        uint256 amount;
        bool approved;
        uint256 approvalCount;
        uint256 requiredApprovals;
        mapping(address => bool) approvals;
    }

    struct Campaign {
        address owner;
        string title;
        string description;
        string category;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        bool withdrawn;
        bool verified;
        uint256 milestoneCount;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => mapping(address => uint256)) public donations;
    mapping(uint256 => address[]) public donors;
    
    uint256 public campaignCount;
    address public admin;

    event CampaignCreated(uint256 indexed id, address owner, string title, uint256 target);
    event DonationReceived(uint256 indexed campaignId, address donor, uint256 amount);
    event RefundIssued(uint256 indexed campaignId, address donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, uint256 amount);
    event MilestoneApproved(uint256 indexed campaignId, uint256 milestoneId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _target,
        uint256 _deadline
    ) external returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(_target > 0, "Target must be > 0");
        
        uint256 id = campaignCount++;
        Campaign storage c = campaigns[id];
        c.owner = msg.sender;
        c.title = _title;
        c.description = _description;
        c.category = _category;
        c.target = _target;
        c.deadline = _deadline;
        
        emit CampaignCreated(id, msg.sender, _title, _target);
        return id;
    }

    function donate(uint256 _id) external payable {
        Campaign storage c = campaigns[_id];
        require(block.timestamp < c.deadline, "Campaign ended");
        require(msg.value > 0, "Must send ETH");
        
        if (donations[_id][msg.sender] == 0) {
            donors[_id].push(msg.sender);
        }
        donations[_id][msg.sender] += msg.value;
        c.amountCollected += msg.value;
        
        emit DonationReceived(_id, msg.sender, msg.value);
    }

    function claimRefund(uint256 _id) external {
        Campaign storage c = campaigns[_id];
        require(block.timestamp > c.deadline, "Campaign still active");
        require(c.amountCollected < c.target, "Target was met");
        require(!c.withdrawn, "Already withdrawn");
        
        uint256 amount = donations[_id][msg.sender];
        require(amount > 0, "No donation found");
        
        donations[_id][msg.sender] = 0;
        c.amountCollected -= amount;
        payable(msg.sender).transfer(amount);
        
        emit RefundIssued(_id, msg.sender, amount);
    }

    function verifyCampaign(uint256 _id) external onlyAdmin {
        campaigns[_id].verified = true;
    }

    function approveMilestone(uint256 _campaignId, uint256 _milestoneId) external {
        require(donations[_campaignId][msg.sender] > 0, "Not a donor");
        Milestone storage ms = milestones[_campaignId][_milestoneId];
        require(!ms.approvals[msg.sender], "Already approved");
        
        ms.approvals[msg.sender] = true;
        ms.approvalCount++;
        
        if (ms.approvalCount >= ms.requiredApprovals) {
            ms.approved = true;
            emit MilestoneApproved(_campaignId, _milestoneId);
        }
    }

    function withdrawFunds(uint256 _id, uint256 _milestoneId) external {
        Campaign storage c = campaigns[_id];
        require(msg.sender == c.owner, "Not owner");
        require(c.amountCollected >= c.target, "Target not met");
        
        Milestone storage ms = milestones[_id][_milestoneId];
        require(ms.approved, "Milestone not approved");
        
        uint256 amount = ms.amount;
        payable(c.owner).transfer(amount);
        
        emit FundsWithdrawn(_id, amount);
    }
}
*/

// ABI for frontend integration
export const FUNDCHAIN_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "target",
                "type": "uint256"
            }
        ],
        "name": "CampaignCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "DonationReceived",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "FundsWithdrawn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "milestoneId",
                "type": "uint256"
            }
        ],
        "name": "MilestoneApproved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "campaignId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "RefundIssued",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_campaignId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_milestoneId",
                "type": "uint256"
            }
        ],
        "name": "approveMilestone",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "campaignCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "campaigns",
        "outputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "category",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "target",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountCollected",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "withdrawn",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "verified",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "milestoneCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "claimRefund",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_description",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_category",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_target",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_deadline",
                "type": "uint256"
            }
        ],
        "name": "createCampaign",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "donations",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "donors",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "milestones",
        "outputs": [
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "approved",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "approvalCount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "requiredApprovals",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            }
        ],
        "name": "verifyCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_id",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_milestoneId",
                "type": "uint256"
            }
        ],
        "name": "withdrawFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
