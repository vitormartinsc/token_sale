const DappTokenSale = artifacts.require('DappTokenSale');
const DappToken = artifacts.require('DappToken');

contract('DappTokenSale', accounts => {
  let tokenSaleInstance;
  let tokenInstance;
  let tokensAvailable = 750000;
  let admin = accounts[0];
  let tokenPrice = 1;
  let numberOfTokens = 1000;
  let numberOfTokens2 = 800000;
  let buyer = accounts[2];

  beforeEach('setup contract for each test', async () => {
       tokenInstance = await DappToken.new(1000000, { from: admin });
       tokenSaleInstance = await DappTokenSale.new(tokenInstance.address, tokenPrice, { from: admin })
    });


  it('initializes the contract with the correct values', async () => {
    assert.ok(await tokenSaleInstance.address, 'has a address');
      return tokenSaleInstance.tokenContract().then(address => {
      assert.ok(address, 'has a token contract address');
      return tokenSaleInstance.tokenPrice();
    }).then(price => {
      assert.equal(price, tokenPrice, 'it has the same price');
    });
  });

  it('tests everything', async () => {
    await tokenInstance.transfer(tokenSaleInstance.address, 10000, { from: admin });
    await tokenSaleInstance.buyTokens(10, { from: buyer, value: 10 });
    assert.equal(await tokenInstance.balanceOf(buyer), 10);
    try {
      await tokenSaleInstance.endSale({ from: buyer });
      assert(false);
    } catch (error) {
      assert(error);
    };
    await tokenSaleInstance.endSale({ from: admin });
    assert.equal(await tokenInstance.balanceOf(admin), 999990, 'it returns the value to the admin');
    try {
      await tokenSaleInstance.tokenPrice();
      assert(false);
    } catch(error) {
      assert(error)
    }
  });
});
