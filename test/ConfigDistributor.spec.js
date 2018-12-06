const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');

const Color = require('color');
const fixtures = require('./fixtures/configFixtures');
const ConfigDistributor = require('../bin/ConfigDistributor');

const spy = sinon.spy;

chai.use(chaiAsPromised);
const expect = chai.expect;

const standAloneConfigFixtureFilePath = './fixtures/configFixtureStandAlone';
const standAloneConfigFixture = require(standAloneConfigFixtureFilePath);

describe('A DistributeConfig class', () => {

  context('instantiated object', () => {

    let configDistributor;

    beforeEach(() => {
      configDistributor = new ConfigDistributor();
    });

    describe('distribute method', () => {

      let configPaths;

      it('initiates config generation with the config paths supplied', () => {
        const configGeneratorMock = {
          generateConfig: () => {
            return Promise.resolve(standAloneConfigFixture);
          }
        };
        spy(configGeneratorMock, 'generateConfig');

        const configPaths = fixtures.configPaths;
        return configDistributor.distribute(configPaths, configGeneratorMock).then(() => {
          expect(configGeneratorMock.generateConfig.calledOnceWithExactly(configPaths)).to.be.true;
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

  describe('writeDirectory method', () => {

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

});
