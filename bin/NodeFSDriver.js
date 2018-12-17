const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

module.exports = class NodeFSDriver {

  constructor() {}

  static readFileAsync(path, encoding = 'utf8') {
    return promisify(fs.readFile).call(null, path, encoding)
  }

  static writeDirectory(projectRelativePath) {
    return new Promise((resolve, reject) => {
      const fullPath = path.join(process.cwd(), projectRelativePath);
      fs.mkdir(fullPath, { recursive: true}, (err) => {
        if (err) {
          reject(err);
        }
        resolve(fullPath);
      });
    });
  }

  static writeFileAsync(path, data) {
    return promisify(fs.writeFile).call(null, path, data)
  }

};
