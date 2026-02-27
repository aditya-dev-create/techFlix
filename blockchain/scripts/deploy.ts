import hre from "hardhat";

async function main() {
    const ethers = hre.ethers;
    console.log("Deploying FundChain...");

    const FundChain = await ethers.getContractFactory("FundChain");
    const fundChain = await FundChain.deploy();

    await fundChain.waitForDeployment();

    const address = await fundChain.getAddress();
    console.log("FundChain deployed to:", address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
