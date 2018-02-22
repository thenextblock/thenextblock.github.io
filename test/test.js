let TheNextBlock = artifacts.require("TheNextBlock");
const { should, EVMThrow, getParamFromTxEvent } = require('./helpers');


contract('TheNextBlock', function (accounts) {

    let GiftoContract; 
    let coinContractInstance;
    
    const owner = accounts[0];
    const player_1 = accounts[1];
    const player_2 = accounts[2];
    const player_3 = accounts[3];
    
    beforeEach('Setup contract for each test', async function () {
        GameContract = await TheNextBlock.new();
    });

    it('Just Fake Test', async function () {
        assert.equal(1,1);
    });

});

