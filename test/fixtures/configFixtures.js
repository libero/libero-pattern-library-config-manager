const Color = require('color');

const firstGenericConfig = {
  data: {
    clash: 'config 1 clashing value',
    objects: [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      }
    ],
    color: Color('#663399')
  }
};

const secondGenericConfig = {
  data: {
    clash: 'config 2 clashing value',
    additionalProperty: 'I am only in one of the configs',
    objects: [
      {
        id: 4
      },
      {
        id: 5
      },
      {
        id: 6
      }
    ]
  }
};

module.exports = {

  paths: {
    config:[
      "config--libero.js"
    ],
    output:  {
      sassVariablesPath: "/generated/css/sass/variables/",
      jsonFile: {
        directory: "/generated/js/",
        filename: "derivedConfig.json"
      },
      jsonFileName: "/generated/js/derivedConfig.json"
    }
  },

  configWithNoDeferrals: {
    stringProperty: 'string property',
    nestedStringProperty: {
      nested: {
        string: {
          property: 'nested string property value'
        }
      }
    }
  },

  configWithDeferrals: {
    rootValue: 10,
    derivedValue: '!expression rootValue * 30'
  },

  configsToMerge: {
    firstConfig: firstGenericConfig,
    secondConfig: secondGenericConfig
  },

  configsWithData: {
    firstConfig: firstGenericConfig,
    secondConfig: secondGenericConfig
  },

  configLayerAllocations: [
    {
      layerAllocations: {
        sass: ['breakpoints', 'colors'],
        js: ['breakpoints'],
        template: ['grid']
      }
    },
    {
      layerAllocations: {
        sass: ['breakpoints', 'colors', 'grid'],
        js: ['breakpoints', 'colors']
      }
    }
  ],

  sassConfigToProcess: {
    input: {
      breakpoints: {
        'x_small': 320,
        small: 480,
        medium: 730,
        wide: 900,
        'x_wide': 1400,
        'xx_wide': 1600
      }
    },
    expected: '$breakpoints-x_small: 320;\n'
            + '$breakpoints-small: 480;\n'
            + '$breakpoints-medium: 730;\n'
            + '$breakpoints-wide: 900;\n'
            + '$breakpoints-x_wide: 1400;\n'
            + '$breakpoints-xx_wide: 1600;\n'
  },

  jsConfigToProcess: {
    input: {
      breakpoints: {
        'x_small': 320,
        small: 480,
        medium: 730,
        wide: 900,
        'x_wide': 1400,
        'xx_wide': 1600
      }
    }

  }

};
