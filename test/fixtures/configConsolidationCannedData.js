const Color = require('color');

const config = { data: {} };

config.data.baselinegrid = {space: {}};
config.data.baselinegrid.space.extra_small_in_px = 12;
config.data.baselinegrid.space.small_in_px = '!expression baselinegrid.space.extra_small_in_px * 2';

config.data.breakpoint = { nested: {} };
config.data.breakpoint.nested.number = 100;
config.data.breakpoint.nested.quoted = 'string in quotes';
config.data.breakpoint.nested.color_something = Color('#212121');
config.data.breakpoint.topLevel = 200;

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
      nested: {
        number: 100,
        quoted: "string in quotes",
        color_something: 'rgb(33, 33, 33)'
      },
      topLevel: 200,
    }
  },
  sass: {
    sassMap: '$breakpoint: (\n'
               + '  nested-number: 100,\n'
               + '  nested-quoted: #{string in quotes},\n'
               + '  nested-color_something: rgb(33, 33, 33),\n'
               + '  topLevel: 200,\n'
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
