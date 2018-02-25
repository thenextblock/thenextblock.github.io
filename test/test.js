let TheNextBlock = artifacts.require("TheNextBlock");
const { should, EVMThrow, getParamFromTxEvent, BigNumber } = require('./helpers');


contract('TheNextBlock', function (accounts) {

    let GameContract; 
    let coinContractInstance;
    
    const owner = accounts[0];
    const player_1 = accounts[1];
    const player_2 = accounts[2];
    const player_3 = accounts[3];

    const alloweBetAmount = web3.toWei(0.01, 'ether');

    const correctMinerAddress = 0x0000000000000000000000000000000000000000; // Ganache Cli Miner Address
    const wrongMinerAddress = 0x0000000000000000000000000000000000000001; // Wrong Miner Address
    
    beforeEach('Setup contract for each test', async function () {
        GameContract = await TheNextBlock.new();
    });

    it('place bet', async function () {

        await GameContract.placeBet(wrongMinerAddress, { from: player_1, value: alloweBetAmount  });

        assert.equal( ((await GameContract.getPlayerData( player_1 ))[1]).toNumber() , 0);
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  0 );
        

        assert.equal( ((await GameContract.getPlayerData( player_1 ))[1]).toNumber() , 0);
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  0 );
        
        await GameContract.placeBet(correctMinerAddress, { from: player_1, value: alloweBetAmount  });
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  1 );

        await GameContract.placeBet(correctMinerAddress, { from: player_1, value: alloweBetAmount  });
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  2 );        

        await GameContract.placeBet(correctMinerAddress, { from: player_1, value: alloweBetAmount  });
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  3 );        

        await GameContract.placeBet(correctMinerAddress, { from: player_1, value: alloweBetAmount  });        
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  4 );    

        assert.equal(( (await GameContract.getPrizePool()).toNumber() + (await GameContract.getOwnersBalance()).toNumber()), web3.toWei(0.05, 'ether'));

        let prizePool = await GameContract.getPrizePool();
        let _prizePool = new BigNumber( await GameContract.getPrizePool() ).plus( alloweBetAmount * 0.9 );

        console.log( 'prizePool' ,   prizePool.toNumber(),  web3.fromWei(prizePool.toNumber(), 'ether')   );
        console.log( ' _prizePool', _prizePool.toNumber(),  web3.fromWei(_prizePool.toNumber(), 'ether')  );
        
        await GameContract.placeBet(correctMinerAddress, { from: player_1, value: web3.toWei(0.01, 'ether')  });

        var winningBalance = ((await GameContract.getPlayerData( player_1 ))[1]).toNumber();

        console.log( 'Winner Player balance : ', winningBalance );

        //assert.equal( ((await GameContract.getPlayerData( player_1 ))[1]).toNumber() ,  (_prizePool * 0.8) ); 

        //prizePool  +=  typeof(web3.toWei(0.01, 'ether')  ); 

        //console.log( 'prizePool' ,  prizePool);

        //console.log('Prize Pool',  (await GameContract.getPrizePool()).toNumber() ); 
        //onsole.log('owner balance ',  (await GameContract.getOwnersBalance()).toNumber() ); 

        // console.log('Player balance : ',  ( (await GameContract.getPlayerData( player_1 ) )[1] ).toNumber()  );
 
    });


    it('just check ', async function() {
        //console.log('Prize Pool',  (await GameContract.getPrizePool()).toNumber() ); 
        //console.log('owner balance ',  (await GameContract.getOwnersBalance()).toNumber() ); 
    });

});

