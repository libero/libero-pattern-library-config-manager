const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');

const Color = require('color');
const ConfigDistributor = require('../bin/ConfigDistributor');
const fixtures = require('./fixtures/configFixtures');
const standAloneConfigFixture = require('./fixtures/configFixtureStandAlone');

const spy = sinon.spy;

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('A DistributeConfig class', () => {

  let directoryWriterMock;
  let reportMock;

  beforeEach(() => {
    directoryWriterMock = () => Promise.resolve();
    reportMock = () => {};
  });

  context('instantiated object', () => {

    describe('distribute method', () => {

      it('initiates config generation with the config paths supplied', () => {
        const fileWriterMock = () => Promise.resolve();
        const configConsolidatorMock = {
          generateConfig: () => {
            return Promise.resolve(standAloneConfigFixture);
          }
        };
        spy(configConsolidatorMock, 'generateConfig');

        const configPaths = fixtures.configPaths;
        const configDistributor = new ConfigDistributor();
        return configDistributor.distribute(configPaths, configConsolidatorMock, fileWriterMock, directoryWriterMock, reportMock).then(() => {
          expect(configConsolidatorMock.generateConfig.calledOnceWithExactly(configPaths)).to.be.true;
        });
      });

    });

  });

  describe('processForSass static method', () => {

    context('when supplied with a JavaScript object defining data for SASS variables', () => {

      let sassConfigFixture;

      beforeEach(() => {
        sassConfigFixture = fixtures.sassConfigToProcess.input;
      });

      it('correctly converts the JavaScript into a string wrapping corresponding SASS variable declarations', () => {
        const processed = ConfigDistributor.processForSass(sassConfigFixture);
        expect(processed).to.deep.equal(fixtures.sassConfigToProcess.expected);
      });

    });

  });

  describe('processForJs static method', () => {

    context('when supplied with a JavaScript object defining data for the JavaScript layer', () => {

      let jsConfigFixture;

      beforeEach(() => {
        jsConfigFixture = fixtures.jsConfigToProcess.input;
      });

      it('correctly converts the JavaScript into the appropriate JSON', () => {
        const processed = ConfigDistributor.processForJs(['breakpoints'], jsConfigFixture);
        expect(processed).to.deep.equal(JSON.stringify(fixtures.jsConfigToProcess.input));
      });

    });

  });

  describe('writeDirectory static method', () => {

    context('when there is an error creating the directory', () => {

      it('returns a promise that will be rejected', () => {
        const invalidDirName = (function () {
          const parts = new Array(256);
          parts.fill('a');
          return parts.join('');
        }());
        return expect(
          ConfigDistributor.writeDirectory(invalidDirName)
        ).to.be.rejected;
      });

    });

    context('when there no error', () => {

      let validDirName;

      beforeEach(() => {
        validDirName = path.join(__dirname, '/tmp/');
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
          ConfigDistributor.writeDirectory(validDirName)
        ).to.not.be.rejected;
      });

      it('writes the directory', () => {
        return ConfigDistributor.writeDirectory(validDirName).then(() => {
          return expect(fs.existsSync(validDirName)).to.be.true;
        });
      });

    });

  });

  describe('writeFile static method', () => {

    let filepath;
    let data;

    beforeEach(() => {
      data = standAloneConfigFixture;
      filepath = '/tempDir/fileFile.tmp';
    });

    context('when there is an error writing the file', () => {

      let fileWriterRejectionMock;

      beforeEach(() => {
        fileWriterRejectionMock = () => {
          return Promise.reject();
        }
      });

      it('returns a promise that will be rejected', () => {
        return expect(
          ConfigDistributor.writeFile(data, filepath, fileWriterRejectionMock)
        ).to.be.rejected;
      });

    });

    context('when there is no error', () => {

      let fileWriterMock;

      beforeEach(() => {
        const container = {
          mock: () => {
            return Promise.resolve();
          }
        };
        spy(container, 'mock');
        fileWriterMock = container.mock;
      });

      it('calls the file writer with the correct data to write', () => {
        return ConfigDistributor.writeFile(data, filepath, fileWriterMock, directoryWriterMock, reportMock).then(() => {
          const callData = fileWriterMock.getCall(0);
          expect(callData.args[1]).to.equal(data);
        });

      });

      it('calls the file writer with the correct path to write to', () => {
        return ConfigDistributor.writeFile(data, filepath, fileWriterMock, directoryWriterMock, reportMock).then(() => {
          const callData = fileWriterMock.getCall(0);
          const expectedPath = path.join(path.resolve(path.join(__dirname, '../')), filepath);
          expect(callData.args[0]).to.equal(expectedPath);
        });
      });

    });

  });

});
