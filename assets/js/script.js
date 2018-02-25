/* global $ */
/* global Vue */
/* global web3 */
/* global alertify */
/* global Web31 */
/* global Web3 */
var app;
$(document).ready(function() {
    app = new Vue({
        el: "#app",
        data: {
            etherscanDomain: "etherscan.io",
            isAppVisible: false,
            isInfoDialogVisible: true,
            bets: [],
            web31: null,
            //web31Addr: "wss://node1.thenextblock.com/ws/",
            web31Addr: "wss://qubit.ge/ws/",
            web31Contract: null,
            contract: {
                addr: "0x081b04164607087b5301bbb95f67ad2630e15786"
            },
            metamask: {
                address: "",
                balance: 0
            },
            blocks: [],
            minerNames: {},
            blockCount: 0,
            blockCountOptions: [],
            player: {
                balance: 0,
                points: 0,
                pot: 0,
                allowedBetAmount: 0
            }
        },
        watch: {
            minerNames: function(val) {
                return val;
            }
        },
        computed: {
            isMainnet: function() {
                return this.metamask.web3 && this.metamask.web3.version.network == "1";
            },
            hasWeb3: function() {
                return typeof web3 !== "undefined" && web3.currentProvider;
            },
            hasMetamask: function() {
                return web3.currentProvider.isMetaMask && web3.currentProvider.isConnected();
            },
            isMetaMaskLocked: function() {
                return this.metamask.web3 && !this.metamask.web3.eth.accounts.length;
            },
            isButtonDisabled: function() {
                return !this.hasWeb3 || !this.hasMetamask || this.isMetaMaskLocked;
            }
        },
        methods: {
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
                _this.blocks.unshift(block);
                _this.sortBlocks();
                if (_this.blocks.length > _this.blockCount) {
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
                        _this.web31.eth.getBlock(value - i).then(_this.addBlock).error(function(err) {
                            alertify.error("Can't get block info! " + err)
                        });
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
                            _this.metamask.balance = _this.formatFloat(_this.metamask.web3.fromWei(balance, "ether").toFixed());
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
                _this.contract.cls.getPrizePool(function(err, val) {
                    if (!err) _this.player.pot = _this.formatFloat(_this.web31.utils.fromWei(val.toString(), "ether"));
                });
                _this.contract.cls.getMyBalance(function(err, val) {
                    if (!err) _this.player.balance = _this.formatFloat(_this.web31.utils.fromWei(val.toString(), "ether"));
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
                console.log(miner);
                _this.contract.cls.placeBet(miner, {
                    from: _this.metamask.web3.eth.accounts[0],
                    value: _this.player.allowedBetAmount,
                    gas: 4000000,
                    gasPrice: 35000000000
                }, function(err, result) {
                    console.log(arguments);
                    if (err) {
                        alertify.error("Bet Rejected!");
                    }
                });
            },
            formatFloat: function(number, factor) {
                return parseFloat(number).toFixed(factor || 5);
            },
            getEtherScanAddressLink: function(address) {
                return "https://{{domain}}/address/{{address}}".replace("{{address}}", address).replace("{{domain}}", this.etherscanDomain);
            },
            getEtherScanBlockLink: function(blockNumber) {
                return "https://{{domain}}/block/{{blockNumber}}".replace("{{blockNumber}}", blockNumber).replace("{{domain}}", this.etherscanDomain);
            },
            shortenStr: function(str = '', topBottomRem = 5) {
                return str.substr(0, topBottomRem) + '...' + str.substr(str.length - topBottomRem, topBottomRem);
            },
            onNewBlockMined: function(err, result) {
                var _this = this;
                if (!_this.isButtonDisabled) {
                    _this.loadAccount();
                    _this.loadContractData();
                }
                if (err) {
                    alertify.error("Error: Can't receive block event!");
                } else {
                    alertify.success('New Block Mined: ' + result.number);
                    _this.addBlock(result);
                    var newRow = $('table tbody tr:first');
                    newRow.addClass('is-selected');
                    setTimeout(function() {
                        newRow.removeClass('is-selected');
                    }, 3000);
                }
            },
            onBetReceived: function(err, result) {
                if (err) {
                    alertify.error("Can't receive bet event!");
                    return;
                }
                var _this = this;
                _this.bets.unshift(result);
            },
            onJackpot: function(err, result) {
                if (err) {
                    alertify.error("Can't receive jackpot event!");
                    return;
                }
                var _this = this;
                alertify.success('Someone won jackpot!');
            },
            withdrawBalance: function() {
                var _this = this;
                if (_this.player.balance <= 0) {
                    alertify.error("Your balance is empty!");
                    return;
                }

            },
            compareAddr: function(addr1, addr2) {
                return addr1.toLowerCase() == addr2.toLowerCase();
            }
        },
        created: function() {
            var _this = this;
            _this.web31 = new Web31(new Web31.providers.WebsocketProvider(_this.web31Addr));
            $.getJSON("/build/contracts/TheNextBlock.json", function(data) {
                _this.contract.abi = data.abi;
                if (_this.hasWeb3) {
                    _this.metamask.web3 = new Web3(web3.currentProvider);
                    if (!_this.hasMetamask) {
                        alertify.alert("Error", "Metamask is not connected.", function() {
                            alertify.error("Check Metamask and refresh website!");
                        });
                    } else if (_this.isMetaMaskLocked) {
                        alertify.alert("Error", "Metamask is locked.", function() {
                            alertify.error("Unlock Metamask and refresh website.");
                        });
                    } else {
                        _this.contract.cls = _this.metamask.web3.eth.contract(_this.contract.abi).at(_this.contract.addr);
                        _this.loadAccount();
                        _this.loadContractData();
                    }
                } else {
                    alertify.alert('Error', 'Metamask Extension is not installed. </br> Download Metamask <a target="_blank" href="https://metamask.io/">here</a>.', function() {
                        alertify.error('Install Metamask Extension.');
                    });
                }
                _this.loadBlockCountOptions(10, 5);
                _this.loadBlocks();
                _this.web31.eth.subscribe('newBlockHeaders', _this.onNewBlockMined);
                _this.web31Contract = new _this.web31.eth.Contract(_this.contract.abi, _this.contract.addr);
                _this.web31Contract.events.BetReceived({}, _this.onBetReceived);
                _this.web31Contract.events.Jackpot({}, _this.onJackpot);
                _this.isAppVisible = true;
                $("body").show();
            }).fail(function() {
                alertify.error("Can't load contract abi.");
            });
            /*$.getJSON('/assets/js/miners.json', function(data) {
                for(var k in data) _this.$set(_this.minerNames, k, data[k]);
                //_this.minerNames = data;
                _this.isAppVisible = true;
            }).fail(function() {
                alertify.error('Canot load miner names!');
            });*/
        }
    });
});