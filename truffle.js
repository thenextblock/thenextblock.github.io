require('babel-register')
require('babel-polyfill')


module.exports = {
  // networks: {
  //   development: {
  //     host: "localhost",
  //     port: 8545,
  //     network_id: "577", // Match any network id
  //     gas: 4712388
  //   },
  
  development: {
    host: "localhost",
    port: 8545,
    network_id: "*", // Match any network id
    gas: 4712388
  }

  //}
  // ,mocha: {
  //   reporter: 'eth-gas-reporter',
  //   reporterOptions : {
  //     currency: 'USD',
  //     gasPrice: 50,
  //     outputFile : 'gas-report.md'
  //   }
  // }
  
};



