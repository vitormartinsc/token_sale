App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 0,
  tokenSold: 0,
  tokensAvailable: 1000000,

  init: () => {
    console.log('App initialized...');
    return App.initWeb3();
  },

  initWeb3: () => {
    if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
      // if we are in browser and Metamask is already installed
      App.web3Provider = window.ethereum;
      web3 = new Web3(window.ethereum);
      window.ethereum.request({ method: 'eth_requestAccounts' });
    } else {
      // we are on server or user is not running Metamask
      App.web3Provider = new Web3.providers.HttpProvider("https://Localhost:7547");
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts()
  },

  initContracts: () => {
    $.getJSON('DappTokenSale.json', dappTokenSale => {
      App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
      App.contracts.DappTokenSale.setProvider(App.web3Provider);
      App.contracts.DappTokenSale.deployed().then(dappTokenSale => {
        console.log(dappTokenSale.address);
      })
    }).done(() => {
        $.getJSON('DappToken.json', dappToken => {
          App.contracts.DappToken = TruffleContract(dappToken);
          App.contracts.DappToken.setProvider(App.web3Provider);
          App.contracts.DappToken.deployed().then(dappToken => {
            console.log(dappToken.address);
        });
        App.listenForEvents();
        return App.render();
      });
    });
  },

  listenForEvents: () => {
    App.contracts.DappTokenSale.deployed().then(instance => {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log(event);
        App.render();
      });
    });
  },

  render: () => {

    if (App.loading){
      return;
    }
    App.loading = true;

    const loader = $('#loader');
    const content = $('#content');

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html('Your account: ' + account);
      };
    });

    // Load token sale contract
    App.contracts.DappTokenSale.deployed().then(instance => {
      dappTokenSaleInstance = instance;
      return dappTokenSaleInstance.tokenPrice();
    }).then(tokenPrice => {
      App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.fromWei(App.tokenPrice.toNumber()));
      return dappTokenSaleInstance.tokensSold();
    }).then(tokenSold => {
      App.tokenSold = tokenSold.toNumber();
      $('.tokens-sold').html(App.tokenSold);
      $('.tokens-available').html(App.tokensAvailable);
      let progressPercent = Math.ceil(100 * App.tokenSold / App.tokensAvailable);
      $('#progress').css('width', progressPercent + '%');
    });

    // Load token contract
    App.contracts.DappToken.deployed().then(instance => {
      dappTokenInstance = instance;
      return dappTokenInstance.balanceOf(App.account);
    }).then(balance => {
      $('.dapp-balance').html(balance.toNumber());
      App.loading = false;
      loader.hide();
      content.show();
    });
  },

  buyTokens: () => {
    $('#content').hide();
    $('#loader').show();
    let numberOfTokens = $('#numberOfTokens').val();
    App.contracts.DappTokenSale.deployed().then(instance => {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000
      });
    }).then(result => {
      console.log("Tokens bought...")
       $('form').trigger('reset');
    });
  }
}


$(function() {
  $(window).on('load' , function() {
    App.init();
  });
});
