const { expect } = require("chai");
const decimals = require("./utilities/helpers/decimals");
const useAccounts = require("./utilities/hooks/useAccounts");
const usePayroll = require("./utilities/contracts/usePayroll");

// GLOBALS
let accounts;
let contracts;

const resetState = async () => {
  contracts = await usePayroll();
  contracts.axiaToken.transfer(contracts.payroll.address, decimals(1000));
  contracts.payroll.grantRole(
    await contracts.payroll.HR_ROLE(),
    accounts.bob.address
  );
  contracts.payroll.grantRole(
    await contracts.payroll.MANAGER(),
    accounts.carol.address
  );
};

describe("Payroll", function () {
  before(async () => {
    accounts = await useAccounts();
    await resetState();
  });

  it("deploys axia token with 10,000 axia in deployer", async () => {
    expect(contracts.axiaToken.address).to.exist;
    expect(
      await contracts.axiaToken.balanceOf(accounts.deployer.address)
    ).to.equal(0);
  });

  it("deploys payroll contract with 1000 axia token in it", async () => {
    expect(contracts.axiaToken.address).to.exist;
    expect(
      await contracts.axiaToken.balanceOf(contracts.payroll.address)
    ).to.equal(decimals(1000));
  });

  describe("HR REP", () => {
    it("Bob is our HR rep and adds alice as employee", async () => {
      await contracts.payroll
        .connect(accounts.bob)
        .addEmployee(accounts.alice.address, decimals(100));

      expect(
        await contracts.payroll.employeeHourlyRate(accounts.alice.address)
      ).to.equal(decimals(100));
    });

    it("Rejects others from adding employees even default admin", async () => {
      // EMPLOYEE CANT ADD EMPLOYEE
      await expect(
        contracts.payroll
          .connect(accounts.alice)
          .addEmployee(accounts.carol.address, decimals(100))
      ).to.be.revertedWith("AccessControl:");

      // DEFAULT ADMIN CANT ADD EMPLOYEE
      await expect(
        contracts.payroll.addEmployee(accounts.carol.address, decimals(1000))
      ).to.be.revertedWith("AccessControl:");
    });
  });

  describe("EMPLOYEE", async () => {
    it("lets employees add time", async () => {
      await contracts.payroll.connect(accounts.alice).addTime(5);

      expect(
        await contracts.payroll.employeePendingPay(accounts.alice.address)
      ).to.equal(decimals(500));
    });

    it("lets employees remove time", async () => {
      await contracts.payroll
        .connect(accounts.alice)
        .removeTime(accounts.alice.address, 1);

      expect(
        await contracts.payroll.employeePendingPay(accounts.alice.address)
      ).to.equal(decimals(400));
    });

    it("rejects employees from removing other peoples time", async () => {
      await expect(
        contracts.payroll
          .connect(accounts.alice)
          .removeTime(accounts.carol.address, 5)
      ).to.be.revertedWith("Access Control:");
    });

    it("allows hr reps to remove time", async () => {
      await contracts.payroll
        .connect(accounts.bob)
        .removeTime(accounts.alice.address, 1);

      expect(
        await contracts.payroll.employeePendingPay(accounts.alice.address)
      ).to.equal(decimals(300));
    });
  });

  describe("Payment", async () => {
    it("Allows manager to approve pay", async () => {
      await contracts.payroll
        .connect(accounts.carol)
        .approvePay(accounts.alice.address, decimals(300));

      expect(
        await contracts.payroll.employeePendingPay(accounts.alice.address)
      ).to.equal(0);

      expect(
        await contracts.payroll.employeeApprovedPay(accounts.alice.address)
      ).to.equal(decimals(300));
    });

    it("Allows employee to claim money", async () => {
      await contracts.payroll.connect(accounts.alice).claim();

      expect(
        await contracts.payroll.employeeApprovedPay(accounts.alice.address)
      ).to.equal(0);

      expect(
        await contracts.axiaToken.balanceOf(accounts.alice.address)
      ).to.equal(decimals(300));

      expect(
        await contracts.axiaToken.balanceOf(contracts.payroll.address)
      ).to.equal(decimals(700));
    });
  });
});
