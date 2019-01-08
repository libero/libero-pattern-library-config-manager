const Color = require('color');

const config = { data: {} };

config.data.baselinegrid = {space: {}};
config.data.baselinegrid.space.extra_small_in_px = 12;
config.data.baselinegrid.space.small_in_px = '!expression baselinegrid.space.extra_small_in_px * 2';

config.data.breakpoint = {site: {}};
config.data.breakpoint.site.x_small = 320;
config.data.breakpoint.site.small = 480;

config.data.color = { primary: {}, text: {} };
config.data.color.text.normal = Color('#212121');

const forJsOnly = {
  data: config.data,
  layerAllocations: {
    js: ['breakpoint'],
    sass: []
  }
};

const forSassOnly = {
  data: config.data,
  layerAllocations: {
    js: [],
    sass: ['breakpoint']
  }
};

const forJsAndSass = {
  data: config.data,
  layerAllocations: {
    js: ['breakpoint'],
    sass: ['breakpoint']
  }
};

const expectedOutput = {
  js: {
    breakpoint: {
      site: {
        x_small: 320,
        small: 480,
      }
    }
  },
  sass: {
    sassMap: '$breakpoint: (\n'
               + '  site-x_small: 320,\n'
               + '  site-small: 480,\n'
               + ');\n',
    fileName: '_breakpoint.scss'
  },
};

module.exports = {
  input: {
    js: forJsOnly,
    sass: forSassOnly,
    jsAndSass: forJsAndSass
  },
  expectedOutput
};
