// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title FundChain - Transparent Crowdfunding with Milestone-Based Fund Release
/// @author FundChain Team
contract FundChain {

    // ─────────────────────────────────────────────────────────────────────
    //  STRUCTS
    // ─────────────────────────────────────────────────────────────────────

    struct Milestone {
        string  title;
        uint256 amount;
        bool    approved;
        bool    fundsReleased;
        uint256 approvalCount;
        uint256 requiredApprovals;
        string  ipfsProofHash;        // IPFS hash of proof document
        mapping(address => bool) approvals;
    }

    struct Campaign {
        address  owner;
        string   title;
        string   description;
        string   category;
        string   ipfsImageHash;       // IPFS hash of cover image
        uint256  target;
        uint256  deadline;
        uint256  amountCollected;
        bool     withdrawn;
        bool     verified;
        bool     refundsEnabled;
        uint256  milestoneCount;
        uint256  donorCount;
        // multi-sig: signers and confirmations for non-milestone withdrawal
        address[] multiSigners;
        mapping(address => bool) hasConfirmed;
        uint256  confirmationCount;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  STATE
    // ─────────────────────────────────────────────────────────────────────

    mapping(uint256 => Campaign)  public campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => mapping(address => uint256))   public donations;
    mapping(uint256 => address[]) public donors;

    uint256 public campaignCount;
    address public admin;

    // ─────────────────────────────────────────────────────────────────────
    //  EVENTS
    // ─────────────────────────────────────────────────────────────────────

    event CampaignCreated(uint256 indexed id, address owner, string title, uint256 target, uint256 deadline);
    event DonationReceived(uint256 indexed campaignId, address donor, uint256 amount, uint256 totalCollected);
    event RefundIssued(uint256 indexed campaignId, address donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, uint256 milestoneId, uint256 amount);
    event MilestoneApproved(uint256 indexed campaignId, uint256 milestoneId, address approver);
    event MilestoneAdded(uint256 indexed campaignId, uint256 milestoneId, string title, uint256 amount, uint256 requiredApprovals);
    event CampaignVerified(uint256 indexed campaignId, address admin);
    event MultiSigConfirmed(uint256 indexed campaignId, address signer, uint256 confirmations);
    event RefundsEnabled(uint256 indexed campaignId);
    event MilestoneProofUploaded(uint256 indexed campaignId, uint256 milestoneId, string ipfsHash);

    // ─────────────────────────────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier campaignExists(uint256 _id) {
        require(_id < campaignCount, "Campaign does not exist");
        _;
    }

    modifier onlyOwner(uint256 _id) {
        require(msg.sender == campaigns[_id].owner, "Not campaign owner");
        _;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  CORE FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Create a new fundraising campaign
    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256       _target,
        uint256       _deadline,
        string memory _ipfsImageHash,
        address[] memory _multiSigners
    ) external returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(_target > 0, "Target must be > 0");

        uint256 id = campaignCount++;
        Campaign storage c = campaigns[id];
        c.owner          = msg.sender;
        c.title          = _title;
        c.description    = _description;
        c.category       = _category;
        c.ipfsImageHash  = _ipfsImageHash;
        c.target         = _target;
        c.deadline       = _deadline;
        c.multiSigners   = _multiSigners;

        emit CampaignCreated(id, msg.sender, _title, _target, _deadline);
        return id;
    }

    /// @notice Donate ETH to a campaign
    function donate(uint256 _id) external payable campaignExists(_id) {
        Campaign storage c = campaigns[_id];
        require(block.timestamp < c.deadline, "Campaign ended");
        require(msg.value > 0, "Must send ETH");

        if (donations[_id][msg.sender] == 0) {
            donors[_id].push(msg.sender);
            c.donorCount++;
        }
        donations[_id][msg.sender] += msg.value;
        c.amountCollected += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value, c.amountCollected);
    }

    /// @notice Claim refund if campaign failed to meet target after deadline
    function claimRefund(uint256 _id) external campaignExists(_id) {
        Campaign storage c = campaigns[_id];
        require(block.timestamp > c.deadline, "Campaign still active");
        require(c.amountCollected < c.target || c.refundsEnabled, "Not eligible for refund");
        require(!c.withdrawn, "Already fully withdrawn");

        uint256 amount = donations[_id][msg.sender];
        require(amount > 0, "No donation to refund");

        donations[_id][msg.sender] = 0;
        c.amountCollected -= amount;
        payable(msg.sender).transfer(amount);

        emit RefundIssued(_id, msg.sender, amount);
    }

    /// @notice Admin enables refunds for a campaign (e.g. if fraud detected)
    function enableRefunds(uint256 _id) external onlyAdmin campaignExists(_id) {
        campaigns[_id].refundsEnabled = true;
        emit RefundsEnabled(_id);
    }

    /// @notice Admin verifies a campaign (adds verified badge)
    function verifyCampaign(uint256 _id) external onlyAdmin campaignExists(_id) {
        campaigns[_id].verified = true;
        emit CampaignVerified(_id, msg.sender);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  MILESTONE FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Campaign owner adds a milestone
    function addMilestone(
        uint256 _campaignId,
        string memory _title,
        uint256 _amount,
        uint256 _requiredApprovals
    ) external campaignExists(_campaignId) onlyOwner(_campaignId) {
        require(_requiredApprovals > 0, "Need at least 1 approval");
        Campaign storage c = campaigns[_campaignId];
        uint256 milestoneId = c.milestoneCount++;
        Milestone storage ms = milestones[_campaignId][milestoneId];
        ms.title             = _title;
        ms.amount            = _amount;
        ms.requiredApprovals = _requiredApprovals;

        emit MilestoneAdded(_campaignId, milestoneId, _title, _amount, _requiredApprovals);
    }

    /// @notice Donor approves a milestone (DAO voting)
    function approveMilestone(uint256 _campaignId, uint256 _milestoneId)
        external
        campaignExists(_campaignId)
    {
        require(donations[_campaignId][msg.sender] > 0, "Must be a donor to vote");
        require(_milestoneId < campaigns[_campaignId].milestoneCount, "Invalid milestone ID");
        
        Milestone storage ms = milestones[_campaignId][_milestoneId];
        require(ms.requiredApprovals > 0, "Milestone not initialized");
        require(!ms.approvals[msg.sender], "Already voted");
        require(!ms.approved, "Milestone already approved");

        ms.approvals[msg.sender] = true;
        ms.approvalCount++;

        emit MilestoneApproved(_campaignId, _milestoneId, msg.sender);

        if (ms.approvalCount >= ms.requiredApprovals) {
            ms.approved = true;
        }
    }

    /// @notice Upload proof document for a milestone (IPFS hash)
    function uploadMilestoneProof(
        uint256 _campaignId,
        uint256 _milestoneId,
        string memory _ipfsHash
    ) external campaignExists(_campaignId) onlyOwner(_campaignId) {
        milestones[_campaignId][_milestoneId].ipfsProofHash = _ipfsHash;
        emit MilestoneProofUploaded(_campaignId, _milestoneId, _ipfsHash);
    }

    /// @notice Withdraw funds for an approved milestone
    function withdrawFunds(uint256 _campaignId, uint256 _milestoneId)
        external
        campaignExists(_campaignId)
        onlyOwner(_campaignId)
    {
        Campaign storage c = campaigns[_campaignId];
        // require(c.amountCollected >= c.target || block.timestamp > c.deadline, "Fundraising ongoing");

        Milestone storage ms = milestones[_campaignId][_milestoneId];
        require(ms.approved, "Milestone not yet approved by donors");
        require(!ms.fundsReleased, "Funds already released");
        
        uint256 balance = address(this).balance;
        require(ms.amount <= balance, string(abi.encodePacked("Insufficient balance: ", _uintToString(ms.amount), " > ", _uintToString(balance))));

        ms.fundsReleased = true;
        (bool success, ) = payable(c.owner).call{value: ms.amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(_campaignId, _milestoneId, ms.amount);
    }

    function _uintToString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  MULTI-SIG WITHDRAWAL
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Confirm a multi-sig withdrawal (for campaigns using multi-sig)
    function confirmWithdrawal(uint256 _id) external campaignExists(_id) {
        Campaign storage c = campaigns[_id];
        bool isSigner = false;
        for (uint i = 0; i < c.multiSigners.length; i++) {
            if (c.multiSigners[i] == msg.sender) {
                isSigner = true;
                break;
            }
        }
        require(isSigner || msg.sender == c.owner, "Not an authorized signer");
        require(!c.hasConfirmed[msg.sender], "Already confirmed");

        c.hasConfirmed[msg.sender] = true;
        c.confirmationCount++;

        emit MultiSigConfirmed(_id, msg.sender, c.confirmationCount);
    }

    /// @notice Execute multi-sig withdrawal when enough confirmations are gathered
    function executeMultiSigWithdrawal(uint256 _id)
        external
        campaignExists(_id)
        onlyOwner(_id)
    {
        Campaign storage c = campaigns[_id];
        uint256 required = (c.multiSigners.length / 2) + 1; // majority
        require(c.confirmationCount >= required, "Not enough confirmations");
        require(!c.withdrawn, "Already withdrawn");
        require(c.amountCollected > 0, "Nothing to withdraw");

        c.withdrawn = true;
        uint256 amount = c.amountCollected;
        payable(c.owner).transfer(amount);

        emit FundsWithdrawn(_id, type(uint256).max, amount);
    }

    // ─────────────────────────────────────────────────────────────────────
    //  VIEW FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────

    function getDonors(uint256 _id) external view returns (address[] memory) {
        return donors[_id];
    }

    function getMultiSigners(uint256 _id) external view returns (address[] memory) {
        return campaigns[_id].multiSigners;
    }

    function getMilestone(uint256 _campaignId, uint256 _milestoneId)
        external
        view
        returns (
            string memory title,
            uint256 amount,
            bool approved,
            bool fundsReleased,
            uint256 approvalCount,
            uint256 requiredApprovals,
            string memory ipfsProofHash
        )
    {
        Milestone storage ms = milestones[_campaignId][_milestoneId];
        return (
            ms.title,
            ms.amount,
            ms.approved,
            ms.fundsReleased,
            ms.approvalCount,
            ms.requiredApprovals,
            ms.ipfsProofHash
        );
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
