// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DebtStatusTokens is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct DebtClearance {
        address contributor;
        uint256 amountCleared;
        uint256 clearedOn;
        string  message;
    }

    // Define events
    event TokenMinted(address indexed recipient, uint256 tokenId, string tokenType);
    mapping(uint256 => DebtClearance) private _debtClearanceDetails;

    constructor() ERC721("Debt Status Tokens", "DST") {}

    // Function to construct a token URI from debt clearance details
    function constructTokenURI(DebtClearance memory debtDetails) private pure returns (string memory) {
        return string(abi.encodePacked(
            "Amount Cleared: ", Strings.toString(debtDetails.amountCleared),
            ", Cleared On: ", Strings.toString(debtDetails.clearedOn),
            "message :",debtDetails.message
        ));
    }


    // Internal function to issue a new NFT token
    function _issueDebtClearedToken(address recipient, address erc1155ContractAddress, uint256 amountCleared) external returns (uint256) {
           DebtClearance memory debtDetails = DebtClearance({
            contributor: recipient,
            amountCleared: amountCleared,
            clearedOn: block.timestamp,
            message:"All Settled Up"
        });
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(recipient, newTokenId);
        string memory debtDetailsURI = constructTokenURI(debtDetails);
        _setTokenURI(newTokenId, debtDetailsURI);
        _debtClearanceDetails[newTokenId]=debtDetails;
        emit TokenMinted(recipient, newTokenId, "All settled up");
         if (!isApprovedForAll(recipient, erc1155ContractAddress)) {
            _setApprovalForAll(recipient, erc1155ContractAddress, true);
        }
        return newTokenId;
    }

    function getDebtClearedDetails(uint256 tokenId) external view returns (string memory) {
        try this.ownerOf(tokenId) returns (address) {
            return tokenURI(tokenId);
        } catch {
            revert("Query for nonexistent token");
        }
    }
}

/*
0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
*/