const Color = require('color');

const config = { data: {} };

config.data.baselinegrid = {space: {}};
config.data.baselinegrid.space.extra_small_in_px = 12;
config.data.baselinegrid.space.small_in_px = '!expression baselinegrid.space.extra_small_in_px * 2';

config.data.breakpoints = {site: {}};
config.data.breakpoints.site.x_small = 320;
config.data.breakpoints.site.small = 480;

config.data.color = { primary: {}, text: {} };
config.data.color.text.normal = Color('#212121');

const forJsOnly = {
  data: config.data,
  layerAllocations: {
    js: ['breakpoints'],
    sass: []
  }
};

const forSassOnly = {
  data: config.data,
  layerAllocations: {
    js: [],
    sass: ['breakpoints']
  }
};

const forJsAndSass = {
  data: config.data,
  layerAllocations: {
    js: ['breakpoints'],
    sass: ['breakpoints']
  }
};

const expectedOutput = {
  js: {
    breakpoints: {
      site: {
        x_small: 320,
        small: 480
      }
    }
  },
  sass: '$breakpoints: (\n'
        + '  site-x_small: 320,\n'
        + '  site-small: 480,\n'
        + ');\n'
};

module.exports = {
  input: {
    js: forJsOnly,
    sass: forSassOnly,
    jsAndSass: forJsAndSass
  },
  expectedOutput
};
