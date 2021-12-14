//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

interface IPayroll {

  function addEmployee(address _employee, uint16 _hourlyRate) external;

  function pay(address _employee) external;

  function addTime(uint _hours) external;

  function removeTime(address _employee, uint _hours) external;

}
