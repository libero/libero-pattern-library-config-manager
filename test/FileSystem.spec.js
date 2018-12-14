const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const path = require('path');
const sinon = require('sinon');

const FileSystem = require('../bin/FileSystem');

const spy = sinon.spy;

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Filesystem class', () => {

  describe('writeFile static method', () => {

    let NodeFSDriverMock;

    beforeEach(() => {
      NodeFSDriverMock = {
        writeDirectory: () => {
          return Promise.resolve();
        }
      };
    });

    context('when there is an error writing the file', () => {

      let fileSystem;

      beforeEach(() => {
        NodeFSDriverMock.writeFileAsync = () => { return Promise.reject(); };
        fileSystem = new FileSystem(NodeFSDriverMock);
      });

      it('returns a promise that will be rejected', () => {
        return expect(
          FileSystem.writeFile('some data', '/some-file-path')
        ).to.be.rejected;
      });

    });

    context('when there is no error writing the file', () => {

      let fileSystem;

      beforeEach(() => {
        NodeFSDriverMock.writeFileAsync = () => { Promise.resolve(); };
        spy(NodeFSDriverMock, 'writeFileAsync');
        fileSystem = new FileSystem(NodeFSDriverMock);
      });

      afterEach(function () {
        NodeFSDriverMock.writeFileAsync.restore();
      });

      it('calls the file writer with the correct data to write', () => {
        return FileSystem.writeFile('some data', '/some-file-path').then(() => {
          const callData = NodeFSDriverMock.writeFileAsync.getCall(0);
          expect(callData.args[1]).to.equal(data);
        });

      });

     it('calls the file writer with the correct path to write to', () => {
        return FileSystem.writeFile('some data', '/some-file-path').then(() => {
          const callData = NodeFSDriverMock.writeFileAsync.getCall(0);
          const expectedPath = path.join(path.resolve(path.join(__dirname, '../')), filepath);
          expect(callData.args[0]).to.equal(expectedPath);
        });
      });

    });

  });

});

