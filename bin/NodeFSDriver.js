const fs = require('fs');
const {promisify} = require('util');

module.exports = class NodeFSDriver {

  constructor() {}

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

  static writeFileAsync(path, data) {
    return promisify(promisify(fs.writeFile)).call(null, path, data)
  }

};
