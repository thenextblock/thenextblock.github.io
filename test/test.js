let TheNextBlock = artifacts.require("TheNextBlock");
let Attacker = artifacts.require("Attacker");

const { should, EVMThrow, getParamFromTxEvent, BigNumber } = require('./helpers');


contract('TheNextBlock', function (accounts) {

    let GameContract; 
    let AttackerContract;


    const owner = accounts[0];
    const player_1 = accounts[1];
    const player_2 = accounts[2];
    const player_3 = accounts[3];
    const vandal = accounts[4];
    const newOwner = accounts[5];

    const alloweBetAmount = web3.toWei(0.005, 'ether');

    const correctMinerAddress = 0x0000000000000000000000000000000000000000; // Ganache Cli Miner Address
    const wrongMinerAddress = 0x0000000000000000000000000000000000000001; // Wrong Miner Address
    
    before('Setup contract for each test', async function () {
        GameContract = await TheNextBlock.new();
        AttackerContract = await Attacker.new();
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
        assert.equal((await GameContract.getPlayersPoints(player_1)).toNumber(),  2, 'Wrong players points' );        


        let prizePool =  (await GameContract.getPrizePool()).toNumber();
        let nextPrizePool =  (await GameContract.getNextPrizePool()).toNumber() ;
        let ownerBalance =  (await GameContract.getOwnersBalance()).toNumber() ;

        assert.equal( (prizePool + nextPrizePool + ownerBalance), web3.toWei(0.015, 'ether') );

        let _prizePool = new BigNumber(prizePool).plus( alloweBetAmount * 0.7 );
        let _nextPrizePool = new BigNumber(nextPrizePool).plus( alloweBetAmount * 0.2 );

        await GameContract.placeBet(correctMinerAddress, { from: player_1, value: alloweBetAmount  });
        let winningBalance = ((await GameContract.getPlayerData( player_1 ))[1]).toNumber();
        assert.equal(winningBalance, _prizePool);

        nextPrizePool =  (await GameContract.getNextPrizePool()).toNumber();
        prizePool =  (await GameContract.getPrizePool()).toNumber();
        assert.equal(nextPrizePool, 0);
        assert.equal(prizePool, _nextPrizePool);

        
        let player_1_previous_balance = new BigNumber(await web3.eth.getBalance(player_1));
        await GameContract.withdrawMyFunds({ from: player_1 });
        let player_1_current_balance = new BigNumber(await web3.eth.getBalance(player_1));
        player_1_previous_balance.should.be.bignumber.lessThan(player_1_current_balance);

        assert.equal( ((await GameContract.getPlayerData( player_1 ))[1]).toNumber() , 0);

        await GameContract.withdrawOwnersFunds({ from : vandal }).should.be.rejectedWith(EVMThrow);
        let owner_previous_balance = new BigNumber(await web3.eth.getBalance(owner));
        await GameContract.withdrawOwnersFunds({ from : owner });
        let owner_current_balance = new BigNumber(await web3.eth.getBalance(owner));
        owner_previous_balance.should.be.bignumber.lessThan(owner_current_balance);
        assert.equal( ((await GameContract.getOwnersBalance())).toNumber() , 0);

    });


    it('attack contract using smartcontract ', async function() {
        let gamecontractAddress = GameContract.address.toString();
        AttackerContract.play(gamecontractAddress, {from: vandal, value: alloweBetAmount });
        let attakerPoints = (await GameContract.getPlayersPoints(vandal)).toNumber();
        assert.equal(attakerPoints, 0);

    });

    it('should change owner', async function(){
        await GameContract.changeOwner(newOwner, { from: newOwner }).should.be.rejectedWith(EVMThrow);
        await GameContract.changeOwner(newOwner, { from: owner });
        assert.equal(newOwner, (await GameContract.owner())[1] );
    });

});

