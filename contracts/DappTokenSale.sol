pragma solidity ^0.5.1;

import './DappToken.sol';

contract DappTokenSale {
  address payable admin;
  DappToken public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold;

  event Sell(address _buyer, uint256 _amount);

  constructor (DappToken _tokenContract, uint256 _tokenPrice) public {
    admin = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice = _tokenPrice;
  }

  function getContractBalance() public view returns (uint256) {
    return tokenContract.balanceOf(address(this));
  }

  function buyTokens(uint256 _numberOfTokens) public payable {
    require(msg.value == _numberOfTokens * tokenPrice);
    require(_numberOfTokens <= getContractBalance());
    require(tokenContract.transfer(msg.sender, _numberOfTokens));

    tokensSold += _numberOfTokens;

    emit Sell(msg.sender, _numberOfTokens);
  }

  function endSale() public  {
    require(msg.sender == admin);
    require(tokenContract.transfer(admin, getContractBalance()));
    selfdestruct(admin);
  }

}
