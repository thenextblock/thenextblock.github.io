require('babel-register')
require('babel-polyfill')


module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "577", // Match any network id
      gas: 4712388
    },
    ganache: {
      host: "localhost",
      port: 8547,
      network_id: "577", // Match any network id
      gas: 4712388
    }
  }
  // ,mocha: {
  //   reporter: 'eth-gas-reporter',
  //   reporterOptions : {
  //     currency: 'USD',
  //     gasPrice: 50,
  //     outputFile : 'gas-report.md'
  //   }
  // }
  
};



