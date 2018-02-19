var app;
$(document).ready(function() {
    app = new Vue({
        el: '#app',
        data: {
			isAppVisible: false,
            isInfoDialogVisible: true,
			bets: [],
			web31: null,
			web31Addr: "ws://51.15.64.44:8546",
            contract: {
                addr: "0x6712F7e812499bfae13378eCfA7D27871AD406D2"
            },
            metamask: {
                address: "",
                balance: 0,
                lastBlockNumber: 0
            },
            blocks: [],
            minerNames: {
                "0xea674fdde714fd979de3edf0f56aa9716b898ec8": "Ethermine",
                "0x829bd824b016326a401d083b33d092293333a830": "f2pool_2",
                "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c": "ethfans.org_2",
                "0xb2930b35844a230f00e51431acae96fe543a0347": "miningpoolhub_1",
                "0x2a65aca4d5fc5b5c859090a6c34d164135398226": "DwarfPool1",
                "0xf3b9d2c81f2b24b0fa0acaaa865b7d9ced5fc2fb": "bitclubpool",
                "0x4bb96091ee9d802ed039c4d1a5f6216f90f81b01": "Ethpool_2",
                "0x6a7a43be33ba930fe58f34e07d0ad6ba7adb9b1f": "Coinotron_2",
                "0x9435d50503aee35c8757ae4933f7a0ab56597805": "waterhole"
            },
            blockCount: 0,
            blockCountOptions: [],
            player: {
                balance: 0,
                points: 0,
                pot: 0
            }
        },
        methods: {
            hasWeb3: function() {
                return typeof web3 !== 'undefined' && web3.currentProvider;
            },
            hasMetamask: function() {
                return web3.currentProvider.isMetaMask && web3.currentProvider.isConnected();
            },
            isMetaMaskLocked: function() {
                return !this.metamask.web3.eth.accounts.length;
            },
			sortBlocks: function() {
                var _this = this;
                _this.blocks = _this.blocks.sort(function(a, b) {
                    if (a.number < b.number) {
                        return 1;
                    }
                    if (a.number > b.number) {
                        return -1;
                    }
                    return 0;
                });
            },
            addBlock: function(block) {
                var _this = this;
				_this.blocks.push(block);
				_this.sortBlocks();
				if(_this.blocks.length > _this.blockCount){
					_this.blocks.splice(-1, 1);
				}
            },
            loadBlocks: function(bc) {
                var _this = this;
                _this.blocks = [];
                bc = bc || _this.blockCount;
                _this.web31.eth.getBlockNumber(function(err, value) {
                    if (err) {
						alertify.error("Can't get last block number!");
						return;
					};
                    _this.metamask.lastBlockNumber = value;
                    for (var i = 0; i < bc; i++)
                        _this.web31.eth.getBlock(value - i).then(_this.addBlock).error(function(err){ alertify.error("Can't get block info! " + err) });
                });
            },
            getMinersBlockCount: function(miner) {
                var _this = this;
                var count = 0;
                _this.blocks.forEach(function(el) {
                    if (el.miner == miner)
                        count++;
                });
                return count;
            },
            loadAccount: function() {
                var _this = this;
                _this.metamask.web3.eth.getAccounts(function(err, accounts) {
                    if (err) return;
                    _this.metamask.address = accounts[0];
                    _this.metamask.web3.eth.getBalance(_this.metamask.address, function(err, balance) {
                        if (!err)
                            _this.metamask.balance = _this.formatFloat(_this.metamask.web3.fromWei(balance, 'ether').toFixed());
                    });
                });
            },
            loadBlockCountOptions: function(factor, rep) {
                var _this = this;
                _this.blockCountOptions = [];
                for (var i = 1; i <= rep; i++)
                    _this.blockCountOptions.push(i * factor);
                _this.blockCount = _this.blockCountOptions[0];
            },
            loadContractData: function() {
                var _this = this;
                _this.contract.cls.getPot(function(err, val) {
                    if (!err) _this.player.pot = _this.formatFloat(_this.metamask.web3.fromWei(val, 'ether'));
                });
                _this.contract.cls.getMyBalance(function(err, val) {
                    if (!err) _this.player.balance = val.toString();
                });
                _this.contract.cls.getMyGuessCount(function(err, val) {
                    if (!err) _this.player.points = val.toString();
                });
                _this.contract.cls.allowedBetAmount(function(err, val) {
                    if (!err) _this.player.allowedBetAmount = val.toString();
                });
            },
            placeBet: function(miner) {
                var _this = this;
                _this.contract.cls.placeBet(miner, {
                    from: _this.metamask.web3.eth.accounts[0],
                    value: _this.player.allowedBetAmount,
                    gas: 4000000,
                    gasPrice: 35000000000
                }, function(){});
            },
            formatFloat: function(number, factor) {
                //return parseFloat(Math.round(number * 100) / 100).toFixed(5);
                return parseFloat(number).toFixed(factor || 5);
            },
            getEtherScanAddressLink: function(address) {
                return "https://etherscan.io/address/{{address}}".replace('{{address}}', address);
            },
            getEtherScanBlockLink: function(blockNumber) {
                return "https://etherscan.io/block/{{blockNumber}}".replace('{{blockNumber}}', blockNumber);
            },
            shortenStr: function(str = "", topBottomRem = 5) {
                return str.substr(0, topBottomRem) + '...' + str.substr(str.length - topBottomRem, topBottomRem);
            },
            onNewBlockMined: function(err, result) {
                var _this = this;
                _this.loadAccount();
                _this.loadContractData();
                if (err) {
                    alertify.error("Error: Can't receive block event");
                } else {
					alertify.success("New Block Mined: " + result.number);
					_this.addBlock(result);
					var newRow = $('table tbody tr:first');
					newRow.addClass('is-selected');
					setTimeout(function(){ newRow.removeClass('is-selected'); }, 3000);
                }
            },
            onBetReceived: function(err, result) {
                var _this = this;
				console.log("bet received", arguments);
            },
			withdrawBalance: function() {
				var _this = this;
				if(_this.player.balance <= 0){
					alertify.error("Your balance is empty!");
					return;
				}
			}
        },
        created: function() {
            var _this = this;
			$("body").show();
            if (!_this.hasWeb3()) {
                alertify.alert('Error', 'Metamask Extension is not installed. </br> Install Metamask <a target="_blank" href="https://metamask.io/">here</a> and refresh website.', function() {
                    alertify.error('Install Metamask Extension.');
                });
                return;
            }
            if (!_this.hasMetamask()) {
                alertify.alert('Error', "Your metamask is not connected.", function() {});
                return;
            }
			_this.metamask.web3 = new Web3(web3.currentProvider);
			_this.web31 = new Web31( new Web31.providers.WebsocketProvider(_this.web31Addr));
            if (_this.isMetaMaskLocked()) {
                alertify.alert('Error', "Metamask is locked.", function() {
                    alertify.error('Unlock Metamask.');
                });
                return;
            }
            _this.contract.abi = [{
                    "constant": true,
                    "inputs": [],
                    "name": "getBalance",
                    "outputs": [{
                        "name": "",
                        "type": "uint256"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": false,
                    "inputs": [{
                        "name": "_miner",
                        "type": "address"
                    }],
                    "name": "placeBet",
                    "outputs": [],
                    "payable": true,
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "isBetEnabled",
                    "outputs": [{
                        "name": "",
                        "type": "bool"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "getPot",
                    "outputs": [{
                        "name": "",
                        "type": "uint256"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": false,
                    "inputs": [],
                    "name": "withdrawMyFunds",
                    "outputs": [],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "getMyBalance",
                    "outputs": [{
                        "name": "",
                        "type": "uint256"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": false,
                    "inputs": [],
                    "name": "withdrawOwnersFunds",
                    "outputs": [],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "allowedBetAmount",
                    "outputs": [{
                        "name": "",
                        "type": "uint256"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "getMyGuessCount",
                    "outputs": [{
                        "name": "",
                        "type": "uint8"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [{
                        "name": "playerAddr",
                        "type": "address"
                    }],
                    "name": "getPlayersGuessCount",
                    "outputs": [{
                        "name": "",
                        "type": "uint8"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [{
                        "name": "playerAddr",
                        "type": "address"
                    }],
                    "name": "getPlayersWonBlocks",
                    "outputs": [{
                        "name": "",
                        "type": "uint256[]"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "requiredGuessCount",
                    "outputs": [{
                        "name": "",
                        "type": "uint8"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "jackpotPercent",
                    "outputs": [{
                        "name": "",
                        "type": "uint8"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "ownerProfitPercent",
                    "outputs": [{
                        "name": "",
                        "type": "uint8"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "getMyWonBlocks",
                    "outputs": [{
                        "name": "",
                        "type": "uint256[]"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [{
                        "name": "playerAddr",
                        "type": "address"
                    }],
                    "name": "getPlayersBalance",
                    "outputs": [{
                        "name": "",
                        "type": "uint256"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "getOwnersBalance",
                    "outputs": [{
                        "name": "",
                        "type": "uint256"
                    }],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "payable": true,
                    "stateMutability": "payable",
                    "type": "fallback"
                },
                {
                    "anonymous": false,
                    "inputs": [{
                            "indexed": false,
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "name": "value",
                            "type": "uint256"
                        },
                        {
                            "indexed": false,
                            "name": "betOnMiner",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "name": "miner",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "name": "balance",
                            "type": "uint256"
                        }
                    ],
                    "name": "BetReceived",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [{
                            "indexed": false,
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "name": "value",
                            "type": "uint256"
                        },
                        {
                            "indexed": false,
                            "name": "rest",
                            "type": "uint256"
                        }
                    ],
                    "name": "GivingBackTheRest",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [{
                        "indexed": false,
                        "name": "winner",
                        "type": "address"
                    }],
                    "name": "Jackpot",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [{
                        "indexed": false,
                        "name": "value",
                        "type": "string"
                    }],
                    "name": "LogStr",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [{
                        "indexed": false,
                        "name": "value",
                        "type": "uint256"
                    }],
                    "name": "LogUint",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [{
                        "indexed": false,
                        "name": "value",
                        "type": "address"
                    }],
                    "name": "LogAddress",
                    "type": "event"
                }
            ];

            _this.contract.cls = _this.metamask.web3.eth.contract(_this.contract.abi).at(_this.contract.addr);
            _this.loadBlockCountOptions(10, 5);
            _this.loadAccount();
            _this.loadBlocks();
            _this.loadContractData();
            _this.web31.eth.subscribe('newBlockHeaders', _this.onNewBlockMined);
			_this.isAppVisible = true;
            /*_this.filters.betReceived = _this.contract.cls.BetReceived();
            _this.filters.betReceived.watch(_this.onBetReceived);*/
        }
    });
});