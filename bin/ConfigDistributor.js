const Color = require('color');
const deepIterator = require('deep-iterator').default;
const flatten = require('flat');

/**
 * Distributes specified config to appropriate layers (sass, js, templates)
 * @type {module.ConfigDistributor}
 */
module.exports = class ConfigDistributor {

  constructor(fileSystem) {
    this.paths = {
      out: {
        sassVariablesPath: '/generated/css/sass/variables/',
        jsonFileName: '/generated/js/derivedConfig.json'
      }
    };
    this.fileSystem = fileSystem;
  }

  distribute(
    configPaths,
    configGenerator,
    reporter = ConfigDistributor.reporter) {

    reporter('Distributing config...');

    return configGenerator.consolidate(configPaths)
      .then((config) => {
        return Promise.all(
          [
            this.distributeToJs(config.layerAllocations.js, config.data, reporter),
            this.distributeToSass(config.layerAllocations.sass, config.data, reporter),
          ]
        )
      })
      .catch(err => {
        console.error(err.message);
        process.exit(1);
      });
  }

  distributeToJs(allocations, data, reporter) {
    const processedData = ConfigDistributor.processForJs(allocations, data);
    const relativePath = this.paths.out.jsonFileName;
    const directory =  `${relativePath.substring(0, relativePath.lastIndexOf('/') + 1)}`;
    const filename = relativePath.substring(relativePath.lastIndexOf('/') + 1);
    return this.fileSystem.writeFile(processedData, directory, filename, reporter);
  }

  distributeToSass(allocations, data, reporter) {
    const relativePath = this.paths.out.sassVariablesPath;
    const directory =  `${relativePath.substring(0, relativePath.lastIndexOf('/') + 1)}`;
    const fileWritePromises = [];

    allocations.forEach((allocation) => {
      const dataForAllocation = {};
      dataForAllocation[allocation] = data[allocation];
      const processedData = ConfigDistributor.processForSass(dataForAllocation);
      const fileName = `_${allocation}.scss`;
      fileWritePromises.push(
        new Promise((resolve) => {
          resolve(this.fileSystem.writeFile(processedData, directory, fileName, reporter));
        })
      );
    });

    return Promise.all(fileWritePromises).catch(err => { throw err; } );

  }

  static processForJs(allocations, data) {
    const processed = {};
    allocations.forEach((allocation) => {
      processed[allocation] = data[allocation];
    });
    return JSON.stringify(processed);
  }

  static processForSass(data) {
    const deepData = deepIterator(data);
    for (let {parent, key, value} of deepData) {
      if (value instanceof Color) {
        parent[key] = value.rgb().string();
      }
    }

    return Object.entries(flatten(data, {delimiter: '-'}))
      .reduce((carry, pair) => {
        const [key, value] = pair;
        return `${carry}$${key}: ${value};\n`;
      }, '');
  }

  static reporter(message) {
    console.log(message);
  }

};
