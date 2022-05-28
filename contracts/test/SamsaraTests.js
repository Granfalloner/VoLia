const { expect } = require('chai');
const { ethers } = require('hardhat');
const utils = require('../scripts/utils.js');
const { parseEther } = ethers.utils;

describe('Samsara', function () {
  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    token = await utils.deployContract('TestToken');
    contract = await utils.deployContract('Samsara');
    await contract.enableTokens([token.address]);
  });

  it('Should work', async function () {
    const amount = 100;
    const ethAmount = parseEther(`${amount}`);
    await contract.registerProject(owner.address, token.address, [
      { isActive: true, amount: ethAmount, period: 604800 },
      { isActive: true, amount: ethAmount.mul(2), period: 604800 },
      { isActive: true, amount: ethAmount.mul(3), period: 604800 },
    ]);
    const projectId = 0;
    expect((await contract.projects(projectId)).isActive).to.be.equal(true);

    await token.mint(user.address, ethAmount.mul(12));
    await token.connect(user).approve(contract.address, ethAmount.mul(12));

    const tierIndex = 0;
    const isSubscribedForTierBefore = await contract.isSubscribedForTier(
      projectId,
      tierIndex,
      user.address
    );
    expect(isSubscribedForTierBefore).to.be.equal(false);
    expect(
      await contract.numberOfSubscribersInTier(projectId, tierIndex)
    ).to.be.equal(0);

    await contract.connect(user).subscribe(projectId, tierIndex);

    const isSubscribedForTierAfter = await contract.isSubscribedForTier(
      projectId,
      tierIndex,
      user.address
    );
    expect(isSubscribedForTierAfter).to.be.equal(true);

    const isSubscribedForTierAfterOtherTier =
      await contract.isSubscribedForTier(
        projectId,
        tierIndex + 1,
        user.address
      );
    expect(isSubscribedForTierAfterOtherTier).to.be.equal(false);

    const isDeployerSubscribed = await contract.isSubscribedForTier(
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

    const claimableAmount = await contract.claimableAmount(0);
    expect(claimableAmount.amount).to.be.equal(ethAmount);

    await contract.claim(0);

    const contractBalance = await token.balanceOf(contract.address);
    const ownerBalance = await token.balanceOf(owner.address);
    expect(contractBalance.gt(0)).to.be.equal(true);
    expect(ownerBalance.gt(0)).to.be.equal(true);
  });
});
