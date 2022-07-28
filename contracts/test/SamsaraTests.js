const { expect } = require('chai');
const { ethers } = require('hardhat');
const utils = require('../scripts/utils.js');
const { parseEther, formatEther } = ethers.utils;

function round(bignumber) {
  const num = parseFloat(formatEther(bignumber))
  return Math.round(num * 100) / 100
}

describe('Samsara', function () {
  beforeEach(async function () {
    [owner, user, user1, user2, user3, user4, user5, user6] = await ethers.getSigners();
    token = await utils.deployContract('TestToken');
    token2 = await utils.deployContract('TestToken');
    contract = await utils.deployContract('Samsara');
    await contract.enableTokens([token.address, token2.address]);
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

  it('Should work when not enough approval', async function () {
    const amount = 100;
    const month = 30 * 24 * 60 * 60;
    const week = 7 * 24 * 60 * 60;
    const ethAmount = parseEther(`${amount}`);
    await contract.registerProject(owner.address, token.address, [
      { isActive: true, amount: ethAmount, period: month },
      { isActive: true, amount: ethAmount.mul(2), period: month },
      { isActive: true, amount: ethAmount.mul(3), period: month },
    ]);
    const projectId = 0;

    await token.mint(user.address, ethAmount);
    await token.connect(user).approve(contract.address, ethAmount.div(3));
    await token.connect(user2).approve(contract.address, ethAmount.div(3));

    const firstTierIndex = 0;
    await contract.connect(user).subscribe(projectId, firstTierIndex);
    await contract.connect(user2).subscribe(projectId, firstTierIndex);

    const secondTierIndex = 1;
    await contract.connect(user).subscribe(projectId, secondTierIndex);

    await utils.fastForward(week);
    await contract.claim(projectId);

    await utils.fastForward(week);
    await contract.claim(projectId);
  });

  it('Should claim only allowed amount', async function () {
    const fee = 0.995
    const month = 30 * 24 * 60 * 60;
    const week = 7 * 24 * 60 * 60;
    const year = 365 * 24 * 60 * 60;
    const amount = 100;
    const tokenAmount = parseEther(`${amount}`);

    await token.mint(user4.address, tokenAmount.mul(42));
    await token.mint(user5.address, tokenAmount.mul(42));
    await token.mint(user6.address, tokenAmount.mul(42));

    await token2.mint(user4.address, tokenAmount.mul(42));
    await token2.mint(user5.address, tokenAmount.mul(42));
    await token2.mint(user6.address, tokenAmount.mul(42));

    await contract.registerProject(user1.address, token.address, [
      { isActive: true, amount: tokenAmount, period: month },
    ]);

    await contract.registerProject(user1.address, token2.address, [
      { isActive: true, amount: tokenAmount, period: month },
    ]);

    await contract.registerProject(user2.address, token.address, [
      { isActive: true, amount: tokenAmount, period: month },
      { isActive: true, amount: tokenAmount.mul(2), period: month },
      { isActive: true, amount: tokenAmount.mul(3), period: month },
      { isActive: true, amount: tokenAmount.mul(4), period: month },
      { isActive: true, amount: tokenAmount.mul(5), period: month },
    ]);

    await contract.registerProject(user3.address, token2.address, [
      { isActive: true, amount: tokenAmount, period: week},
      { isActive: true, amount: tokenAmount, period: week},
      { isActive: true, amount: tokenAmount, period: year},
      { isActive: true, amount: tokenAmount, period: year},
    ]);

    await token.connect(user4).approve(contract.address, tokenAmount.mul(20));

    await contract.connect(user4).subscribe(0, 0);
    await contract.connect(user4).subscribe(1, 0);
    await contract.connect(user4).subscribe(2, 0);
    await contract.connect(user4).subscribe(2, 2);

    await utils.fastForward(week);

    const proj0Balance = tokenAmount.mul(week).div(month).mul(fee*1000).div(1000)
    const proj2Balance = (
      tokenAmount.mul(week).div(month).add(tokenAmount.mul(3).mul(week).div(month))
    ).mul(fee*1000).div(1000)

    // Claiming non-owned project
    await contract.connect(user2).claim(0);
    expect(await token.balanceOf(user2.address)).to.be.equal(0)
    expect(round(await token.balanceOf(user1.address))).to.be.equal(round(proj0Balance))

    // Claiming non-owned project
    await expect(contract.connect(user3).claim(1)).to.be.revertedWith('Not authorized to unsubscribe')
    expect(await token.balanceOf(user3.address)).to.be.equal(0)
    expect(await token.balanceOf(user2.address)).to.be.equal(0)
    expect(round(await token.balanceOf(user1.address))).to.be.equal(round(proj0Balance))


    // Claiming non-owned project
    await contract.connect(user1).claim(2) 
    expect(round(await token.balanceOf(user1.address))).to.be.equal(round(proj0Balance))
    expect(await token2.balanceOf(user1.address)).to.be.equal(0)
    expect(await token2.balanceOf(user2.address)).to.be.equal(0)

    // Claiming own projects
    await contract.connect(user1).claim(0);
    await expect(contract.connect(user1).claim(1)).to.be.revertedWith('Not authorized to unsubscribe')
    await contract.connect(user2).claim(2);
    await contract.connect(user3).claim(3);

    expect(round(await token.balanceOf(user1.address))).to.be.equal(round(proj0Balance))
    expect(round(await token.balanceOf(user2.address))).to.be.equal(round(proj2Balance))
    expect(await token.balanceOf(user3.address)).to.be.equal(0)

  });

});
