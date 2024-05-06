// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SharedFunds is ERC20 {
    uint256 public exchange_rate; // Number of tokens per Ether
    address payable owner;
    uint256 public transferFee;
    bool public isExchangeOpen;

    event TransferWithFee(address indexed from, address indexed to, uint256 value, uint256 fee);
    event TransferFeeChanged(uint256 newFee);
    
    modifier whenExchangeOpen() {
        require(isExchangeOpen, "Exchange is closed");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this operation");
        _;
    }

    constructor(uint rate) ERC20("SharedFunds", "SF") {
        require(rate>0, "Exchange rate can never be negative or zero");
        exchange_rate = rate;
        owner = payable(msg.sender);
        transferFee = 0; // Initial transfer fee is 0%
        isExchangeOpen = true;
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
    
    function toggleExchange() external onlyOwner {
        isExchangeOpen = !isExchangeOpen;
    }

    // Allows owner to change the exchange rate
    function changeExchangeRate(uint rate) public onlyOwner {
        exchange_rate = rate;
    }

    //buy tokens by giving ether
    
    function buyTokensFromOwner(address customer) public payable whenExchangeOpen {
        uint256 etherAmount = (msg.value); 
        require(etherAmount > 0, "Sent Ether amount must be greater than 0");
        uint256 tokenAmount = etherAmount * exchange_rate;

        require(balanceOf(owner) >= tokenAmount, "Owner does not have enough tokens");
        payable(owner).transfer(msg.value);
        _transfer(owner, customer, tokenAmount);
    }

    function changeTransferFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 100, "Invalid fee"); // Fee should be less than or equal to 100%
        transferFee = _newFee;
        emit TransferFeeChanged(_newFee);
    }

}

/*
0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB
*/