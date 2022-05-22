const { expect } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("TrustedSubscription", function () {

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    token = await utils.deployContract("TestToken");
    contract = await utils.deployContract("TrustedSubscription");
    await contract.addTokens([token.address]);
  });

  it("Should work", async function () {
    const amount = 100;
    const ethAmount = ethers.utils.parseEther(`${amount}`);
    await contract.registerProject(owner.address, [{isActive: true, amount: ethAmount, period: 604800, tokenId: 1}])
    expect((await contract.projects(1)).isActive).to.be.equal(true);

    await token.mint(user.address, ethAmount.mul(12));
    await token.connect(user).approve(contract.address, ethAmount.mul(12));
    await contract.connect(user).subscribe(1, 0);
    await utils.fastForward(604800);

    const claimableAmount = await contract.claimableAmountOfTokens(1, 1);
    expect(claimableAmount.amount).to.be.equal(ethAmount);

    await contract.claim(1);

    const contractBalance = await token.balanceOf(contract.address);
    const ownerBalance = await token.balanceOf(owner.address);
    expect(contractBalance.gt(0)).to.be.equal(true);
    expect(ownerBalance.gt(0)).to.be.equal(true);
  });
});