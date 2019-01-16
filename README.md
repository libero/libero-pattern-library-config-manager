# Pattern Library Config Manager

This is intended for use with the [Libero pattern library](https://github.com/libero/pattern-library). If you're not using that, then this is probably not the package you're looking for.

**N.B. At the moment this package is not yet stable and could receive a breaking change at any time.**   
 
### Configuration

The configuration in this project is used by the [Libero pattern library](https://github.com/libero/pattern-library) as the single source of truth for knowledge which needs to be shared across front end technology boundaries (Sass, JavaScript and the templating layer). For example, media query breakpoint values need to exist in the styling layer, but they are also often needed by JavaScript.

Additionally, for flexibility, all configuration that ends up in the Sass layer should be maintained here regardless of whether or not it's (yet) shared with other layers.

#### Input
Configuration specification files are defined in the `paths.config` array of `/bin/configSpec.json`. By default, this defines one file: `config--libero.js`. 

#### Output
Configuration output locations are defined in `/bin/configSpec.json`:
 
- Sass configuration output is defined by `paths.output.sassVariablesPath`, which by default is set to `/generated/css/sass/variables/`.

- JavaScript configuration output is defined by `paths.output.jsonFileName`, which by default is set to `/generated/js/derivedConfig.json`.      
  
#### Anatomy of configuration  

##### Simple example
`config.data` is where you define your configuration data.
Here `config.data` defines the the `small` and `medium` site breakpoints:  
  
```  
config.data.breakpoint = {site: {}};  
config.data.breakpoint.site.small = 480;  
config.data.breakpoint.site.medium = 730;  
```  
   
`config.layerAllocations` specifies which technology layers the properties of `config.data` are distributed to. Continuing the above example:  
```  
config.layerAllocations = {  
 sass: ['breakpoint'],
 js: ['breakpoint'],
 template: ['breakpoint'] };
 ```  
specifies that the `breakpoint` config must be distributed to all three available layers: the sass, JavaScript and the templating layer.

Note that it is possible to define properties on `config.data` that are not distributed to any layers. Don't do this though, they won't be used anywhere.  

##### Advanced example
Sometimes configuration values depend on other configuration values, for example measures in a grid system. To be able to maintain these relationships even when the underlying predicate value may be modified by a later-loading config file, the calculation of the final value determined by these relationships must be deferred until all specified configurations are loaded and parsed. This is achieved by specifying these simple mathematical expressions in the format:
```
'!expression [some simple mathematical expression]'
```
Using this we can specify the baseline grid as:
```
config.data.baselinegrid = {space: {}};  
config.data.baselinegrid.space.extra_small_in_px = 12;  
config.data.baselinegrid.space.small_in_px = '!expression baselinegrid.space.extra_small_in_px * 2';  
config.data.baselinegrid.space.smallish_in_px = '!expression baselinegrid.space.small_in_px * 1.5';  
config.data.baselinegrid.space.medium_in_px = '!expression baselinegrid.space.small_in_px * 2';
...
```
The result is that `config.data.baselinegrid.space.small_in_px` will have the value twice that of whatever the final value of `config.data.baselinegrid.space.extra_small_in_px`is, *even if `config.data.baselinegrid.space.extra_small_in_px` is modified by a later loading config*. This provides a way of reusing the essentials of the baseline grid system, but basing it on a different key value as required.

#### Distributing configuration
  
##### Distributing to SASS  
Each property of `config.data` specified in `config.layerAllocations.sass` is eventually used to write two files: a Sass partial file containing a Sass map of the data, and a Sass file defining the data in terms of CSS custom properties.
   
For example, the input:

```
// config--libero.js
...
config.data.font.monospace = '"Courier 10 Pitch", Courier, monospace';
config.layerAllocations.sass: ['font'];
...

```

is output as both:


```
// _font.scss
$font: (
  ...
  monospace: #{"Courier 10 Pitch", Courier, monospace},
  ...
);
```
and: 
```
// custom-properties--font.scss
...
--font-monospace: "Courier 10 Pitch", Courier, monospace;
...
```

##### Distributing to JavaScript  
Each property of `config.data` specified in `config.layerAllocations.js` is eventually written to `/source/js/derivedConfig.json`.  Continuing the `font` example, the monospace font stack data is written as:    
  
```js  
// derivedConfig.json  
{
  ...
  "font": {
    ...
    "monospace": "\"Courier 10 Pitch\", Courier, monospace",
    ...
    },
    ...
}
```  
  ##### Distributing to templates
  [Not yet implemented]
