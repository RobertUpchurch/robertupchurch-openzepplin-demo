const { expect } = require("chai");
const decimals = require("./utilities/helpers/decimals");
const useAccounts = require("./utilities/hooks/useAccounts");
const useAxiaToken = require("./utilities/contracts/useAxiaToken");

// GLOBALS
let accounts;
let contracts;

const resetState = async () => {
  contracts = await useAxiaToken({});
};

describe("Axia Token", function () {
  before(async () => {
    accounts = await useAccounts();
    await resetState();
  });

  it("deploys axia token with 1000 axia in deployer", async () => {
    expect(contracts.axiaToken.address).to.exist;
    expect(
      await contracts.axiaToken.balanceOf(accounts.deployer.address)
    ).to.equal(decimals(1000));
  });

  describe("Minting", async () => {
    before(resetState);

    it("Allows the owner to mint more token", async () => {
      expect(await contracts.axiaToken.totalSupply()).to.equal(decimals(1000));

      await expect(
        contracts.axiaToken
          .connect(accounts.alice)
          .mint(accounts.alice.address, 1000)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await contracts.axiaToken.mint(accounts.deployer.address, decimals(1000));

      expect(await contracts.axiaToken.totalSupply()).to.equal(decimals(2000));
    });
  });

  describe("Capping", async () => {
    before(resetState);

    it("stops the owner from infinitely making money", async () => {});
  });

  describe("Burning", async () => {
    before(async () => {
      await resetState();
      await contracts.axiaToken.transfer(
        accounts.alice.address,
        decimals(1000)
      );
    });

    it("lets the user burn their own tokens", async () => {
      expect(await contracts.axiaToken.totalSupply()).to.equal(decimals(1000));

      // ALICE BURNS THE MONEY - https://youtu.be/qMkkfuSizc4?t=74
      await contracts.axiaToken.connect(accounts.alice).burn(decimals(100));

      // SHOULD BE GONE
      expect(
        await contracts.axiaToken.balanceOf(accounts.alice.address)
      ).to.equal(decimals(900));

      expect(await contracts.axiaToken.totalSupply()).to.equal(decimals(900));
    });

    it("rejects owner from burning alices money without permission", async () => {
      await expect(
        contracts.axiaToken.burnFrom(accounts.alice.address, decimals(100))
      ).to.be.revertedWith("ERC20: burn amount exceeds allowance");
    });
  });

  describe("Pausing", async () => {
    before(resetState);

    it("lets the owner pause and un pause", async () => {
      expect(await contracts.axiaToken.paused()).to.equal(false);
      await expect(contracts.axiaToken.pause()).to.emit(
        contracts.axiaToken,
        "Paused"
      );
      expect(await contracts.axiaToken.paused()).to.equal(true);
    });

    it("Stops trading when the owner pauses", async () => {
      await expect(
        contracts.axiaToken.transfer(accounts.alice.address, decimals(1000))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Allows un pausing and resuming trades", async () => {
      await expect(contracts.axiaToken.unpause()).to.emit(
        contracts.axiaToken,
        "Unpaused"
      );

      expect(await contracts.axiaToken.paused()).to.equal(false);

      await expect(
        contracts.axiaToken.transfer(accounts.alice.address, decimals(1000))
      ).to.emit(contracts.axiaToken, "Transfer");

      expect(
        await contracts.axiaToken.balanceOf(accounts.alice.address)
      ).to.equal(decimals(1000));
    });
  });
});
