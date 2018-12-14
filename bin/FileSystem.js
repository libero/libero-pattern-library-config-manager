const path = require('path');

module.exports = class FileSystem {

  constructor(driver) {
    this.driver = driver;
  }

  async writeFile(data, directory, filename, reporter = console.log) {
    await this.driver.writeDirectory(directory);

    const fullPath = path.join(directory, filename);
    return this.driver.writeFileAsync(fullPath, data)
      .then(() => {
        reporter(`Written config to ${fullPath}`);
      })
      .catch(err => { throw err });
  }

  readFile(path, encoding) {
    return this.driver.readFileAsync(path, encoding)
      .catch(err => { throw err });
  }

};
