//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Payroll is AccessControl {

  // ROLES - 
  bytes32 public constant HR_ROLE = keccak256("HR_ROLE");
  bytes32 public constant MANAGER = keccak256("MANAGER");
  bytes32 public constant EMPLOYEE = keccak256("EMPLOYEE");

  // STATE
  IERC20 axiaToken;
  mapping(address => uint256) public employeeHourlyRate;
  mapping(address => uint256) public employeeApprovedPay;
  mapping(address => uint256) public employeePendingPay;

  // EVENTS
  event Payment(address employee, uint256 amount);
  event AddEmployee(address account);

  constructor(address _axiatokenAddress){
    axiaToken = IERC20(_axiatokenAddress);

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setRoleAdmin(EMPLOYEE, HR_ROLE);
  }

  function addEmployee(address _employee, uint256 _hourlyRate) public onlyRole(HR_ROLE) {
    employeeHourlyRate[_employee] = _hourlyRate;
    grantRole(EMPLOYEE, _employee);
    emit AddEmployee(_employee);
  }

  function claim() public onlyRole(EMPLOYEE) {
    axiaToken.transfer(msg.sender, employeeApprovedPay[msg.sender]);
    emit Payment(msg.sender, employeeApprovedPay[msg.sender]);
    employeeApprovedPay[msg.sender] = 0;
  }

  function addTime(uint _hours) public onlyRole(EMPLOYEE) {
    employeePendingPay[msg.sender] += (_hours * employeeHourlyRate[msg.sender]);
  }

  function approvePay(address _account, uint _amount) public onlyRole(MANAGER) {
    require(_amount <= employeePendingPay[_account], "approval too high");
    employeePendingPay[_account] -= _amount;
    employeeApprovedPay[_account] += _amount;
  }

  function removeTime(address _employee, uint _hours) public {
    require(
      (hasRole(EMPLOYEE, msg.sender) && msg.sender == _employee) 
      || hasRole(HR_ROLE, msg.sender), 
      "Access Control: insufficient role permissions"
    );
    employeePendingPay[_employee] -= (_hours * employeeHourlyRate[_employee]);
  }

}
