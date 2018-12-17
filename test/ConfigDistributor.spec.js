const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const path = require('path');
const sinon = require('sinon');

const Color = require('color');
const ConfigDistributor = require('../bin/ConfigDistributor');
const fixtures = require('./fixtures/configFixtures');
const standAloneConfigFixture = require('./fixtures/configFixtureStandAlone');

const spy = sinon.spy;

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('DistributeConfig class', () => {

  let directoryWriterMock;
  let reportMock;

  beforeEach(() => {
    directoryWriterMock = () => Promise.resolve();
    reportMock = () => {};
  });

  describe('an instantiated object', () => {

    describe('distribute method', () => {

      let consolidatorMock;
      let fileSystemMock;

      beforeEach(() => {
          consolidatorMock = {
            consolidate: () => {
              return Promise.resolve(standAloneConfigFixture);
            }
          };
          spy(consolidatorMock, 'consolidate');

        fileSystemMock = {
          writeFile: () => { return Promise.resolve; },
          readFile: () => { return Promise.resolve; }
        };
        spy(fileSystemMock, 'writeFile');
        spy(fileSystemMock, 'readFile');
      });

      it('initiates config consolidation with the config paths supplied', () => {
        const paths = fixtures.configPaths;
        const distributor = new ConfigDistributor(fileSystemMock);
        return distributor.distribute(paths, consolidatorMock, reportMock)
          .then(() => {
            expect(consolidatorMock.consolidate.calledOnceWithExactly(fixtures.configPaths)).to.be.true;
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

});

