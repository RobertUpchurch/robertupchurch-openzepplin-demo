//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDT is ERC20 {
  constructor() ERC20("Tether", "USDT") {
    _mint(msg.sender, 1000);
  }
}