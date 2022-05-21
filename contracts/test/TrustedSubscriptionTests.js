const { expect } = require("chai");
const { ethers } = require("hardhat");
const utils = require("../scripts/utils.js");

describe("TrustedSubscription", function () {
  it("Should fail", async function () {
    const trustedSubs = utils.deployContract("TrustedSubscription");
    expect(1, 'Doomed to fail').to.be.equal(0);
  });
});