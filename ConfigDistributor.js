const Color = require('color');
const deepIterator = require('deep-iterator').default;
const flatten = require('flat');

/**
 * Distributes specified config to appropriate layers (sass, js, templates)
 * @type {module.ConfigDistributor}
 */
module.exports = class ConfigDistributor {

  constructor(fileSystem, paths, reporter) {
    this.fileSystem = fileSystem;
    this.paths = paths;
    this.reporter = reporter || this.defaultReporter;
  }

  distribute(configGenerator) {
    this.reporter.call(null, 'Distributing config...');
    return configGenerator.consolidate(this.paths.config)
      .then((config) => {
        return Promise.all(
          [
            this.distributeToJs(config.layerAllocations.js, config.data),
            this.distributeToSass(config.layerAllocations.sass, config.data),
          ]
        )
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  }

  distributeToJs(allocations, data) {
    if (!allocations.length) {
      return Promise.resolve();
    }
    const processedData = ConfigDistributor.processForJs(allocations, data);
    const relativePath = this.paths.output.jsonFileName;
    const directory =  `${relativePath.substring(0, relativePath.lastIndexOf('/') + 1)}`;
    const filename = relativePath.substring(relativePath.lastIndexOf('/') + 1);
    return this.fileSystem.writeFile(processedData, directory, filename, this.reporter);
  }

  distributeToSass(allocations, data) {
    const directory = this.paths.output.sassVariablesPath;
    const fileWritePromises = [];

    allocations.forEach((allocation) => {
      const dataForAllocation = {};
      dataForAllocation[allocation] = data[allocation];

      const sassMap = ConfigDistributor.processForSassMap(dataForAllocation);
      const sassMapFileName = `_${allocation}.scss`;
      fileWritePromises.push(
        new Promise((resolve) => {
          resolve(this.fileSystem.writeFile(sassMap, directory, sassMapFileName, this.reporter));
        }),
      );

      const cssCustomProps = ConfigDistributor.processForCssCustomProps(dataForAllocation);
      const cssCustomPropFileName = `custom-properties--${allocation}.scss`;
      fileWritePromises.push(
          new Promise((resolve) => {
            resolve(this.fileSystem.writeFile(cssCustomProps, directory, cssCustomPropFileName, this.reporter));
          }),
      );
    });

    return Promise.all(fileWritePromises).catch(err => { throw err; } );

  }

  static processColors(data) {
    const deepData = deepIterator(data);
    for (let {parent, key, value} of deepData) {
      if (value instanceof Color) {
        parent[key] = value.rgb().string();
      }
    }
    return data;
  }

  static processForJs(allocations, dataIn) {
    const data = ConfigDistributor.processColors(dataIn);
    const processed = {};
    allocations.forEach((allocation) => {
      processed[allocation] = data[allocation];
    });
    return JSON.stringify(processed);
  }

  static processForSassMap(data) {

    const stripPropertyNameRoots = (items, nameRoot) => {
      const stripNameRoot = (str) => {
        if (str.indexOf(nameRoot) > -1) {
          return str.substring(str.indexOf('-') + 1);
        }
        return str;
      };
      return [
        stripNameRoot(items[0]),
        items[1]
      ];
    };

    const buildProperties = (carry, pair) => {
      let [key, value] = pair;
      if (typeof value === 'string' && value.indexOf('rgb') !== 0) {
        value = `#{${value}}`
      }

      if (key.endsWith('_in_px')) {
        key = key.substring(0, key.length - 6);
        value = `${value}px`;
      }

      return `${carry}  ${key}: ${value},\n`;
    };

    const sassPropertyNameRoot = Object.keys(data)[0];
    const processedProperties = Object.entries(flatten(data, {delimiter: '-'})).map((items) => {
      return stripPropertyNameRoots(items, sassPropertyNameRoot)
    }).reduce(buildProperties, '');

    return `\$${sassPropertyNameRoot}: (\n${processedProperties});\n`;

  }

  static processForCssCustomProps(data) {
    const buildProperties = (carry, pair) => {
      let [key, value] = pair;

      if (key.endsWith('_in_px')) {
        key = key.substring(0, key.length - 6);
        value = `${value}px`;
      }

      return `${carry}    --${key}: ${value};\n`;
    };

    const start = '@at-root {\n'
                  + '  :root {\n';
    const end = '  }\n}\n';
    const processedProperties = Object.entries(flatten(data, {delimiter: '-'}))
                                      .reduce(buildProperties, '');
    return `${start}${processedProperties}${end}`;
  }

  defaultReporter(message) {
    console.log(message);
  }

};
