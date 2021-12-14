const { expect } = require("chai");
const deployPropertyContract = require("../utilities/deployers/deployPropertyContract");
const useAccounts = require("../utilities/hooks/useAccounts");

// GLOBALS
let accounts;
let contracts;

const resetState = async () => {
  contracts = await deployPropertyContract();
};

describe("Property Contract", function () {
  before(async () => {
    accounts = await useAccounts();
    await resetState();
  });

  it("deploys usdt contract with 1000 usdt in deployer", async () => {
    expect(contracts.usdt.address).to.exist;
    expect(await contracts.usdt.balanceOf(accounts.deployer.address)).to.equal(
      1000
    );
  });

  it("Deploys the correct supply, circulating supply", async () => {});

  it("Marks admin priveledges, and who is the property owner", async () => {});

  it("shows how much the owner has and how much the contract has", async () => {});

  describe("getListings", async () => {
    before(async () => {
      await resetState();
    });

    it("returns tokens marked as listed", async () => {});
  });

  describe("getOffers", async () => {
    before(async () => {
      await resetState();
    });

    it("returns active offers", async () => {});
  });

  describe("getAddressTokens", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects asking for tokens that are not yours", async () => {});

    it("allows admins to see tokens of someone else", async () => {});

    it("allows someone to view their own tokens", async () => {});
  });

  describe("getToken", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects non owners from viewing another token", async () => {});

    it("allows admins to view tokens of someone else", async () => {});

    it("allows me to see my own token", async () => {});
  });

  describe("getBalance", async () => {
    before(async () => {
      await resetState();
    });

    it("returns the balance of senders address", async () => {});
  });

  describe("listToken", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects admin from listing a token", async () => {});

    it("rejects listing tokens not owned by you", async () => {});

    it("allows you to list your token", async () => {});

    it("rejects listing a token already listed", async () => {});

    it("emits TokenListed event", async () => {});
  });

  describe("updateListing", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects updating a listing not owned by you", async () => {});

    it("rejects updating a listing to a price of 0", async () => {});

    it("allows you to update the price of your listing", async () => {});
  });

  describe("unlistToken", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects unlisting a token that you dont own", async () => {});

    it("rejects unlisting a token not currently listed", async () => {});

    it("allows token to be unlisted, and sets list price back to 0", async () => {});

    it("emits TokenUnlisted event", async () => {});
  });

  describe("makeOffer", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects admin from making an offer", async () => {});

    it("rejects making an offer of 0", async () => {});

    it("rejects making more than one offer from same address", async () => {});

    it("allow you to make an offer for a property", async () => {});

    it("transfers offer amount into the smart contract", async () => {});

    it("emits MakeOffer event", async () => {});
  });

  describe("updateOffer", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects updating a offer not owned by you", async () => {});

    it("rejects updating a offer to a price of 0", async () => {});

    it("allows you to increase the offer amount and put in more money", async () => {});

    it("allows you to decrease the offer amount and withdraw money", async () => {});
  });

  describe("retractOffer", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects someone trying to retract an offer thats not theirs", async () => {});

    it("allows for retracting an offer", async () => {});

    it("reject trying to retract an offer that has already been retracted", async () => {});

    it("emits RetractOffer event", async () => {});
  });

  describe("buyListing", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects buying a token that is not listed", async () => {});

    it("rejects buying a token that is already yours", async () => {});

    it("rejects buying a token with not enough USDT", async () => {});

    it("allows for the purchase of the token", async () => {});

    it("switches usdt for token", async () => {});

    it("marks token as unlisted under new owner", async () => {});

    it("updates lastPurchase price on token", async () => {});

    it("emits TokenTransfer event", async () => {});
  });

  describe("acceptOffer", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects accepting an offer that is not active", async () => {});

    it("rejects accepting an offer that is already yours", async () => {});

    it("rejects accepting an offer with not enough token", async () => {});

    it("allows for the purchase of the token", async () => {});

    it("switches token for USDT", async () => {});

    it("marks token as unlisted under new owner", async () => {});

    it("updates lastPurchase price on token", async () => {});

    it("emits TokenTransfer event", async () => {});
  });

  describe("releaseToken", async () => {
    before(async () => {
      await resetState();
    });

    it("rejects non admins from releasing tokens", async () => {});

    it("rejects releasing more than available", async () => {});

    it("releases token count to owner", async () => {});

    it("updates circulating supply", async () => {});

    it("emits ReleaseSupply event", async () => {});
  });
});
