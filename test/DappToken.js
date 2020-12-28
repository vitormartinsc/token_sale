const DappToken = artifacts.require('DappToken');

contract('DappToken', accounts => {
  let tokenInstance;

  it('sets the right values', () => {
    return DappToken.deployed().then(instance => {
      tokenInstance = instance;
      return tokenInstance.name();
    }).then(name => {
        assert.equal(name, 'DApp Token');
        return tokenInstance.symbol();
      }).then(symbol => {
        assert.equal(symbol, 'DAPP')
      });
    });

  it('sets the total supply upon deployment', () => {
    return DappToken.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.totalSupply()
    }).then(function(totalSupply) {
      assert.equal(totalSupply, 1000000, "sets the total supply to one million");
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function (adminBalance) {
      assert.equal(adminBalance, 1000000, "it allocates the initial supply to the admin")
    });
  });

  it('transfer token ownership correctly', () => {
    return DappToken.deployed().then(instance => {
      tokenInstance = instance;
      return tokenInstance.transfer.call(accounts[1], 99999999999999);
    }).then(assert.fail).catch(error => {
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
    }).then(success => {
      assert.equal(success, true, 'the transction has been succeed');
      return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
    }).then(receipt => {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be "Transfer" event');
      assert.equal(receipt.logs[0].args._from, accounts[0]);
      assert.equal(receipt.logs[0].args._to, accounts[1]);
      assert.equal(receipt.logs[0].args._value, 250000);

      return tokenInstance.balanceOf(accounts[1]);
    }).then(balance => {
      assert.equal(balance, 250000, 'adds the amount to the receive account');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(balance => {
      assert.equal(balance, 750000, 'deducts the amount to the sender account');
    });
  });

  it('approves tokens for delegated transfer', () =>{
    return DappToken.deployed().then(instance => {
      tokenInstance = instance;
      return tokenInstance.approve.call(accounts[1], 100);
    }).then(success => {
      assert.equal(success, true, 'it returns true');
      return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
    }).then(receipt => {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Approval', 'should be "Transfer" event');
      assert.equal(receipt.logs[0].args._owner, accounts[0], 'the owner is the owner address');
      assert.equal(receipt.logs[0].args._spender, accounts[1], 'the spender is the spender address');
      assert.equal(receipt.logs[0].args._value, 100, 'we have allowed 100 DAPPs');
      return tokenInstance.allowance(accounts[0], accounts[1]);
    }).then(allowance => {
      assert.equal(allowance, 100, 'correctly allowance to the correctly address');
    });
  });

  it('handles delegated token transfers', () => {
    return DappToken.deployed().then(instance => {
      tokenInstance = instance;
      fromAccount = accounts[2];
      toAccount = accounts[3];
      spendingAccount = accounts[4];
      return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
    }).then(receipt => {
      return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
    }).then(receipt => {
      return tokenInstance.transferFrom(fromAccount, toAccount, 101, { from: spendingAccount });
    }).then(assert.fail).catch(error => {
      assert(error.message.indexOf('revert' >= 0, 'cannot transfer value larger thant its _from balance'))
      return tokenInstance.transferFrom(fromAccount, toAccount, 11, { from: spendingAccount });
    }).then(assert.fail).catch(error => {
      assert(error.message.indexOf('revert' >= 0, 'cannot transfer value larger thant it has been approved by the fromAccount'))
      return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(success => {
      assert.equal(success, true, 'returns true');
      return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
    }).then(receipt => {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be "Transfer" event');
      assert.equal(receipt.logs[0].args._from, fromAccount);
      assert.equal(receipt.logs[0].args._to, toAccount);
      assert.equal(receipt.logs[0].args._value, 10);
      return tokenInstance.balanceOf(fromAccount);
    }).then(balance => {
      assert.equal(balance, 90, 'check if the from balance has diminished 10 units');
      return tokenInstance.balanceOf(toAccount);
    }).then(balance => {
      assert.equal(balance, 10, 'check if the to account balance has increased');
      return tokenInstance.allowance(fromAccount, spendingAccount);
    }).then(balance => {
      assert.equal(balance, 0, 'check if the allowance has diminished of the spender');
    });
  });
});
*/
