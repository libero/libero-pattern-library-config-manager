const Color = require('color');
const deepIterator = require('deep-iterator').default;
const flatten = require('flat');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const writeFileAsync = promisify(fs.writeFile);

/**
 * Distributes specified config to appropriate layers (sass, js, templates)
 * @type {module.ConfigDistributor}
 */
module.exports = class ConfigDistributor {

  constructor() {
    this.paths = {
      out: {
        sassVariablesPath: '/generated/css/sass/variables',
        jsonFileName: '/generated/js/derivedConfig.json'
      }
    };
  }

  distribute(
    configPaths,
    configGenerator,
    fileWriter = writeFileAsync,
    directoryWriter = ConfigDistributor.writeDirectory,
    report = ConfigDistributor.report) {

    report('Distributing config...');

    return configGenerator.consolidate(configPaths)
      .then((config) => {
        return Promise.all(
          [
            this.distributeToSass(config.layerAllocations.sass, config.data, fileWriter, directoryWriter, report),
            this.distributeToJs(config.layerAllocations.js, config.data, fileWriter, directoryWriter, report),
          ]
        )
      })
      .catch(err => {
        console.error(err.message);
        process.exit(1);
      });
  }

  distributeToJs(allocations, data, fileWriter, directoryWriter, report) {
    return ConfigDistributor.writeFile(
      ConfigDistributor.processForJs(allocations, data),
      this.paths.out.jsonFileName,
      fileWriter,
      directoryWriter,
      report
    );
  }

  distributeToSass(allocations, data, fileWriter, directoryWriter, report) {

    const fileWritePromises = [];

    // Each allocation is written to a separate file
    allocations.forEach((allocation) => {
      const dataForAllocation = {};
      dataForAllocation[allocation] = data[allocation];
      const processedItemData = ConfigDistributor.processForSass(dataForAllocation);
      const outFileName = path.join(this.paths.out.sassVariablesPath, `_${allocation}.scss`);
      fileWritePromises.push(
        new Promise((resolve) => {
          resolve(ConfigDistributor.writeFile(
            processedItemData,
            outFileName,
            fileWriter,
            directoryWriter,
            report));
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

  static writeDirectory(path) {
    return new Promise((resolve, reject) => {
      fs.mkdir(path, { recursive: true}, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  static getProjectRootPath() {
    const currentPath = process.cwd();
    // TODO: improve, this is naive
    if (currentPath.match(/^.*\/libero-config\/bin.*$/)) {
      return path.resolve(path.join(currentPath, '../..'));
    }
      return currentPath;
  }

  static getDirectoryComponent(path) {
    return path.substring(0, path.lastIndexOf('/') + 1);
  }

  static getFilenameComponent(path) {
    return path.substring(path.lastIndexOf('/') + 1);
  }

  static report(message) {
    console.log(message);
  }

  static async writeFile(
    data,
    outPathFromProjectRoot,
    fileWriter,
    directoryWriter,
    reporter = ConfigDistributor.report
  ) {
    const projectRoot = ConfigDistributor.getProjectRootPath();
    const outDirectoryFromProjectRoot = ConfigDistributor.getDirectoryComponent(outPathFromProjectRoot);
    const fullDirectoryPath = path.join(projectRoot, outDirectoryFromProjectRoot);
    const filenameComponent = ConfigDistributor.getFilenameComponent(outPathFromProjectRoot);

    await directoryWriter(fullDirectoryPath);

    return fileWriter(path.join(fullDirectoryPath, filenameComponent), data)
      .then(() => {
        reporter(`Written config to ${path.join(outDirectoryFromProjectRoot, filenameComponent)}`);
      })
      .catch(err => { throw err });
  }

};
