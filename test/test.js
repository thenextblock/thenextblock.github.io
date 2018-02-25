let TheNextBlock = artifacts.require("TheNextBlock");
const { should, EVMThrow, getParamFromTxEvent } = require('./helpers');


contract('TheNextBlock', function (accounts) {

    let GameContract; 
    let coinContractInstance;
    
    const owner = accounts[0];
    const player_1 = accounts[1];
    const player_2 = accounts[2];
    const player_3 = accounts[3];

    const correctMinerAddress = 0x0000000000000000000000000000000000000000; // Ganache Cli Miner Address
    const wrongMinerAddress = 0x0000000000000000000000000000000000000001; // Wrong Miner Address
    
    beforeEach('Setup contract for each test', async function () {
        GameContract = await TheNextBlock.new();
    });

    it('place bet', async function () {
        //console.log( (await  GameContract.allowedBetAmount()).toNumber() ); 
        await GameContract.placeBet(wrongMinerAddress, { from: player_1, value: web3.toWei(0.01, 'ether')  });
        assert.equal( ((await GameContract.getPlayerData( player_1 ))[1]).toNumber() , 0);
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  0 );
        
        await GameContract.placeBet(correctMinerAddress, { from: player_1, value: web3.toWei(0.01, 'ether')  });
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  1 );

        await GameContract.placeBet(correctMinerAddress, { from: player_1, value: web3.toWei(0.01, 'ether')  });
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  2 );        

        await GameContract.placeBet(correctMinerAddress, { from: player_1, value: web3.toWei(0.01, 'ether')  });
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  3 );        

        await GameContract.placeBet(correctMinerAddress, { from: player_1, value: web3.toWei(0.01, 'ether')  });
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  4 );    

        console.log('Prize Pool',  (await GameContract.getPrizePool()).toNumber() ); 
        console.log('owner balance ',  (await GameContract.getOwnersBalance()).toNumber() ); 

        let prizePool = web3.fromWei((await GameContract.getPrizePool()).toNumber());
        let ownerBalance = web3.fromWei((await GameContract.getOwnersBalance()).toNumber(), 'ether');
        

        //assert.equal( (prizePool + ownerBalance), 0.05 );
        //assert.equal( prizePool , 0.045 );
        //assert.equal( prizePool , 0.005 );

        console.log('Prize Pool : ', prizePool , ' ownerBalance :', ownerBalance );


    });
});

