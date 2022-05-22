const { expect } = require('chai');
const { ethers } = require('hardhat');
const utils = require('../scripts/utils.js');
const { parseEther } = ethers.utils;

describe('TrustedSubscription', function () {
  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    token = await utils.deployContract('TestToken');
    contract = await utils.deployContract('TrustedSubscription');
    await contract.addTokens([token.address]);
  });

  it('Should work', async function () {
    const amount = 100;
    const ethAmount = parseEther(`${amount}`);
    await contract.registerProject(owner.address, [
      { isActive: true, amount: ethAmount, period: 604800, tokenId: 1 },
      { isActive: true, amount: ethAmount.mul(2), period: 604800, tokenId: 1 },
      { isActive: true, amount: ethAmount.mul(3), period: 604800, tokenId: 1 },
    ]);
    const projectId = 1;
    expect((await contract.projects(projectId)).isActive).to.be.equal(true);

    await token.mint(user.address, ethAmount.mul(12));
    await token.connect(user).approve(contract.address, ethAmount.mul(12));

    const tierIndex = 0;
    const isSubscribedBefore = await contract.isSubscribed(
      projectId,
      tierIndex,
      user.address
    );
    expect(isSubscribedBefore).to.be.equal(false);
    expect(
      await contract.numberOfSubscribersInTier(projectId, tierIndex)
    ).to.be.equal(0);

    await contract.connect(user).subscribe(projectId, tierIndex);

    const isSubscribedAfter = await contract.isSubscribed(
      projectId,
      tierIndex,
      user.address
    );
    expect(isSubscribedAfter).to.be.equal(true);

    const isSubscribedAfterOtherTier = await contract.isSubscribed(
      projectId,
      tierIndex + 1,
      user.address
    );
    expect(isSubscribedAfterOtherTier).to.be.equal(false);

    const isDeployerSubscribed = await contract.isSubscribed(
      projectId,
      tierIndex,
      owner.address
    );
    expect(isDeployerSubscribed).to.be.equal(false);

    expect(
      await contract.numberOfSubscribersInTier(projectId, tierIndex)
    ).to.be.equal(1);
    expect(
      await contract.numberOfSubscribersInTier(projectId, tierIndex + 1)
    ).to.be.equal(0);

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
