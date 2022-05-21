// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.9;

struct Tier {
  bool isActive;
  uint80 amount;
  uint32 period;
  uint32 tokenId;
}

struct Subscription {
  uint16 tierIndex;
  address donator;
}

struct SubscriptionGroup {
  Subscription[] subscriptions;
  mapping(address => uint256) subscriptionIndices;
}

struct Project {
  uint32 id;
  bool isActive;
  address claimAddress;
  uint40 lastClaimDate;
  uint16 fee;
  Tier[] tiers;
  uint32[] activeTokens;
  mapping(uint256 => SubscriptionGroup) tokenSubscriptions;
}

struct SubscriptionDetails {
  bool isActive;
  uint32 tokenId;
  uint40 startDate;
  uint40 failedClaimDate;
  uint8 failedClaims;
}

struct Token {
  bool isActive;
  address contractAddress;
}

struct ClaimableAmount {
  uint96 amount;
  address contractAddress;
}
