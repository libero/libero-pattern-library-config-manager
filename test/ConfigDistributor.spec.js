const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

const ConfigDistributor = require('../bin/ConfigDistributor');
const {paths} = require('./fixtures/configFixtures');
const configConsolidationCannedData = require('./fixtures/configConsolidationCannedData');

chai.use(chaiAsPromised);
const expect = chai.expect;

afterEach(function () {
  sinon.restore();
});

describe('DistributeConfig instance\'s distribute()', () => {

  let cannedData;
  let consolidatorFixtures;
  let distributor;
  let fileSystem;
  let filesystemMock;
  let reporterFixture;

  beforeEach(() => {
    cannedData = configConsolidationCannedData;
    fileSystem = {
      writeFile: () => { return Promise.resolve(); }
    };
    filesystemMock = sinon.mock(fileSystem);

    reporterFixture = () => {};

    consolidatorFixtures = {
      forJsAndSass: {
        consolidate: () => {
          return Promise.resolve(cannedData.input.jsAndSass);
        }
      },
      forJsOnly: {
        consolidate: () => {
          return Promise.resolve(cannedData.input.js);
        }
      },
      forSassOnly: {
        consolidate: () => {
          return Promise.resolve(cannedData.input.sass);
        }
      }
    };

    distributor = new ConfigDistributor(fileSystem, paths, reporterFixture);
  });

  it('initiates config consolidation with the supplied paths', () => {
    const consolidatorSpy = sinon.spy(consolidatorFixtures.forJsAndSass, 'consolidate');
    const expectedPaths = paths.config;

    return distributor.distribute(consolidatorFixtures.forJsAndSass)
      .then(() => {
        return expect(consolidatorSpy.calledOnceWithExactly(expectedPaths)).to.be.true;
      });
  });

  context('when deriving the data to distribute to the respective layers', () => {

    it('determines the correct data to distribute to the JavaScript layer', () => {
      const expectedData = JSON.stringify(cannedData.expectedOutput.js);

      filesystemMock.expects('writeFile').once().withArgs(expectedData);

      return distributor.distribute(consolidatorFixtures.forJsOnly)
        .then(() => {
          filesystemMock.verify();
        });
    });

    it('determines the correct data to distribute to the Sass layer', () => {
      const expectedData = cannedData.expectedOutput.sass;

      filesystemMock.expects('writeFile').once().withArgs(expectedData);

      return distributor.distribute(consolidatorFixtures.forSassOnly)
        .then(() => {
          filesystemMock.verify();
        });

    });

  });

  context('when writing files', () => {

    it('attempts to distribute the JavaScript layer to the correct path', () => {
      const cannedConfigToWrite = JSON.stringify(cannedData.expectedOutput.js);
      const expectedDirectory = paths.output.jsonFile.directory;
      const expectedFilename = paths.output.jsonFile.filename;

      filesystemMock.expects('writeFile').once().withArgs(cannedConfigToWrite, expectedDirectory, expectedFilename);

      return distributor.distribute(consolidatorFixtures.forJsOnly)
        .then(() => {
          filesystemMock.verify();
        });
    });

    it('attempts to distribute the Sass layer to the correct path', () => {
      const cannedConfigToWrite = cannedData.expectedOutput.sass;
      const expectedDirectory = paths.output.sassVariablesPath;
      // TODO: make less brittle, currently relies on fixture only distributing breakpoints to sass
      const expectedFilename = '_breakpoints.scss';

      filesystemMock.expects('writeFile').once().withArgs(cannedConfigToWrite, expectedDirectory, expectedFilename);

      return distributor.distribute(consolidatorFixtures.forSassOnly)
        .then(() => {
          filesystemMock.verify();
        });
    });

  });

});
