

const ExpenseSplit = artifacts.require("../contracts/ExpenseSplit");
const SharedFunds = artifacts.require("../contracts/SharedFunds"); // Replace with the actual name of your ERC20 contract
const DebtStatusTokens = artifacts.require("../contracts/DebtStatusTokens"); // Replace with the actual name of your ERC721 contract

module.exports = function (deployer) {
  deployer.deploy(SharedFunds,70).then(function() {
    return deployer.deploy(DebtStatusTokens);
  }).then(function() {
    return deployer.deploy(ExpenseSplit,  DebtStatusTokens.address, SharedFunds.address);
    // Ensure you provide addresses of the deployed ERC20 and ERC721 contracts above
  });
};


