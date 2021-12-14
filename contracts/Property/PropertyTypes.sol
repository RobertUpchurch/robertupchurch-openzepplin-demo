//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

contract PropertyTypes {
  struct Token {
    address currentOwner;
    uint16 originalTokenPrice;
    uint16 lastPurchasePrice;
    bool listed;
    uint16 price;
  }

  struct Offer {
    address buyer;
    uint16 price;
  }
}