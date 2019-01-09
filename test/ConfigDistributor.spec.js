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
        expect(consolidatorSpy.calledOnceWithExactly(expectedPaths)).to.be.true;
      });
  });

  context('when processing data for the JavaScript layer', () => {

    it('determines the correct data to distribute to the JavaScript layer', () => {
      const expectedData = JSON.stringify(cannedData.expectedOutput.js);

      filesystemMock.expects('writeFile').once().withArgs(expectedData);

      return distributor.distribute(consolidatorFixtures.forJsOnly)
        .then(() => {
          filesystemMock.verify();
        });
    });

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

  });

  context('when processing data for the Sass layer', () => {

    let writeFileSpy;

    beforeEach(() => {
      // Can't use a sinon mock here as testing a unit that calls writeFile more than once
      // (see https://sinonjs.org/releases/v7.2.2/mocks/#expectationwithexactargsarg1-arg2-)
      writeFileSpy = sinon.spy(fileSystem, 'writeFile');
    });

    afterEach(() => {
      fileSystem.writeFile.restore();
    });

    it('determines the correct data to distribute to the Sass map file', () => {
      const expectedData = cannedData.expectedOutput.sass.sassMap;
      return distributor.distribute(consolidatorFixtures.forSassOnly)
        .then(() => {
          expect(writeFileSpy.withArgs(expectedData).calledOnce).to.be.true;
        });
    });

    it('determines the correct data to distribute to the CSS custom properties file', () => {
      const expectedData = cannedData.expectedOutput.sass.customProps;
      return distributor.distribute(consolidatorFixtures.forSassOnly)
        .then(() => {
          expect(writeFileSpy.withArgs(expectedData).calledOnce).to.be.true;
        });
    });

    it('attempts to distribute the Sass map file to the correct path', () => {
      const cannedConfigToWrite = cannedData.expectedOutput.sass.sassMap;
      const expectedDirectory = paths.output.sassVariablesPath;
      const expectedFilename = cannedData.expectedOutput.sass.fileName;

      return distributor.distribute(consolidatorFixtures.forSassOnly)
        .then(() => {
          expect(writeFileSpy.withArgs(cannedConfigToWrite, expectedDirectory, expectedFilename).calledOnce).to.be.true;
        });
    });

    it('attempts to distribute the CSS custom properties file to the correct path', () => {
      const cannedConfigToWrite = cannedData.expectedOutput.sass.customProps;
      const expectedDirectory = paths.output.sassVariablesPath;
      const expectedFilename = cannedData.expectedOutput.sass.cssCustomPropsFilenme;

      return distributor.distribute(consolidatorFixtures.forSassOnly)
        .then(() => {
          expect(writeFileSpy.withArgs(cannedConfigToWrite, expectedDirectory, expectedFilename).calledOnce).to.be.true;
        });
    });

  });

});
