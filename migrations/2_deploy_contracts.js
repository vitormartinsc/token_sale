const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

module.exports = async (deployer) => {
  deployer.deploy(DappToken, 1000000).then(() => {
    return deployer.deploy(DappTokenSale, DappToken.address, web3.utils.toWei('0.001', 'ether'))
  });
};
