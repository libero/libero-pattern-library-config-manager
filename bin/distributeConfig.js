const ConfigGenerator = require('./ConfigConsolidator');
const ConfigDistributor = require('./ConfigDistributor');
const FileSystem = require('./FileSystem');
const NodeFSDriver = require('./NodeFSDriver');
const path = require('path');

const fileSystem = new FileSystem(NodeFSDriver);

// const configSpecFilepath = path.join(/*path.resolve(__dirname, '../')*/__dirname, 'configRegister.json');
const configSpecFilepath = path.join(__dirname, 'configRegister.json');

function useConfigSpec(rawData) {
  const data = JSON.parse((rawData));
  const configPaths = data.configPaths;

  // Combine all configs specified in configPaths into one config
  const configGenerator = new ConfigGenerator(configPaths);

  // Distribute defined parts of the config to specified technology layers
  const configDistributor = new ConfigDistributor(fileSystem);
  return configDistributor.distribute(configPaths, configGenerator)
    .catch((err) => { throw err; });
}

function distribute() {
  return fileSystem.readFile(configSpecFilepath)
    .then(useConfigSpec)
    .catch((err) => {
      throw err;
    });
}

module.exports = distribute;

if (require.main === module) {
  distribute();
}

