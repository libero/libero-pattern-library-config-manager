const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const path = require('path');

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

      let validDirName;

      beforeEach(() => {
        validDirName = path.join(validName, '/');
        if (fs.existsSync(validDirName)) {
          fs.rmdirSync(validDirName);
        }
        expect(fs.existsSync(validDirName)).to.be.false;
      });

      afterEach(() => {
        fs.rmdirSync(validDirName);
      });

      it('returns a promise that will not be rejected', () => {
        return expect(
          NodeFSDriver.writeDirectory(validDirName)
        ).to.not.be.rejected;
      });

      it('writes the directory', () => {
        return NodeFSDriver.writeDirectory(validDirName).then(() => {
          return expect(fs.existsSync(validDirName)).to.be.true;
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
