import { expect } from "chai";
import { ethers } from "hardhat";

describe("FundChain", function () {
    it("Should create a campaign successfully", async function () {
        const FundChain = await ethers.getContractFactory("FundChain");
        const fundChain = await FundChain.deploy();
        await fundChain.waitForDeployment();

        const title = "Test Campaign";
        const description = "Test Description";
        const category = "Technology";
        const target = ethers.parseEther("1.0"); // 1 ETH
        const deadline = Math.floor(Date.now() / 1000) + 86400; // Tomorrow

        const tx = await fundChain.createCampaign(
            title,
            description,
            category,
            target,
            deadline
        );

        const receipt = await tx.wait();
        expect(receipt?.status).to.equal(1);

        const campaignCount = await fundChain.campaignCount();
        expect(campaignCount).to.equal(1);

        const campaign = await fundChain.campaigns(0);
        expect(campaign.title).to.equal(title);
        expect(campaign.target).to.equal(target);
    });
});
