const ConfigGenerator = require('./ConfigConsolidator');
const ConfigDistributor = require('./ConfigDistributor');
const FileSystem = require('./FileSystem');
const NodeFSDriver = require('./NodeFSDriver');
const path = require('path');

const fileSystem = new FileSystem(new NodeFSDriver());

const configSpecFilepath = path.join(__dirname, 'configSpec.json');

function useConfigSpec(rawData) {
  const data = JSON.parse((rawData));
  const paths = data.paths;

  // Combine all configs specified in configPaths into one config
  const configGenerator = new ConfigGenerator(paths.config);

  // Distribute defined parts of the config to specified technology layers
  const configDistributor = new ConfigDistributor(fileSystem, paths);
  return configDistributor.distribute(configGenerator)
    .catch((err) => { throw err; });
}

function distribute() {

  /*
   * TODO: try out catering for the following command line configuration:
   *  --configPath=[file-path] --mode=merge|replace --outputPaths={sass:file-path, js:file-path, template:file-path}
   *    N.B. merge will need a default
   *
   */

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

