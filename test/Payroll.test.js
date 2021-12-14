const { expect } = require("chai");
const useAccounts = require("../utilities/hooks/useAccounts");
const PayrollDeploy = require("../deploy/Payroll.deploy");

// GLOBALS
let accounts;
let contracts;

const resetState = async () => {
  contracts = await PayrollDeploy();
  contracts.axiaToken.transfer(contracts.payroll.address, 1000);
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
    ).to.equal(9000);
  });

  it("deploys payroll contract with 1000 axia token in it", async () => {
    expect(contracts.axiaToken.address).to.exist;
    expect(
      await contracts.axiaToken.balanceOf(contracts.payroll.address)
    ).to.equal(1000);
  });

  describe("HR REP", () => {
    it("Bob is our HR rep and adds alice as employee", async () => {
      await contracts.payroll
        .connect(accounts.bob)
        .addEmployee(accounts.alice.address, 100);

      expect(
        await contracts.payroll.employeeHourlyRate(accounts.alice.address)
      ).to.equal(100);
    });

    it("Rejects others from adding employees EVEN default admin", async () => {
      await expect(
        contracts.payroll
          .connect(accounts.alice)
          .addEmployee(accounts.carol.address, 1000)
      ).to.be.revertedWith("AccessControl:");

      await expect(
        contracts.payroll.addEmployee(accounts.carol.address, 1000)
      ).to.be.revertedWith("AccessControl:");
    });
  });

  describe("EMPLOYEE", async () => {
    it("lets employees add time", async () => {
      await contracts.payroll.connect(accounts.alice).addTime(5);

      expect(
        await contracts.payroll.employeePendingPay(accounts.alice.address)
      ).to.equal(500);
    });

    it("lets employees remove time", async () => {
      await contracts.payroll
        .connect(accounts.alice)
        .removeTime(accounts.alice.address, 1);

      expect(
        await contracts.payroll.employeePendingPay(accounts.alice.address)
      ).to.equal(400);
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
      ).to.equal(300);
    });
  });

  describe("Payment", async () => {
    it("Allows manager to approve pay", async () => {
      await contracts.payroll
        .connect(accounts.carol)
        .approvePay(accounts.alice.address, 300);

      expect(
        await contracts.payroll.employeePendingPay(accounts.alice.address)
      ).to.equal(0);

      expect(
        await contracts.payroll.employeeApprovedPay(accounts.alice.address)
      ).to.equal(300);
    });

    it("Allows employee to claim money", async () => {
      await contracts.payroll.connect(accounts.alice).claim();

      expect(
        await contracts.payroll.employeeApprovedPay(accounts.alice.address)
      ).to.equal(0);

      expect(
        await contracts.axiaToken.balanceOf(accounts.alice.address)
      ).to.equal(300);

      expect(
        await contracts.axiaToken.balanceOf(contracts.payroll.address)
      ).to.equal(700);
    });
  });
});
