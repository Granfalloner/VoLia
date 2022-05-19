pragma solidity ^0.8.9;

contract TrustedSubscription {

  uint256 constant MAX_FEE = 10_000;

  struct SubscriptionTier {
    bool isActive;
    uint80 amount;
    uint32 period;
    uint32 tokenId;
  }

  struct Subscription {
    uint16 tierIndex;
    address donatorAddress;
  }

  struct Project {
    bool isActive;
    uint16 fee;
    address claimAddress;
    uint40 lastClaimDate;
    SubscriptionTier[] tiers;
    Subscription[] subscriptions;
  }

  struct SubscriptionDetails {
    bool isActive;
    uint40 startDate;
  }

  struct TokenDetails {
    address tokenAddress;
  }

  mapping(uint256 => Project) projects;
  mapping(address => mapping(uint256 => SubscriptionDetails)) users;
  mapping(uint256 => TokenDetails) tokens;

  // mapping(address => VolunteerDetails) volunteers;

  // mapping(address => mapping(address => SubscriptionDetails)) donators;

  function registerProject(uint256 id, address claimAddress, SubscriptionTier[] calldata tiers) public {
    Project storage project = projects[id];
    require(project.claimAddress == address(0), 'Project already registered');
    project.claimAddress = claimAddress;

    for (uint256 i; i < tiers.length; ++i) {
      project.tiers.push(tiers[i]);
    }
  }

  function addTiers(uint256 id, SubscriptionTier[] calldata newTiers) public {
    Project storage project = projects[id];
    require(project.isActive, 'Project is not active'); 
    require(project.claimAddress != address(0), 'Project already registered');

    for (uint256 i; i < newTiers.length; ++i) {
      project.tiers.push(newTiers[i]);
    }
  }

  function subscribe(uint256 projectId, uint16 tierIndex) public {
    Project storage project = projects[projectId];

    require(project.isActive, 'Project is not active'); 
    require(project.claimAddress != address(0), 'Claim address is zero');
    require(tierIndex < project.tiers.length, 'Invalid tier index');

    Subscription memory sub = Subscription(tierIndex, msg.sender);
    project.subscriptions.push(sub);
    
    SubscriptionDetails storage details = users[msg.sender][id];
    details.isActive = true;
    details.startDate = uint40(block.timestamp);
  }

  function claim(uint256 projectId) public {
    Project storage project = projects[projectId];

    require(project.isActive, 'Project is not active'); 
    require(project.claimAddress != address(0), 'Claim address is zero');

    for (uint256 i; i < project.subscriptions.length; ++i) {
      Subscription storage sub = project.subscriptions[i];
      SubscriptionTier storage tier = project.tiers[sub.tierIndex];
      address token = tokens[tier.tokenId];

      uint256 amount = ...
      token.transferFrom(sub.donatorAddress, project.claimAddress, amount);
    }
  } 
  // function registerVolunteer(address volunteerAddress, uint16 fee, string projectUrl, SubscriptionTier[] calldata tiers) public {
  //   VolunteerDetails storage details = volunteers[donationAddress];

  //   require(details.volunteerAddress == address(0), 'Volunteer is already registered');
  //   require(fee < MAX_FEE, 'Max fee exceeded');

  //   details.volunteerAddress = volunteerAddress;
  //   details.fee = fee;
  //   details.projectUrl = projectUrl;
  //   details.tiers = tiers;
  // }

  // function subscribeTo(address volunteerAddress, uint tierIndex) {
  //   VolunteerDetails storage volDetails = volunteers[donationAddress];
  //   require(volDetails.volunteerAddress != address(0), 'Invalid volunteer address');

  //   SubscriptionDetails storage subDetails = donators[msg.sender][volunteerAddress];
  //   require(subDetails.startDate == 0, 'Already subscribed');
  //   subDetails.startDate = uint32(block.timestamp);
  //   subDetails.lastClaimDate = uint32(block.timestamp);
  //   subDetails.tier = volDetails.tiers[tierIndex];
  // }
}