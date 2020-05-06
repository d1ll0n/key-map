const Web3 = require('web3');
const ganache = require('ganache-core');
const { privateToPublic, pubToAddress, toBuffer, bufferToHex, toChecksumAddress } = require('ethereumjs-util');
const { expect } = require('chai');
const Client = require('../src/index');
const { bytecode, abi } = require('../build/standard.json');

const web3 = new Web3(ganache.provider());

const getData = () => {
  const { privateKey } = web3.eth.accounts.create()
  const pubKey = privateToPublic(toBuffer(privateKey));
  const address = toChecksumAddress(bufferToHex(pubToAddress(pubKey, true)));
  return { pubKey, address };
}

describe("KeyMap", async () => {
  describe('Test Contract', async () => {
    let contract;
    let accounts;
    let pubKey, address;

    before(async () => {
      accounts = await web3.eth.getAccounts();
      const _contract = new web3.eth.Contract(abi);
      contract = await _contract.deploy({ data: bytecode }).send({ from: accounts[0], gas: 6e5 });
      ({ pubKey, address } = getData());
    })

    it('Should return the correct address for a public key (bytes32[])', async () => {
      const derivedAddress = await contract.methods.mapKey(
        `0x${pubKey.slice(0, 32).toString('hex')}`,
        `0x${pubKey.slice(32, 64).toString('hex')}`
      ).call({ from: accounts[0], gas: 5e6 })
      expect(toChecksumAddress(derivedAddress)).to.eql(address)
    });
    
    it('Should return the correct address for a public key (bytes)', async () => {
      const derivedAddress = await contract.methods.mapKey(pubKey).call({ from: accounts[0], gas: 5e6 })
      expect(toChecksumAddress(derivedAddress)).to.eql(address)
    });

    it('Should store a key mapping', async () => {
      await contract.methods.mapKey(pubKey).send({ from: accounts[0], gas: 5e5 });
    });

    it('Should retrieve a public key', async () => {
      const retrievedPubKey = await contract.methods.getKey(address).call();
      expect(retrievedPubKey).to.eql(bufferToHex(pubKey));
    });
  })

  describe('Test Client', async () => {
    let client;
    let accounts
    let pubKey, address;

    before(async () => {
      accounts = await web3.eth.getAccounts();
      const _contract = new web3.eth.Contract(abi);
      const contract = await _contract.deploy({ data: bytecode }).send({ from: accounts[0], gas: 6e5 });
      client = new Client(web3, contract.options.address);
      ({ pubKey, address } = getData());
    });

    it('Should store a key mapping', async () => {
      await client.putKey(pubKey);
    });

    it('Should retrieve a pubkey', async () => {
      const retrievedPubKey = await client.getKey(address);
      expect(retrievedPubKey).to.eql(bufferToHex(pubKey));
    })
  })
})