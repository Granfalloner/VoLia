const utils = require("./utils.js");

async function main() {
  const trustedSubs = await utils.deployContract("TrustedSubscription");
  console.log("TrustedSubscription deployed to:", trustedSubs.address);

  await utils.verifyContract(trustedSubs.address);
  console.log("TrustedSubscription verified");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });