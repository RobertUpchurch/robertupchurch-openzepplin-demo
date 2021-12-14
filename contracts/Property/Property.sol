//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "./PropertyTypes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Property is PropertyTypes, AccessControl {

    //ROLES
    bytes32 public constant MODERATOR = keccak256("MODERATOR");
    bytes32 public constant PROPERTY_OWNER = keccak256("PROPERTY_OWNER");

    // EVENTS
    event TokenListed(uint tokenId, uint16 listPrice);
    event TokenUnlisted(uint tokenId);
    event MakeOffer(uint offerId, uint16 _offerAmount);
    event RetractOffer(uint offerId);
    event TokenTransfer(address from, address to, uint16 salePrice);

    // STATE - NEVER REORDER ONLY ADD
    IERC20 public usdt;
    string public propertyId;
    uint16 private initialPricePerShare;
    uint public totalSupply;
    uint public circulatingSupply;
    uint private ownerSupply;
    Token[] private tokens;
    Offer[] private offers;
    mapping(address => uint) private addressToTokenCount;
    mapping(address => uint) private addressToOfferCount;
    mapping(address => uint) private addressToListingCount;
    uint private activeListingCount;

    // INITIALIZER
    // TODO Make this contract upgradeable
    constructor(address _usdtAddress, string memory _propertyId, address _propertyOwner, uint _totalSupply, uint _initialSupply, uint16 _initialPricePerShare ) {
        usdt = IERC20(_usdtAddress);

        propertyId = _propertyId;
        initialPricePerShare = _initialPricePerShare;
        totalSupply = _totalSupply;
        ownerSupply = _initialSupply;
        circulatingSupply = 0;
        
        _setupRole(MODERATOR, msg.sender);
        _setupRole(PROPERTY_OWNER, _propertyOwner);
    }

    // MODIFIER
    modifier onlyTokenOwner(uint _tokenId) {
        require(msg.sender == tokens[_tokenId].currentOwner);
        _;
    }

    modifier onlyOfferBuyer(uint _offerId) {
        require(msg.sender == offers[_offerId].buyer);
        _;
    }

    function getAllListings() external view returns(Token[] memory) {
        Token[] memory activeListings = new Token[](activeListingCount);
        uint counter = 0;
        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i].listed) {
                activeListings[counter] = tokens[i];
                counter++;
                if (counter == activeListingCount) break;
            }
        }
        return activeListings;
    }

    function getOffers() external view returns(Offer[] memory) {
        return offers;
    }

    function getAddressTokens(address _address) external view returns(Token[] memory) {
        Token[] memory addressTokens = new Token[](addressToTokenCount[_address]);
        uint counter = 0;
        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i].currentOwner == _address) {
                addressTokens[counter] = tokens[i];
                counter++;
                if (counter == addressToTokenCount[_address]) break;
            }
        }
        return addressTokens;
    }

    function getAddressListings(address _address) external view returns(Token[] memory) {
        Token[] memory addressListings = new Token[](addressToListingCount[_address]);
        uint counter = 0;

        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i].currentOwner == _address) {
                addressListings[counter] = tokens[i];
                counter++;
                if (counter == addressToListingCount[_address]) break;
            }
        }

        return addressListings;
    }

    function getAddressOffers(address _address) external view returns(Offer[] memory) {
        Offer[] memory addressOffers = new Offer[](addressToOfferCount[_address]);
        uint counter = 0;

        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i].listed) {
                addressOffers[counter] = offers[i];
                counter++;
                if (counter == addressToOfferCount[_address]) break;
            }
        }

        return addressOffers;
    }

    function getBalance() public view returns (uint) {
        return addressToTokenCount[msg.sender];
    }

    function getToken(uint _tokenId) public view returns (Token memory) {
        return tokens[_tokenId];
    }

    function listToken(uint _tokenId, uint16 _listPrice) public onlyTokenOwner(_tokenId) {
        Token storage token = tokens[_tokenId];

        // MARK AS LISTED
        token.listed = true;
        token.price = _listPrice;
        
        // UPDATE COUNTS
        activeListingCount++;
        addressToListingCount[msg.sender]++;

        emit TokenListed(_tokenId, _listPrice);
    }

    function updateToken(uint _tokenId, uint16 _listPrice) public onlyTokenOwner(_tokenId) {
        Token storage token = tokens[_tokenId];
        token.price = _listPrice;
    }

    function unlistToken(uint _tokenId) public onlyTokenOwner(_tokenId) {
        Token storage token = tokens[_tokenId];

        // RESET TOKEN
        token.listed = false;
        token.price = 0;

        // UPDATE COUNTS
        activeListingCount--;
        addressToListingCount[msg.sender]--;

        // emit TokenUnlisted(_tokenId);
    }

    function makeOffer(uint16 _offerAmount) public {
        usdt.transferFrom(msg.sender, address(this), _offerAmount);

        offers.push(Offer({
            buyer: msg.sender,
            price: _offerAmount
        }));

        addressToOfferCount[msg.sender]++;

        emit MakeOffer(offers.length - 1, _offerAmount);
    }

    function updateOffer(uint _offerId, uint16 _offerAmount) public onlyOfferBuyer(_offerId) {
        Offer storage offer = offers[_offerId];
        offer.price = _offerAmount;
    }

    function retractOffer(uint _offerId) public onlyOfferBuyer(_offerId) {
        _deleteOffer(_offerId);
        usdt.transfer(msg.sender, offers[_offerId].price);
        emit RetractOffer(_offerId);
    }

    function buyListing(uint _listingId) public {
        Token storage token = tokens[_listingId];
        
        // TRANSFER PAYMENT
        usdt.transferFrom(msg.sender, token.currentOwner, token.price);

        //UPDATE THE COUNTS
        activeListingCount--;
        addressToTokenCount[token.currentOwner]--;
        addressToTokenCount[msg.sender]++;

        // EMIT EVENT
        emit TokenTransfer(token.currentOwner, msg.sender, token.price);

        // SWITCH THE OWNERSHIP
        token.currentOwner = msg.sender;

        // RESET TOKEN
        token.lastPurchasePrice = token.price;
        token.listed = false;
        token.price = 0;

    }

    function acceptOffer(uint _offerId, uint _tokenId) public onlyTokenOwner(_tokenId) {
        Offer memory offer = offers[_offerId];
        Token memory token = tokens[_tokenId];
        
        // TRANSFER PAYMENT
        usdt.transfer(offer.buyer, offer.price);

        //UPDATE THE COUNTS
        addressToTokenCount[msg.sender]--;
        addressToTokenCount[offer.buyer]++;

        // SWITCH THE OWNERSHIP
        token.currentOwner = offer.buyer;
        token.lastPurchasePrice = offer.price;

        // EMIT EVENT
        emit TokenTransfer(msg.sender, offer.buyer, offer.price);

        // DELETE THE OFFER
        _deleteOffer(_offerId);
    }

    function _createToken() private {
        tokens.push(Token({
            currentOwner: msg.sender,
            originalTokenPrice: initialPricePerShare,
            lastPurchasePrice: initialPricePerShare,
            listed: false,
            price: 0
        }));
        addressToTokenCount[msg.sender]++;
    }

    function _deleteOffer (uint _offerId) internal {
        offers[_offerId] = offers[offers.length - 1];
        delete offers[offers.length - 1];
    }

    function mint(uint _amount) public onlyRole(PROPERTY_OWNER) {
        require(ownerSupply >= circulatingSupply + _amount, "insufficient supply");
        circulatingSupply += _amount;
        for (uint i = 0; i < _amount; i++) {
            _createToken();
        }
    }

    function getOwnerSupply() public view onlyRole(PROPERTY_OWNER) returns (uint) {
        return ownerSupply;
    }

    function contractUSDTBalance() public view onlyRole(MODERATOR) returns (uint) {
        return usdt.balanceOf(address(this));
    }

    function releaseToken(uint _amount) public onlyRole(MODERATOR) {
        require(totalSupply >= ownerSupply + _amount, "insufficient supply");
        ownerSupply += _amount;
    }
}
