const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

const FileSystem = require('../FileSystem');

const spy = sinon.spy;

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Filesystem class', () => {

  describe('writeFile static method', () => {

    let driverMock;

    beforeEach(() => {
      driverMock = {
        writeDirectory: (dir) => {
          return new Promise((resolve) => {
            resolve(`${__dirname}${dir}`);
          });
        }
      };
    });

    context('when there is an error writing the file', () => {

      let fileSystem;

      beforeEach(() => {
        driverMock.writeFileAsync = () => { return Promise.reject(); };
        fileSystem = new FileSystem(driverMock);
      });

      it('returns a promise that will be rejected', () => {
        return expect(
          fileSystem.writeFile('some data', '/a-directory/', '/a.file')
        ).to.be.rejected;
      });

    });

    context('when there is no error writing the file', () => {

      let fileSystem;

      beforeEach(() => {
        driverMock.writeFileAsync = () => { return Promise.resolve(); };
        spy(driverMock, 'writeFileAsync');
        fileSystem = new FileSystem(driverMock);
      });

      it('calls the driver\'s file writer with the correct data to write', () => {
        const data = 'some data';
        return fileSystem.writeFile(data, '/some-directory/', 'some.filename').then(() => {
          const callData = driverMock.writeFileAsync.getCall(0);
          return expect(callData.args[1]).to.equal(data);
        });

      });

     it('calls the driver\'s file writer with the correct path to write to', () => {
        const projectRelativeFilePath = '/some-directory/';
        const filename = 'some.filename';
        return fileSystem.writeFile('some data', projectRelativeFilePath, filename).then(() => {
          const callData = driverMock.writeFileAsync.getCall(0);
          const expectedPath = __dirname + projectRelativeFilePath + filename;
          return expect(callData.args[0]).to.equal(expectedPath);
        });
      });

    });

  });

});

