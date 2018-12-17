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

config.layerAllocations = {
  sass: ['breakpoints'],
  js: ['breakpoints'],
  template: ['breakpoints']
};

const expectedOutput = {
  js: "{\"breakpoints\":{\"site\":{\"x_small\":320,\"small\":480}}}",
  sass: "$breakpoints-site-x_small: 320;\n$breakpoints-site-small: 480;\n"
};

module.exports = {
  input: config,
  expectedOutput
};
