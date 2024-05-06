// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./DebtStatusTokens.sol"; // Import your ERC721 contract
import "./SharedFunds.sol"; // Import your ERC20 contract

contract ExpenseSplit is ERC1155 {

    SharedFunds private sharedFundsTokens;  // Instance of your ERC-20 contract
    DebtStatusTokens private debtStatusTokens; // Instance of your ERC-721 contract
    uint256 public constant WRAPPED_SHARED_FUNDS_ID = 1; // ID for wrapped ERC-20
    
    uint256 public expensesLength;

    struct DebtClearance {
        uint256 amountCleared;
        uint256 clearedOn;
    }

    struct Expense {
        address creditor;
        string purpose;
        uint256 amount;
        uint256 share;
        address[] participants;
    }
    
    Expense[] public expenses;
   

    mapping(address => uint256[]) private participantExpenses; 
    mapping(address => uint) private balances;
    mapping(address => mapping(address => uint256)) public debts; 
    mapping(uint256 => DebtClearance) private _debtClearanceDetails;
    mapping(address => uint) private amountOwed; // total outstanding balances people owe u

    uint256 public constant OFFSET = 10000;  // An offset to distinguish ERC-1155 token IDs from ERC-721 token IDs

    // Mapping from ERC-1155 token ID to ERC-721 token ID
    mapping(uint256 => uint256) public erc1155ToErc721;
    mapping(address => mapping(address => uint256)) public NftDetails;

    event DebtAdded(address indexed debtor, uint256 amount);
    event DebtCleared(address indexed debtor, uint256 amount);
    event NFTTransfer(address indexed debtor, uint256 TokenId);

    constructor(address _debtStatusTokensAddress, address _SharedFundsTokensAddress) ERC1155("https://your-metadata-url/") {
        sharedFundsTokens= SharedFunds(_SharedFundsTokensAddress);
        debtStatusTokens = DebtStatusTokens(_debtStatusTokensAddress);
       
        address[] memory participants2 = new address[](2);
        participants2[0] = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
        participants2[1] = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;

        // expenses.push(Expense({
        //     creditor: msg.sender,
        //     purpose: "Sample Expense",
        //     amount: 500,
        //     participants: participants2
        // }));

        recordExpense(msg.sender, "Sample Expense2", 100, participants2);
     }
       
    function getExpensesCount() public view returns(uint) {
        return expenses.length;
    }
    
    function getSharedToken()  public view returns(SharedFunds){
        return sharedFundsTokens;
    }

    function getNFTDetails(address p1, address p2)public view returns(uint){
        return NftDetails[p1][p2];
    }
    function getAmountOwed(address p1, address p2) public view returns(uint){
        return debts[p1][p2];
    }
    function wrapSharedFunds(uint256 amount) public {
        require(sharedFundsTokens.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        _mint(msg.sender, WRAPPED_SHARED_FUNDS_ID, amount, "");
    }

    function unwrapSharedFunds(address _to,uint256 amount) public {
        require(balanceOf(_to, WRAPPED_SHARED_FUNDS_ID) >= amount, "Insufficient wrapped tokens");
        _burn(_to, WRAPPED_SHARED_FUNDS_ID, amount);
        require(sharedFundsTokens.transfer(_to, amount), "Transfer failed");
    }

     function wrapERC721AsERC1155(uint256 erc721TokenId) public returns (uint256){
        // Transfer ERC-721 token to this contract
        address owner=debtStatusTokens.ownerOf(erc721TokenId);
        debtStatusTokens.transferFrom(owner, address(this), erc721TokenId);

        // Calculate ERC-1155 token ID
        uint256 erc1155TokenId = erc721TokenId + OFFSET;

        // Mint ERC-1155 token
        _mint(owner, erc1155TokenId, 1, "");

        // Map the ERC-1155 token ID to the ERC-721 token ID
        erc1155ToErc721[erc1155TokenId] = erc721TokenId;
        return erc1155TokenId;
    }

    function unwrapERC1155AsERC721(address owner, uint256 erc1155TokenId) public {
    // Ensure the sender has the ERC-1155 token to be unwrapped

        require(balanceOf(owner, erc1155TokenId) > 0, "Caller does not own the token");

        // Calculate the original ERC-721 token ID
        uint256 erc721TokenId = erc1155TokenId - OFFSET;

        // Ensure the mapping is correct
        require(erc1155ToErc721[erc1155TokenId] == erc721TokenId, "Invalid token mapping");

        // Burn the ERC-1155 token
        _burn(owner, erc1155TokenId, 1);

        // require(erc1155ToErc721[erc1155TokenId] != erc721TokenId, "HI mapping");

        // Transfer the ERC-721 token back to the sender
        debtStatusTokens.transferFrom(address(this), owner, erc721TokenId);

        //  require(erc1155ToErc721[erc1155TokenId] != erc721TokenId, " token mapping");

        // Remove the mapping
        delete erc1155ToErc721[erc1155TokenId];
}

    
function recordExpense(address _creditor, string memory _purpose, uint256 _amount, address[] memory _participants) public {
    uint256 _share = _amount / _participants.length;
    Expense memory newExpense = Expense({
        creditor: _creditor,
        purpose: _purpose,
        amount: _amount,
        share: _share,
        participants: _participants
    });
    amountOwed[_creditor] += _amount;
    expenses.push(newExpense);
    calculateBalancesAndIssueNFTs(newExpense);
}

    function calculateBalancesAndIssueNFTs(Expense memory expense) internal {
    uint expenseId = expenses.length - 1;

    for (uint256 j = 0; j < expense.participants.length; j++) {
        address participant = expense.participants[j];
        participantExpenses[participant].push(expenseId);
        if(participant != expense.creditor){
            balances[participant] += expense.share; 
            debts[participant][expense.creditor] += expense.share;

            // Mint and Wrap the NFT
            uint256 erc721TokenId = debtStatusTokens._issueDebtClearedToken(participant, address(this), expense.share); // Assuming this function exists
            uint erc1155TokenId=wrapERC721AsERC1155(erc721TokenId);
            NftDetails[participant][expense.creditor]=erc1155TokenId;
        } else {
            amountOwed[expense.creditor] -= expense.share;
        }  
    }
}


    // Function to clear debt and issue a token if debt is fully cleared
    function clearDebt(address _to, uint256 amount) public {
        address from = msg.sender;

        // Check if the sender has enough tokens to clear the debt
        uint256 senderBalance = sharedFundsTokens.balanceOf(from);
        require(senderBalance >= amount, "Insufficient funds to clear debt");
        require(debts[from][_to] >= amount, "Not enough debt to clear"); 

        //wrapSharedFunds(amount);       
        // uint newToken;

        if (debts[from][_to]==amount){
            uint256[] memory tokenIds = new uint256[](2);
            uint256[] memory amounts = new uint256[](2);
            tokenIds[0] = WRAPPED_SHARED_FUNDS_ID;
            uint erc1155TokenId=NftDetails[from][_to];
            tokenIds[1] = erc1155TokenId;
            amounts[0]=amount;
            amounts[1]=1;
            debts[from][_to] -= amount; // Corrected mapping reference
            balances[from] -= amount;
            amountOwed[_to]-=amount;
            safeBatchTransferFrom(from, _to, tokenIds, amounts, "0x");
            unwrapERC1155AsERC721(_to,tokenIds[1]);
            unwrapSharedFunds(_to,amount);
            delete NftDetails[from][_to];
        }
        else{
            uint256[] memory tokenIds = new uint256[](1);
            uint256[] memory amounts = new uint256[](1);
            tokenIds[0]=WRAPPED_SHARED_FUNDS_ID;
            amounts[0]=amount;
            debts[from][_to] -= amount; // Corrected mapping reference
            balances[from] -= amount;
            amountOwed[_to]-=amount;
            safeBatchTransferFrom(from, _to, tokenIds, amounts, "0x");
            unwrapSharedFunds(_to,amount);
        }

        // sharedFundsTokens.transferFrom(from, _to, amount);
        // debts[from][_to] -= amount; // Corrected mapping reference
        // balances[from] -= amount;
        // amountOwed[_to]-=amount;

        // // Check if total debt for this debtor is 0
        // if (debts[from][_to]==0) {
        //     // newToken= debtStatusTokens._issueDebtClearedToken(_to, address(this), amount);
        //     emit DebtCleared(from, amount);
        //     debtStatusTokens.safeTransferFrom(_to, from, newToken);
        //     emit NFTTransfer(from,newToken);
        // }
    }

    function getDebtClearedDetails(uint256 tokenId) external view returns (string memory) {
        return debtStatusTokens.getDebtClearedDetails(tokenId);
    }

    function getParticipantAllExpensesDetails(address participant) public view returns 
    (   string[] memory, 
        uint256[] memory, 
        uint256[] memory, 
        address[] memory ,
        address[][] memory
    ) {
    uint256[] memory participantExpenseIds = participantExpenses[participant];

    uint256 length = participantExpenseIds.length;

    string[] memory purposes = new string[](participantExpenseIds.length);
    uint256[] memory totalAmounts = new uint256[](participantExpenseIds.length);
    uint256[] memory individualShares = new uint256[](participantExpenseIds.length);
    address[] memory creditors = new address[](participantExpenseIds.length);
    address[][] memory participants = new address[][](participantExpenseIds.length);

    for (uint256 i = 0; i < length; i++) {
        uint256 expenseId = participantExpenseIds[i];
        Expense storage expense = expenses[expenseId];

        purposes[i] = expense.purpose;
        totalAmounts[i] = expense.amount;
        individualShares[i] = expense.share;
        creditors[i] = expense.creditor;
        participants[i] = expense.participants;
    }

    return (purposes, totalAmounts, individualShares, creditors, participants);
    }

    function totaldebts(address _to) external view returns (uint,uint) {
        return (balances[_to],amountOwed[_to]);  // (You owe, You are owed)
    }

    function buySharedFundsTokens() public payable {
        // Call buyTokens function of the SharedFunds contract
        // require(msg.sender==buyer,"Participant cannot purchase tokens for others");
        sharedFundsTokens.buyTokensFromOwner{value: msg.value}(msg.sender);
    }

    // Rest of the ERC-1155 functionalities...
}


/*
0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB

["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4","0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
"0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB","0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"]



----
0x14F3a17407e1789C2a84687BA919faC48668C19e
0x3F6d48B96Ea9d3Fd645b29515324C21B034BfFEd
0x2Dd269010Fe7aB34e66aeBa2ccdE1D1822a71fC7
["0x14F3a17407e1789C2a84687BA919faC48668C19e",
"0x3F6d48B96Ea9d3Fd645b29515324C21B034BfFEd"]


*/