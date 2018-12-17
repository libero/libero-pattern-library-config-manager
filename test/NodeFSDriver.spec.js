const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const NodeFSDriver = require('../bin/NodeFSDriver')

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('NodeFSDriver class', () => {

  let invalidName;
  let validName;

  beforeEach(() => {
    invalidName = (function () {
      const parts = new Array(300);
      parts.fill('a');
      return parts.join('');
    }());

    validName = path.join(__dirname, '/tmp');
  });

  describe('using the readFileAsync static method', () => {

    context('when there is an error creating the file', () => {

      it('returns a promise that will be rejected', () => {
        return expect(NodeFSDriver.readFileAsync('/i/do/not/exist.txt')).to.be.rejected;
      });

    });

    context('when there is no error creating the file', () => {

      let expectedContent;
      let filePath;

      beforeEach(() => {
        expectedContent = 'i am therefore i think\n';
        filePath = path.join(process.cwd(), '/test/fixtures/simplePresence.txt');
      });

      it('correctly reads a utf8 encoded file', () => {
        return expect(NodeFSDriver.readFileAsync(filePath, 'utf8')).to.eventually.equal(expectedContent);

      });

    });

  });

  describe('using the writeDirectory static method', () => {

    context('when there is an error creating the directory', () => {

      it('returns a promise that will be rejected', () => {
        return expect(NodeFSDriver.writeDirectory(invalidName)).to.be.rejected;
      });

      it('the directory is not created', () => {
        return NodeFSDriver.writeDirectory(invalidName).catch(() => {
          return expect(fs.existsSync(invalidName)).to.be.false;
        });
      });

    });

    context('when there is no error creating the directory', () => {

      let validRelativeDirName;

      beforeEach(() => {
        validRelativeDirName = './tmp/';
        if (fs.existsSync(validRelativeDirName)) {
          fs.rmdirSync(validRelativeDirName);
        }
        expect(fs.existsSync(validRelativeDirName)).to.be.false;
      });

      afterEach(() => {
        if (fs.existsSync(validRelativeDirName)) {
          fs.rmdirSync(validRelativeDirName);
        }
      });

      it('writes the directory', () => {
        return NodeFSDriver.writeDirectory(validRelativeDirName).then(() => {
          return expect(fs.existsSync(validRelativeDirName)).to.be.true;
        });
      });

      it('returns a promise that resolves to the path of the written directory', () => {
        const expectedPathWritten = path.join(process.cwd(), validRelativeDirName);
        return NodeFSDriver.writeDirectory(validRelativeDirName).then((pathWritten) => {
          return expect(pathWritten).to.equal(expectedPathWritten);
        });
      });

    });

  });

  describe('using writeFileAsync static method', () => {

    let data;

    beforeEach(() => {
      data = 'some data';
    });

    context('when there is an error creating the file', () => {

      it('returns a promise that will be rejected', () => {
        return expect(NodeFSDriver.writeFileAsync(invalidName, data)).to.be.rejected;
      });

      it('the file is not created', () => {
        return NodeFSDriver.writeFileAsync(invalidName, data).catch(() => {
          return expect(fs.existsSync(invalidName)).to.be.false;
        });
      });
    });

    context('when there is no error creating the file', () => {

      beforeEach(() => {
        if (fs.existsSync(validName)) {
          fs.unlinkSync(validName);
        }
        expect(fs.existsSync(validName)).to.be.false;
      });

      afterEach(() => {
        fs.unlinkSync(validName);
      });

      it('writes the file with the expected filename', () => {
        return NodeFSDriver.writeFileAsync(validName, data).then(() => {
          return expect(fs.existsSync(validName)).to.be.true;
        });
      });

      it('writes the expected data to the file', () => {
        return NodeFSDriver.writeFileAsync(validName, data).then(() => {
          return expect(fs.readFileSync(validName, 'utf8')).to.equal(data);
        });
      });

    });


  });

});
