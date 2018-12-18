module.exports = class FileSystem {

  constructor(driver, reporter = console.log) {
    this.driver = driver;
    this.reporter = reporter;
  }

  async writeFile(data, projectRelativeDirectory, filename) {
    const directory = await this.driver.writeDirectory(projectRelativeDirectory);
    //  Not using path.join as want to keep this layer separate from the file system driver
    const fullPath = directory + filename;

    return this.driver.writeFileAsync(fullPath, data)
      .then(() => {
        this.reporter(`Written config to ${fullPath}`);
      })
      .catch(err => { throw err });
  }

  readFile(path, encoding) {
    return this.driver.readFileAsync(path, encoding)
      .catch(err => { throw err });
  }

};
