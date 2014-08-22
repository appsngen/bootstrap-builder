(function () {
    'use strict';

    var fs = require('fs'),
        less = require('less'),
        mkdirp = require('mkdirp'),
        stripJsonComments = require('strip-json-comments'),

        configName = "config.json",

        bootstrapRoot = 'node_modules/bootstrap/less/',
        mixinsRoot = 'node_modules/bootstrap/less/mixins/',
        extensionsRoot = 'extensions/less/',

        destinationPathCss = "dist/bootstrap-styles.css",
        destinationPathLess = "dist/bootstrap-styles.less";

    var readFile = function (fileName) {
        var fileContent = '';
        try{
            fileContent = fs.readFileSync(fileName);
        }catch(e){
            console.log(e);
        }
        return fileContent.toString();
    };

    var readConfig = function () {
        var stringConfig = readFile(process.cwd() + '/' + configName);
        var obj = JSON.parse(stripJsonComments(stringConfig));
        var result = {};

        result.variablesPath = obj.variablesPath;
        result.mixinsConfig = obj.Mixins;
        result.bootsrapConfig = obj.Bootsrap;
        result.appsNgenExtensionsConfig = obj.AppsNgenExtensions;
        result.themePath = obj.themePath;
        result.compressResults = obj.compress;

        return result;
    };

    var includeFiles = function(config, root){
        var fileContent,
            filePath,
            result = "";

        for(var property in config){
            if (config[property] === true)
            {
                //include file
                filePath = root + '/' + property;
                console.log("Include: " + filePath);

                fileContent = readFile(filePath);
                result = result + fileContent;
            }
        }

        return result
    };

    var config = readConfig();

    var variables = readFile(config.variablesPath);
    var mixinFiles = includeFiles(config.mixinsConfig, mixinsRoot);
    var bootstrapFiles = includeFiles(config.bootsrapConfig, bootstrapRoot);
    var extensionsFiles = includeFiles(config.appsNgenExtensionsConfig, extensionsRoot);
    var theme = readFile(config.themePath);

    var resultLess = variables + mixinFiles + bootstrapFiles + extensionsFiles + theme;


    var parser = new (less.Parser)({});
    parser.parse(resultLess, function (e, tree) {
        tree.toCSS({ compress: config.compressResults });
        try {
            var css = tree.toCSS({
                compress: config.compressResults
            });
            mkdirp('dist', function (error) {
                if (error) {
                    throw error;
                }
                else {
                    fs.writeFile(destinationPathCss, css, function (err) {
                        if (err) {
                            throw err;
                        }
                        console.log('----------------------------------');
                        console.log('Created ' + destinationPathCss);
                    });
                    fs.writeFile(destinationPathLess, bootstrapFiles, function (err) {
                        if (err) {
                            throw err;
                        }
                        console.log('----------------------------------');
                        console.log('Created ' + destinationPathLess);
                    });
                }
            });
        }
        catch (exception) {
            console.log(exception);
        }
    });
}());