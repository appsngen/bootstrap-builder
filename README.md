Bootstrap builder
=================

Tool for custom bootstrap assemblies with LESS output in addition to CSS

###Directory Structure
> `bootstrap-builder` is a root folder.

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
* `/dist/bootstrap.css` - CSS compiled form `bootstrap.less` which includes only components defined in `config.json`.
* `/dist/bootstrap.less` - LESS file which includes only components defined in `config.json`.
* `/extensions` - AppsNgen extensions to Bootstrap.
* `/src` - sources folder.
* `/theme/less/theme.less` - theme file for Bootstrap extensions.
* `/theme/less/variables.less` - variables for AppsNgen Dark Gray theme.
* `/theme/less/variables-white.less` - variables for AppsNgen Light Gray theme.

 

###Installation
To install bootstrap builder:
* install node.js (http://nodejs.org/download/)
* execute the following command in command prompt in the `root folder` to set up dependencies:

```
$ npm install
```


###Build Custom Theme

Build custom theme with command in command prompt in the `root folder`:

```
$ node app 
```

###How to use

Go to `config.json` and set `true` for required components. NOTE: Order of elements in the config file is important.

```
"dropdowns.less": true
```

It means that table styles will be included into output `bootstrap.less` and `bootstrap.css` files.

Include required components into your theme by changing `config.json`

Define styles that are not defined in Bootstrap in `theme/less/theme.less`

###Generate New Color Theme

Go to `theme/less/variables.less` and set new values for required variables.

AppsNgen themes based on 5 variables:
* `@gray-darker` - headers
* `@gray-dark` - background
* `@gray` - bars/buttons
* `@gray-light` - secondary text/icons/dividers
* `@gray-lighter` - text


>For simple customization you can update values only for variables provided above.

__OR__

>For more custom solutions you can update value for all bootstrap variables.

Build custom theme with command in command prompt in the `root folder`:

```
$ node app 
```

## License

MIT