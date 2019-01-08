const Color = require('color');

const config = { data: {} };

config.data.topLevelProperty = { nested: {} };
config.data.topLevelProperty.basic = 200;
config.data.topLevelProperty.nested.number = 100;
config.data.topLevelProperty.nested.quoted = 'I am a string';
config.data.topLevelProperty.nested.color_something = Color('#212121');

const forJsOnly = {
  data: config.data,
  layerAllocations: {
    js: ['topLevelProperty'],
    sass: []
  }
};

const forSassOnly = {
  data: config.data,
  layerAllocations: {
    js: [],
    sass: ['topLevelProperty']
  }
};

const forJsAndSass = {
  data: config.data,
  layerAllocations: {
    js: ['topLevelProperty'],
    sass: ['topLevelProperty']
  }
};

const expectedOutput = {
  js: {
    topLevelProperty: {
      nested: {
        number: 100,
        quoted: "I am a string",
        color_something: 'rgb(33, 33, 33)'
      },
      basic: 200,
    }
  },
  sass: {
    sassMap: '$topLevelProperty: (\n'
               + '  nested-number: 100,\n'
               + '  nested-quoted: #{I am a string},\n'
               + '  nested-color_something: rgb(33, 33, 33),\n'
               + '  basic: 200,\n'
               + ');\n',
    fileName: '_topLevelProperty.scss'
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
