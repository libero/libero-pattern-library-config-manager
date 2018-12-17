const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

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
      let consolidateSpy;
      let distributor;
      let expected;
      let fileSystemMock;
      let paths;
      let readFileSpy;
      let writeFileSpy;

      beforeEach(() => {
          consolidatorMock = {
            consolidate: () => {
              return Promise.resolve(standAloneConfigFixture.input);
            }
          };
          consolidateSpy = spy(consolidatorMock, 'consolidate');

        fileSystemMock = {
          writeFile: () => { return Promise.resolve; },
          readFile: () => { return Promise.resolve; }
        };
        writeFileSpy = spy(fileSystemMock, 'writeFile');
        readFileSpy = spy(fileSystemMock, 'readFile');

        paths = fixtures.paths;
        expected = standAloneConfigFixture.expectedOutput;

        distributor = new ConfigDistributor(fileSystemMock, paths);
      });

      it('initiates config consolidation with the config paths supplied', () => {
        return distributor.distribute(consolidatorMock, reportMock)
          .then(() => {
            expect(consolidateSpy.calledOnceWithExactly(fixtures.paths.config)).to.be.true;
          });
      });

      it('determines the correct data to distribute to the JavaScript layer', () => {
        return distributor.distribute(consolidatorMock, reportMock)
          .then(() => {
            expect(writeFileSpy.withArgs(expected.js).calledOnce).to.be.true;
          });
      });

      it('attempts to distribute the JavaScript layer to the correct path', () => {
        const jsonPath = paths.output.jsonFileName;
        const expectedDirectory = jsonPath.substring(0, jsonPath.lastIndexOf('/') + 1);
        const expectedFilename = jsonPath.substring(jsonPath.lastIndexOf('/') + 1);

        return distributor.distribute(consolidatorMock, reportMock)

          .then(() => { return new Promise((resolve) => {
            writeFileSpy.getCalls().forEach((spyCall) => {
              if (spyCall.args[0] === expected.js) {
                expect(spyCall.args[1]).to.equal(expectedDirectory);
                expect(spyCall.args[2]).to.equal(expectedFilename);
                resolve();
              }
            });
          })})
      });

      it('determines the correct data to distribute to the Sass layer', () => {
        return distributor.distribute(consolidatorMock, reportMock)
          .then(() => {
            expect(writeFileSpy.withArgs(expected.sass).calledOnce).to.be.true;
          });
      });

      it('attempts to distribute the Sass layer to the correct path', () => {
        const expectedDirectory = paths.output.sassVariablesPath;
        const expectedFilename = '_breakpoints.scss';
        return distributor.distribute(consolidatorMock, reportMock)
          .then(() => {
            const spyCalls = writeFileSpy.getCalls();
            let sassCall = null;
            spyCalls.forEach((spyCall) => {
              if (spyCall.args[0] === expected.sass) {
                sassCall = spyCall;
              }
            });
            expect(sassCall.args[1]).to.equal(expectedDirectory);
            expect(sassCall.args[2]).to.equal(expectedFilename);
          });

      });

    });

  });

});

