// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DataStructures.sol";

contract TrustedSubscription is Ownable {

  uint256 constant MAX_FEE = 10_000;
  uint256 constant DEFAULT_FEE = 500; // 0.5%
  uint256 constant MAX_FAILED_CLAIMS = 3;

  uint32 projectCounter;

  mapping(uint256 => Project) projects;
  mapping(address => mapping(uint256 => SubscriptionDetails)) subscriptionDetails;
  mapping(uint256 => Token) tokens;

  event Subscribed(uint256 indexed projectId, address indexed donator, uint256 timestamp);
  event Unsubscribed(uint256 indexed projectId, address indexed donator, uint256 timestamp);
  event ClaimFailed(uint256 indexed projectId, address indexed donator, uint256 timestamp);

  function registerProject(address claimAddress, Tier[] calldata tiers) public onlyOwner {
    uint32 projectId = ++projectCounter;
    Project storage project = projects[projectId];

    require(project.claimAddress == address(0), 'Project already registered');
    require(claimAddress != address(0), 'Zero claim address');

    project.id = projectId;
    project.isActive = true;
    project.fee = uint16(DEFAULT_FEE);
    project.claimAddress = claimAddress;

    for (uint256 i; i < tiers.length; ++i) {
      project.tiers.push(tiers[i]);
    }
  }

  function enableProject(uint256 projectId) public onlyOwner {
    projects[projectId].isActive = true;
  }

  function disableProject(uint256 projectId) public onlyOwner {
    projects[projectId].isActive = false;
  }

  function addTiers(uint256 projectId, Tier[] calldata newTiers) public onlyOwner {
    Project storage project = projects[projectId];
    require(project.isActive, 'Project is not active'); 

    for (uint256 i; i < newTiers.length; ++i) {
      project.tiers.push(newTiers[i]);
    }
  }

  function enableTiers(uint256 projectId, uint256[] calldata tierIndices) public onlyOwner {
    Project storage project = projects[projectId];
    require(project.isActive, 'Project is not active'); 

    for (uint256 i; i < tierIndices.length; ++i) {
      project.tiers[tierIndices[i]].isActive = true;
    }
  }

  function disableTiers(uint256 projectId, uint256[] calldata tierIndices) public onlyOwner {
    Project storage project = projects[projectId];
    require(project.isActive, 'Project is not active'); 

    for (uint256 i; i < tierIndices.length; ++i) {
      project.tiers[tierIndices[i]].isActive = false;
    }
  }

  function subscribe(uint256 projectId, uint16 tierIndex) public {
    Project storage project = projects[projectId];
    Tier storage tier = project.tiers[tierIndex];

    require(project.isActive, 'Project is not active'); 
    require(tier.isActive, 'Subscription tier is not active');

    if (project.lastClaimDate == 0) {
      project.lastClaimDate = uint40(block.timestamp);
    }

    addActiveToken(project.activeTokens, tier.tokenId);

    SubscriptionGroup storage tokenSubscriptions = project.tokenSubscriptions[tier.tokenId];
    Subscription memory newSubscription = Subscription({tierIndex: tierIndex, donator: msg.sender});

    tokenSubscriptions.subscriptions.push(newSubscription);
    tokenSubscriptions.subscriptionIndices[msg.sender] = tokenSubscriptions.subscriptions.length - 1;
    
    SubscriptionDetails storage details = subscriptionDetails[msg.sender][projectId];
    details.isActive = true;
    details.startDate = uint40(block.timestamp);

    emit Subscribed(projectId, msg.sender, block.timestamp);
  }

  function unsubscribe(uint256 projectId, address donator, uint32 tokenId) public {
    require(msg.sender == donator || msg.sender == owner(), 'Not authorized to unsubscribe');

    SubscriptionGroup storage tokenSubscriptions = projects[projectId].tokenSubscriptions[tokenId];

    uint256 totalTokenSubs = tokenSubscriptions.subscriptions.length;
    uint256 index = tokenSubscriptions.subscriptionIndices[donator];
    
    Subscription storage subscription = tokenSubscriptions.subscriptions[index];
    require(subscription.donator == donator, 'Donator does not match');

    tokenSubscriptions.subscriptions[index] = tokenSubscriptions.subscriptions[totalTokenSubs - 1];
    tokenSubscriptions.subscriptions.pop();

    if (totalTokenSubs == 1) {
      removeActiveToken(projects[projectId].activeTokens, tokenId);
    }

    delete tokenSubscriptions.subscriptionIndices[donator];
    delete subscriptionDetails[donator][projectId];

    emit Unsubscribed(projectId, donator, block.timestamp);
  }

  function claim(uint256 projectId) public {
    uint32[] storage activeTokens = projects[projectId].activeTokens;

    for (uint256 i; i < activeTokens.length; ++i) {
      claim(projectId, activeTokens[i]);
    }
  }

  function claim(uint256 projectId, uint32 tokenId) public {
    Project storage project = projects[projectId];
    SubscriptionGroup storage subsGroup = project.tokenSubscriptions[tokenId];
    claimIn(projectId, tokenId, 0, subsGroup.subscriptions.length);
  }

  function claimIn(uint256 projectId, uint32 tokenId, uint256 start, uint256 end) public {
    Project storage project = projects[projectId];
    SubscriptionGroup storage subsGroup = project.tokenSubscriptions[tokenId];

    require(project.isActive, 'Project is not active'); 
    require(project.claimAddress != address(0), 'Claim address is zero');

    uint256 totalAmount;
    uint256 totalFee;
    IERC20 token = IERC20(tokens[tokenId].contractAddress);

    for (uint256 i = start; i < end; ++i) {
      Subscription storage sub = subsGroup.subscriptions[i];
      Tier storage tier = project.tiers[sub.tierIndex];

      uint256 chargeAmount = tier.amount * (block.timestamp - project.lastClaimDate) / tier.period;
      uint256 fee = totalAmount * project.fee / MAX_FEE;

      totalAmount += chargeAmount;
      totalFee += fee;

      try token.transferFrom(sub.donator, address(this), chargeAmount) returns (bool success) {
        if (!success) {
          failedClaim(project, sub.donator, tier);
        }
      } catch {
        failedClaim(project, sub.donator, tier);
      }
    }

    token.transferFrom(address(this), project.claimAddress, totalAmount - totalFee);
    project.lastClaimDate = uint40(block.timestamp);
  }

  function failedClaim(Project storage project, address donator, Tier storage tier) internal {
    SubscriptionDetails storage subDetails = subscriptionDetails[donator][project.id];

    IERC20 token = IERC20(tokens[tier.tokenId].contractAddress);
    uint256 allowance = token.allowance(donator, address(this));

    if (allowance < tier.amount || subDetails.failedClaims + 1 >= MAX_FAILED_CLAIMS) {
      unsubscribe(project.id, donator, tier.tokenId);
    } else {
      subDetails.failedClaims += 1;

      if (subDetails.isActive) {
        subDetails.isActive = false;
      }

      emit ClaimFailed(project.id, donator, block.timestamp);
    }
  }

  function addActiveToken(uint32[] storage activeTokens, uint32 tokenId) internal {
      for (uint256 i; i < activeTokens.length; ++i) {
        if (tokenId == activeTokens[i]) {
          return;
        }
      }

      activeTokens.push(tokenId);
  }

  function removeActiveToken(uint32[] storage activeTokens, uint32 tokenId) internal {
    uint256 length = activeTokens.length;

    for (uint256 i; i < length; ++i) {
      if (tokenId == activeTokens[i]) {
        activeTokens[i] = activeTokens[length - 1];
        activeTokens.pop();
        break;
      }
    }
  }
}