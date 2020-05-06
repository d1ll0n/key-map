const fs = require('fs');
const path = require('path');
const solc = require('easy-solc');

const contractPath = path.join(__dirname, '..', 'contracts', 'KeyMap.sol');
(async () => {
  const standard = await solc('KeyMap', fs.readFileSync(contractPath, 'utf8'))

  const buildPath = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildPath)) fs.mkdirSync(buildPath);
  fs.writeFileSync(path.join(buildPath, 'standard.json'), JSON.stringify(standard, null, 2));
  
  const abiPath = path.join(__dirname, '..', 'src', 'abi.json');
  fs.writeFileSync(abiPath, JSON.stringify(standard.abi, null, 2));
})();