Bootstrap builder
=================

Tool for custom bootstrap assemblies with LESS output in addition to CSS

Setup dependencies with following command:

```
$ npm install
```

Build custom theme with command:

```
$ node app 
```

###Directory Structure

bootstrap-builder/
├── dist/    
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── bootstrap.css  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── bootstrap.less  
├── extensions/  
├── src/  
├── theme/  
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── less/
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── theme.less
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── variables.less
│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── variables-white.less
├── app.js  
└── config.json


* `/dist` - automatically generated folder with results output.
* `/dist/bootstrap.css` - CSS compiled form `bootstrap.less`, which includes only components defined in `config.json`.
* `/dist/bootstrap.less` - LESS file, which includes only components defined in `config.json`.
* `/extensions` - AppsNgen extensions to Bootstrap.
* `/src` - sources folder.
* `/theme/less/theme.less` - theme file for Bootstrap extensions.
* `/theme/less/variables.less` - variables for AppsNgen Dark Gray theme.
* `/theme/less/variables-white.less` - variables for AppsNgen Light Gray theme.

###How to use

Go to `config.json` and set `true` for required comments. NOTE: order of elements in config file is important

```
"dropdowns.less": true
```

It means that table styles will be included into output `bootstrap.less` and `bootstrap.css` files

Include required components into your theme by changing `config.json`

Define styles that are not defined in Bootstrap in `theme/less/theme.less`

## License

MIT