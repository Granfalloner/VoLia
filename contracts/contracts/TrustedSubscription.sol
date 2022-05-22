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
  uint32 tokenCounter;

  mapping(uint256 => Project) public projects;
  mapping(address => mapping(uint256 => SubscriptionDetails)) public subscriptionDetails;
  mapping(uint256 => Token) public tokens;

  event Subscribed(uint256 indexed projectId, address indexed donator, uint256 timestamp);
  event Unsubscribed(uint256 indexed projectId, address indexed donator, uint256 timestamp);
  event Claimed(uint256 indexed projectId, uint256 timestamp);
  event ClaimFailed(uint256 indexed projectId, address indexed donator, uint256 timestamp);

  function registerProject(address claimAddress, Tier[] calldata tiers) public onlyOwner {
    uint32 projectId = ++projectCounter;
    Project storage project = projects[projectId];

    require(claimAddress != address(0), 'Zero claim address');

    project.id = projectId;
    project.isActive = true;
    project.fee = uint16(DEFAULT_FEE);
    project.claimAddress = claimAddress;

    for (uint256 i; i < tiers.length; ++i) {
      Tier calldata tier = tiers[i];
      require(tokens[tier.tokenId].isActive, 'Token is not active');
      project.tiers.push(tier);
    }
  }

  function enableProject(uint256 projectId) public onlyOwner {
    Project storage project = projects[projectId];
    for (uint256 i; i < project.tiers.length; ++i) {
      uint32 tokenId = project.tiers[i].tokenId;
      require(tokens[tokenId].isActive, 'Token is not active');
    }
    projects[projectId].isActive = true;
  }

  function disableProject(uint256 projectId) public onlyOwner {
    projects[projectId].isActive = false;
  }

  function addTiers(uint256 projectId, Tier[] calldata newTiers) public onlyOwner {
    Project storage project = projects[projectId];
    require(project.isActive, 'Project is not active'); 

    for (uint256 i; i < newTiers.length; ++i) {
      Tier calldata tier = newTiers[i];
      require(tokens[tier.tokenId].isActive, 'Token is not active');
      project.tiers.push(tier);
    }
  }

  function enableTiers(uint256 projectId, uint256[] calldata tierIndices) public onlyOwner {
    Project storage project = projects[projectId];
    require(project.isActive, 'Project is not active'); 

    for (uint256 i; i < tierIndices.length; ++i) {
      Tier storage tier = project.tiers[tierIndices[i]];
      require(tokens[tier.tokenId].isActive, 'Token is not active');
      tier.isActive = true;
    }
  }

  function disableTiers(uint256 projectId, uint256[] calldata tierIndices) public onlyOwner {
    Project storage project = projects[projectId];
    require(project.isActive, 'Project is not active'); 

    for (uint256 i; i < tierIndices.length; ++i) {
      project.tiers[tierIndices[i]].isActive = false;
    }
  }

  function addTokens(address[] calldata contractAddresses) public onlyOwner {
    for (uint256 i; i < contractAddresses.length; ++i) {
      tokens[++tokenCounter] = Token({isActive: true, contractAddress: contractAddresses[i]});
    }
  }

  function enableTokens(uint32[] calldata tokenIds) public onlyOwner {
    for (uint256 i; i < tokenIds.length; ++i) {
      uint256 tokenId = tokenIds[i];
      require(tokenId <= tokenCounter, 'Invalid token id');
      tokens[tokenId].isActive = true;
    }
  }

  function disableTokens(uint32[] calldata tokenIds) public onlyOwner {
    for (uint256 i; i < tokenIds.length; ++i) {
      uint256 tokenId = tokenIds[i];
      require(tokenId <= tokenCounter, 'Invalid token id');
      tokens[tokenId].isActive = false;
    }
  }

  function subscribe(uint256 projectId, uint16 tierIndex) public {
    Project storage project = projects[projectId];
    Tier storage tier = project.tiers[tierIndex];
    SubscriptionDetails storage details = subscriptionDetails[msg.sender][projectId];

    require(project.isActive, 'Project is not active'); 
    require(tier.isActive, 'Tier is not active');
    require(tokens[tier.tokenId].isActive, 'Token is not active');
    require(details.startDate == 0, 'Already subscribed');

    if (project.lastClaimDate == 0) {
      project.lastClaimDate = uint40(block.timestamp);
    }

    addActiveToken(project.activeTokens, tier.tokenId);

    SubscriptionGroup storage tokenSubscriptions = project.tokenSubscriptions[tier.tokenId];
    Subscription memory newSubscription = Subscription({tierIndex: tierIndex, donator: msg.sender});

    tokenSubscriptions.subscriptions.push(newSubscription);
    tokenSubscriptions.subscriptionIndices[msg.sender] = tokenSubscriptions.subscriptions.length - 1;
    
    details.isActive = true;
    details.tokenId = tier.tokenId;
    details.startDate = uint40(block.timestamp);

    emit Subscribed(projectId, msg.sender, block.timestamp);
  }

  function unsubscribe(uint256 projectId, address donator) public {
    require(msg.sender == donator || msg.sender == owner(), 'Not authorized to unsubscribe');

    SubscriptionDetails storage details = subscriptionDetails[donator][projectId];
    SubscriptionGroup storage tokenSubscriptions = projects[projectId].tokenSubscriptions[details.tokenId];

    uint256 totalTokenSubs = tokenSubscriptions.subscriptions.length;
    uint256 index = tokenSubscriptions.subscriptionIndices[donator];
    
    Subscription storage subscription = tokenSubscriptions.subscriptions[index];
    require(subscription.donator == donator, 'Donator does not match');

    tokenSubscriptions.subscriptions[index] = tokenSubscriptions.subscriptions[totalTokenSubs - 1];
    tokenSubscriptions.subscriptions.pop();

    if (totalTokenSubs == 1) {
      removeActiveToken(projects[projectId].activeTokens, details.tokenId);
    }

    delete tokenSubscriptions.subscriptionIndices[donator];
    delete subscriptionDetails[donator][projectId];

    emit Unsubscribed(projectId, donator, block.timestamp);
  }

  function claim(uint256 projectId) public {
    Project storage project = projects[projectId];
    uint32[] storage activeTokens = project.activeTokens;

    for (uint256 i; i < activeTokens.length; ++i) {
      claim(projectId, activeTokens[i]);
    }

    project.lastClaimDate = uint40(block.timestamp);
    emit Claimed(projectId, block.timestamp);
  }

  function claim(uint256 projectId, uint32 tokenId) internal {
    SubscriptionGroup storage tokenSubscriptions = projects[projectId].tokenSubscriptions[tokenId];
    claimIn(projectId, tokenId, 0, tokenSubscriptions.subscriptions.length);
  }

  function claimIn(uint256 projectId, uint32 tokenId, uint256 start, uint256 end) internal {
    Project storage project = projects[projectId];
    Subscription[] storage subscriptions = project.tokenSubscriptions[tokenId].subscriptions;

    require(project.isActive, 'Project is not active'); 
    require(project.claimAddress != address(0), 'Claim address is zero');

    uint256 totalAmount;
    IERC20 token = IERC20(tokens[tokenId].contractAddress);

    for (uint256 i = start; i < end; ++i) {
      Subscription storage subscription = subscriptions[i];
      Tier storage tier = project.tiers[subscription.tierIndex];

      uint256 chargeAmount = tier.amount * (block.timestamp - project.lastClaimDate) / tier.period;

      try token.transferFrom(subscription.donator, address(this), chargeAmount) returns (bool success) {
        if (success) {
          totalAmount += chargeAmount;
        } else {
          failedClaim(project, subscription.donator, tier);
        }
      } catch {
        failedClaim(project, subscription.donator, tier);
      }
    }

    uint256 totalFee = totalAmount * project.fee / MAX_FEE;
    token.transfer(project.claimAddress, totalAmount - totalFee);
  }

  function getSubscriptionDetails(address donator, uint32 projectId) public view returns (SubscriptionDetails memory) {
    require(donator != address(0), 'Invalid donator address');
    require(projectId <= projectCounter, 'Invalid project id');

    return subscriptionDetails[donator][projectId];
  }

  function numberOfSubscribers(uint32 projectId) public view returns (uint256 result) {
    require(projectId <= projectCounter, 'Invalid project id');

    Project storage project = projects[projectId];

    for (uint256 i; i < project.activeTokens.length; ++i) {
      uint32 tokenId = project.activeTokens[i];
      result += numberOfSubscribersInToken(projectId, tokenId);
    }
  }

  function numberOfSubscribersInToken(uint32 projectId, uint32 tokenId) public view returns (uint256) {
    require(projectId <= projectCounter, 'Invalid project id');
    require(tokenId <= tokenCounter, 'Invalid token id');

    return projects[projectId].tokenSubscriptions[tokenId].subscriptions.length;
  }

  function claimableAmounts(uint32 projectId) public view returns (ClaimableAmount[] memory amounts) {
    require(projectId <= projectCounter, 'Invalid project id');

    uint32[] storage activeTokens = projects[projectId].activeTokens;
    amounts = new ClaimableAmount[](activeTokens.length);

    for (uint256 i; i < activeTokens.length; ++i) {
      amounts[i] = claimableAmountOfTokens(projectId, activeTokens[i]);
    }

    return amounts;
  }

  function claimableAmountOfTokens(uint32 projectId, uint32 tokenId) public view returns (ClaimableAmount memory result) {
    require(projectId <= projectCounter, 'Invalid project id');
    require(tokenId <= tokenCounter, 'Invalid token id');
    
    Project storage project = projects[projectId];
    Subscription[] storage subscriptions = project.tokenSubscriptions[tokenId].subscriptions;

    result.contractAddress = tokens[tokenId].contractAddress;

    for (uint256 i = 0; i < subscriptions.length; ++i) {
      Tier storage tier = project.tiers[subscriptions[i].tierIndex];
      result.amount += uint96(tier.amount * (block.timestamp - project.lastClaimDate) / tier.period);
    }
  }
  
  function failedClaim(Project storage project, address donator, Tier storage tier) internal {
    SubscriptionDetails storage subDetails = subscriptionDetails[donator][project.id];

    IERC20 token = IERC20(tokens[tier.tokenId].contractAddress);
    uint256 allowance = token.allowance(donator, address(this));

    if (allowance < tier.amount || subDetails.failedClaims + 1 >= MAX_FAILED_CLAIMS) {
      unsubscribe(project.id, donator);
    } else {
      subDetails.failedClaims += 1;

      if (subDetails.isActive) {
        subDetails.isActive = false;
        subDetails.failedClaimDate = uint40(block.timestamp);
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