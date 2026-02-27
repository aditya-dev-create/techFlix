import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const code = await ethers.provider.getCode(address);
    if (code === "0x") {
        console.log("❌ NO CODE AT ADDRESS!");
    } else {
        console.log("✅ Contract is deployed correctly.");
        const contract = await ethers.getContractAt("FundChain", address);
        const count = await contract.campaignCount();
        console.log("Current campaign count:", count.toString());
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
