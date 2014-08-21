(function () {
    'use strict';

    var fs = require('fs'),
        less = require('less'),
        mkdirp = require('mkdirp'),
        bootstrapRoot = 'node_modules/bootstrap/less',
        extensionsRoot = 'extensions/less',
        configName = "config.json",
        themePath = "theme/less/theme.less",
        bootstrapIncludePath = "node_modules/bootstrap/less/bootstrap.less",
        mixinsIncludePath = "node_modules/bootstrap/less/mixins.less",
        extensionsIncludePath = "extensions/less/bootstrapExtensions.less",
        destinationPathCss = "dist/bootstrap-styles.css",
        destinationPathLess = "dist/bootstrap-styles.less",
        coreMaxinsConfig,
        resetConfig,
        coreConfig,
        componentsConfig,
        componentsJavaScriptConfig,
        utilityClassesConfig,
        isCompress = true,
        isTheme = false,
        variablesPath;

    var readFile = function (fileName) {
        var fileContent = '';
        try{
            fileContent = fs.readFileSync(fileName);
        }catch(e){
            console.log(e);
        }
        return fileContent.toString();
    };

    var parser = new (less.Parser)({
    });

    var replaceAll = function (find, replace, str) {
        return str.replace(new RegExp(find, 'g'), replace);
    };

    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };

    var concatFiles = function (list, root) {
        var index, opened;
        var result = "";
        for (index = 0; index < list.length; index++) {
            opened = readFile(root + '/' + list[index]);
            result = result + opened;
        }

        return result;
    };

    var readImportsFile = function (file) {
        var opened = readFile(file);
        var listOfFiles = opened.split('\n');
        var index;
        for (index = 0; index < listOfFiles.length; index++) {
            if (listOfFiles[index].indexOf('@import ') === -1) {
                listOfFiles.remove(index);
                index--;
            }
            else {
                listOfFiles[index] = listOfFiles[index].replace('@import ', '');
                listOfFiles[index] = replaceAll('"', '', listOfFiles[index]);
                listOfFiles[index] = replaceAll(';', '', listOfFiles[index]);
                listOfFiles[index] = replaceAll('\r', '', listOfFiles[index]);
            }
        }
        return listOfFiles;
    };

    var readConfig = function () {
        var stringConfig = readFile(process.cwd() + '/' + configName);
        var obj = JSON.parse(stringConfig);
        var objConfig = obj.config;
        coreMaxinsConfig = objConfig[0].Core;
        resetConfig = objConfig[1].Reset;
        coreConfig = objConfig[2].Core_CSS;
        componentsConfig = objConfig[3].Components;
        componentsJavaScriptConfig = objConfig[4].Components_JavaScript;
        utilityClassesConfig = objConfig[5].Utility_Classes;
        isCompress = obj.compress;
        isTheme = obj.theme;
        variablesPath = obj.variablesPath;
    };

    var applyConfig = function (list) {
        var includeItem = function (item) {
            var i;
            for (i = 0; i < coreMaxinsConfig.length; i++) {
                if (coreMaxinsConfig[i].name === item) {
                    return coreMaxinsConfig[i].include;
                }
            }
            for (i = 0; i < resetConfig.length; i++) {
                if (resetConfig[i].name === item) {
                    return resetConfig[i].include;
                }
            }
            for (i = 0; i < coreConfig.length; i++) {
                if (coreConfig[i].name === item) {
                    return coreConfig[i].include;
                }
            }
            for (i = 0; i < componentsConfig.length; i++) {
                if (componentsConfig[i].name === item) {
                    return componentsConfig[i].include;
                }
            }
            for (i = 0; i < componentsJavaScriptConfig.length; i++) {
                if (componentsJavaScriptConfig[i].name === item) {
                    return componentsJavaScriptConfig[i].include;
                }
            }
            for (i = 0; i < utilityClassesConfig.length; i++) {
                if (utilityClassesConfig[i].name === item) {
                    return utilityClassesConfig[i].include;
                }
            }
            return true;
        };
        var i;
        console.log("\n");
        console.log("List of excluded files: \n");
        for (i = 0; i < list.length; i++) {
            if (!includeItem(list[i])) {
                console.log(list[i] + " : " + "include = false");
                list.remove(i);
                i--;
            }
        }
        console.log("\n");
    };

    var printBuild = function (list) {
        var i;
        console.log("List for assembly: \n");
        for (i = 0; i < list.length; i++) {
            console.log("Include: " + list[i]);
        }
    };

    readConfig();

    var mixinsToInclude = readImportsFile(mixinsIncludePath);
    var mixinFiles = concatFiles(mixinsToInclude, bootstrapRoot);

    var bootstrapInclude = readImportsFile(bootstrapIncludePath);
    applyConfig(bootstrapInclude);
    printBuild(bootstrapInclude);
    var bootstrapFiles = concatFiles(bootstrapInclude, bootstrapRoot);

    var extensionsInclude = readImportsFile(extensionsIncludePath);
    applyConfig(extensionsInclude);
    printBuild(extensionsInclude);
    var extensionsFiles = concatFiles(extensionsInclude, extensionsRoot);

    var result = readFile(variablesPath);

    result = result + mixinFiles + bootstrapFiles + extensionsFiles;

    if (isTheme) {
        result = result + readFile(themePath);
    }
    parser.parse(result, function (e, tree) {
        tree.toCSS({ compress: isCompress });
        try {
            var css = tree.toCSS({
                compress: isCompress
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
                        console.log('Created dist/bootstrap-styles.css.');
                    });
                    fs.writeFile(destinationPathLess, bootstrapFiles, function (err) {
                        if (err) {
                            throw err;
                        }
                        console.log('----------------------------------');
                        console.log('Created dist/bootstrap-styles.less.');
                    });
                }
            });
        }
        catch (exception) {
            console.log(exception);
        }
    });
}());