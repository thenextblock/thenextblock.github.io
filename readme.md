# TheNextBlock
## About the project

This is small dapp using ethereum smart contract and web3.
The Next Block is a blockchain-based game in which users must predict which miner will mines the transaction sent by players. 

###Game Rules: 

Each account (public address) is able place only one bet per block.
If a player predicts the correct miner they will earn one point.
If a player predicts (guesses) correctly in 5 consecutive bets and thus earns 5 points, hi is the winner and will receive 90% of the total pool (the bets collected).
If the player does not correctly predict the miner, his/her points will be reduced to zero.
The total prize are collected from players' bets until one player correctly predicts 5 miners in a row. It is not necessary bet on each block; it is up to you where to place your bets.


## Test using Truffle framework 
truffle test --network [network name]


## Connect our private network.

* 1. Genessis JSON File: gennesis.json

``` json
{
    "config": {
        "chainId": 577,
        "homesteadBlock": 0,
        "eip155Block": 0,
        "eip158Block": 0
    },
    "difficulty": "2000",
    "gasLimit": "8000029",
	"alloc" :  {}
}
```

* 2. Initialize Geth

    ``` geth --datadir=./data init genessis.json ```



* 3. Run Geth

    ~~~
    ./geth --fast --networkid=577  --shh --rpc --rpcaddr "0.0.0.0" --rpcapi "eth,net,web3,admin,shh" --rpccorsdomain "*" --datadir "data"  --ws --wsaddr "0.0.0.0" --wsapi "eth,net,web3,admin,shh" --wsorigins "*" --bootnodes "enode://3f67339af516a7ce62df1fd5e07e1ea9d173e5ad21a4ee021853f3da900e938707284b119d46df31608e5eaae3493591bf729cd210a2351188393819bb879dd7@13.95.67.47:30303" console
    ~~~

* start mining
``` miner.start(1)```

remix miners 
```
0x94d76e24f818426ae84aa404140e8d5f60e10e7e
0x8945a1288dc78a6d8952a92c77aee6730b414778
```



0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a
