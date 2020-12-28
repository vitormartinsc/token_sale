const HDWalletProvider = require('@truffle/hdwallet-provider');
const memoric = 'local comic joke replace more receive code model retreat enjoy pistol promote';

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
     development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*"       // Any network (default: none)
    },
     rinkeby: {
       provider: () => {
         return new HDWalletProvider(memoric,
           'https://rinkeby.infura.io/v3/3c5ba4f3a79047bc8cd1eb5e0fe00b05')
       },
       network_id: 4,
       gas: 4700000
     }
  }
};
