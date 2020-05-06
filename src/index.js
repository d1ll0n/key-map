const { bufferToHex, toBuffer } = require('ethereumjs-util');
const abi = require('./abi.json');

const networks = {
  1: '0xCd5167F5d5e156FDcEff85693EBe426F27D97775', // mainnet
  3: '0xbB880231E1406e5b6eAE2B75878739492a9b9CC2', // ropsten
}

class KeyMapClient {
  constructor(web3, address) {
    this.contract = new web3.eth.Contract(abi, address);
    this.ready = web3.eth.getAccounts().then(a => this.from = a[0]);
  }

  async init(web3) {
    await web3.eth.getAccounts().then(a => this.from = a[0]);
    if (!this.contract.options.address) {
      const networkID = await web3.eth.net.getId();
      const address = networks[networkID];
      if (!address) throw new Error(`Network [ID: ${networkID}] not supported -- please provide contract address in constructor.`)
      this.contract.options.address = address;
    }
  }

  async putKey(pubKey, opts) {
    await this.ready;
    opts = opts || { from: this.from }
    const prefixedHex = bufferToHex(toBuffer(pubKey));
    if (prefixedHex.length != 130) throw new Error(`Public key must be 64 bytes.`);
    return this.contract.methods.mapKey(
      `0x${prefixedHex.slice(2, 66)}`,
      `0x${prefixedHex.slice(66, 130)}`
    ).send(opts);
  }

  async getKey(address) {
    return this.contract.methods.getKey(address).call();
  }
}

module.exports = KeyMapClient;