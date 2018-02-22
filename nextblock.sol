pragma solidity ^0.4.19;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract TheNextBlock {

    using SafeMath for uint256;
    using SafeMath for uint8;

    event BetReceived(address sender, uint256 value, address betOnMiner, address miner, uint256 balance);
    event GivingBackTheRest(address sender, uint256 value, uint256 rest);
    event Jackpot(address winner);
    
    struct Owner {
        uint256 balance;
        address addr;
    }
    
    
    Owner public owner;
    uint256 public allowedBetAmount = 10000000000000000; // 0.01 ETH
    uint8 public requiredPoints = 5;
    uint8 public ownerProfitPercent = 10;
    uint8 public prizePoolPercent = 90;
    uint256 public prizePool = 0;
    struct Player {
        uint256 balance;
        uint256[] wonBlocks;
        uint256 lastBlock;
    }
    
    mapping(address => Player) public playersStorage;
    mapping(address => uint8) public playersPoints;
    
    modifier onlyOwner() {
        require(msg.sender == owner.addr);
        _;
    }

    modifier notLess() {
        require(msg.value >= allowedBetAmount);
        _;
    }

    modifier notMore() {
        if(msg.value > allowedBetAmount) {

            GivingBackTheRest(msg.sender, msg.value,  SafeMath.sub(msg.value, allowedBetAmount));
            msg.sender.transfer( SafeMath.sub(msg.value, allowedBetAmount) );
        }
        _;
    }
    
    modifier onlyOnce() {
        Player storage player = playersStorage[msg.sender];
        require(player.lastBlock != block.number);
        player.lastBlock = block.number;
        _;
    }
    
    function safeGetPercent(uint256 amount, uint8 percent) private pure returns(uint256) {
        return SafeMath.mul( SafeMath.div( SafeMath.sub(amount, amount%100), 100), percent);
    }
    
    function TheNextBlock() public {
        owner.addr = msg.sender;
    }

    function () public payable { }

    function placeBet(address _miner) 
        public
        payable
        notLess
        notMore
        onlyOnce {
            
            BetReceived(msg.sender, msg.value, _miner, block.coinbase,  this.balance);

            owner.balance.add(safeGetPercent(allowedBetAmount, ownerProfitPercent));
            prizePool.add(safeGetPercent(allowedBetAmount, prizePoolPercent));

            if(_miner == block.coinbase) {
                
                playersPoints[msg.sender].add(1);

                if(playersPoints[msg.sender] == requiredPoints) {
                    Jackpot(msg.sender);
                    playersStorage[msg.sender].wonBlocks.push(block.number);

                    if(prizePool >= allowedBetAmount) {
                        playersStorage[msg.sender].balance.add(prizePool);
                        prizePool = 0;
                        playersPoints[msg.sender] = 0;
                    } else {
                        playersPoints[msg.sender].sub(1); // Unlucky player, he had a chanse to won this prize pool, but we cant manage transaction ordering :( 
                    }
                }
            } else {
                playersPoints[msg.sender] = 0;
            }
    }

    function getPlayersBalance(address playerAddr) public view returns(uint256) {
        return playersStorage[playerAddr].balance;
    }
    
    function getPlayersGuessCount(address playerAddr) public view returns(uint8) {
        return playersPoints[playerAddr];
    }
    
    function getPlayersWonBlocks(address playerAddr) public view returns(uint256[]) {
        return playersStorage[playerAddr].wonBlocks;
    }
    
    function getMyBalance() public view returns(uint256) {
        return playersStorage[msg.sender].balance;
    }
    
    function getMyGuessCount() public view returns(uint8) {
        return playersPoints[msg.sender];
    }
    
    function getMyWonBlocks() public view returns(uint256[]) {
        return playersStorage[msg.sender].wonBlocks;
    }
    
    function withdrawMyFunds() public {
        uint256 balance = playersStorage[msg.sender].balance;
        if(balance != 0) {
            playersStorage[msg.sender].balance = 0;
            msg.sender.transfer(balance);
        }
    }
    
    function withdrawOwnersFunds() public onlyOwner {
        owner.addr.transfer(owner.balance);
        owner.balance = 0;
    }
    
    function getOwnersBalance() public view returns(uint256) {
        return owner.balance;
    }
    
    function getPrizePool() public view returns(uint256) {
        return prizePool;
    }
    
    function getBalance() public view returns(uint256) {
        return this.balance;
    }
        
    function changeOwner(address newOwner) public onlyOwner {
        owner.addr = newOwner;
    }

    function changeAllowedBetAmount(uint256 newAmount) public onlyOwner {
        allowedBetAmount = newAmount;
    }

    function changeRequiredPoints(uint8 newRequiredPoints) public onlyOwner {
        requiredPoints = newRequiredPoints;
    }

}