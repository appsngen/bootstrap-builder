(function () {
    'use strict';

    var fs = require('fs'),
        less = require('less'),
        mkdirp = require('mkdirp'),
        stripJsonComments = require('strip-json-comments'),

        configName = "config.json",

        bootstrapRoot = 'node_modules/bootstrap/less/',
        bootstrapJsRoot = 'node_modules/bootstrap/js/',
        mixinsRoot = 'node_modules/bootstrap/less/mixins/',
        extensionsRoot = 'extensions/less/',
        extensionJsRoot = 'extensions/js/',

        destinationPathCss = "dist/bootstrap-styles.css",
        destinationPathLess = "dist/bootstrap-styles.less",
        destinationPathJs = 'dist/js/';

    var readFile = function (fileName) {
        var fileContent = '';
        try {
            fileContent = fs.readFileSync(fileName);
        } catch (e) {
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
        result.bootsrapConfig = obj.Bootstrap;
        result.appsNgenExtensionsConfig = obj.AppsNgenExtensions;
        result.themePath = obj.themePath;
        result.compressResults = obj.compress;

        return result;
    };

    var includeFiles = function (config, root) {
        var fileContent,
            filePath,
            result = "";

        for (var property in config) {
            if (config[property] === true) {
                //include file
                filePath = root + '/' + property;
                console.log("Include: " + filePath);

                fileContent = readFile(filePath);
                result = result + fileContent;
            }
        }

        return result
    };

    var formComponentsList = function (inputObj) {
        var resultString = '/*\n\n',
            bootstrap,
            extensions;

        bootstrap = JSON.stringify(inputObj.bootsrapConfig);
        bootstrap = bootstrap.replace(/[,]/g, ',\n\t');
        resultString += '"Bootstrap":' + bootstrap + '\n\n';

        extensions = JSON.stringify(inputObj.appsNgenExtensionsConfig);
        extensions = extensions.replace(/[,]/g, ',\n\t');

        resultString += '"AppsNgenExtensions":' + extensions;
        resultString = resultString.replace(/[{]/g, ' {\n\t').replace(/[}]/g, '\n},');
        resultString += '\n\n*/\n\n';

        return resultString;
    };

    var makeValidObjectForCopyJs = function (config) {
        var stringObject = JSON.stringify(config).replace(/.less/g, '.js'),
            resultObject = JSON.parse(stringObject);

        return resultObject;
    };

    var copyFile = function (fileName, targetPath, sourcePath) {
        var target = targetPath + fileName;
        var fileContent = readFile(sourcePath + fileName);
        fs.writeFile(target, fileContent, function (err) {
            if (err) {
                throw err;
            }
            console.log('----------------------------------');
            console.log('Created ' + target);
        })
    };

    var copyNecessaryJs = function (config, targetPath, sourcePath) {
        fs.readdir(sourcePath, function (error, files) {
            if (error) {
                throw error;
            } else {
                for (var property in config) {
                    if (config[property] === true) {
                        for (var j = 0; j < files.length; j++) {
                            if (files[j] === property) {
                                copyFile(property, targetPath, sourcePath);
                            }
                        }
                    }
                }
            }
        });
    };

    var deleteFolderRecursive = function(path) {
        if(fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file){
                var currentPath = path + "/" + file;
                if(fs.lstatSync(currentPath).isDirectory()) {
                    deleteFolderRecursive(currentPath);
                } else {
                    fs.unlinkSync(currentPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    var config = readConfig();

    var componentsList = formComponentsList(config);
    var variables = readFile(config.variablesPath);
    var mixinFiles = includeFiles(config.mixinsConfig, mixinsRoot);
    var bootstrapFiles = includeFiles(config.bootsrapConfig, bootstrapRoot);
    var extensionsFiles = includeFiles(config.appsNgenExtensionsConfig, extensionsRoot);
    var theme = readFile(config.themePath);

    var resultLess = componentsList + variables + mixinFiles + bootstrapFiles + extensionsFiles + theme;

    var bootstrapJs = makeValidObjectForCopyJs(config.bootsrapConfig),
        extensionJs = makeValidObjectForCopyJs(config.appsNgenExtensionsConfig);

    var parser = new (less.Parser)({});

    deleteFolderRecursive('dist');

    parser.parse(resultLess, function (e, tree) {
        tree.toCSS({compress: config.compressResults});
        try {
            var css = tree.toCSS({
                compress: config.compressResults
            });

            mkdirp('dist', function (error) {
                if (error) {
                    throw error;
                } else {
                    fs.writeFile(destinationPathCss, css, function (err) {
                        if (err) {
                            throw err;
                        }
                        console.log('----------------------------------');
                        console.log('Created ' + destinationPathCss);
                    });
                    fs.writeFile(destinationPathLess, resultLess, function (err) {
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

    /* copy necessary js files */
    mkdirp('dist/js', function (error) {
        if (error) {
            throw error;
        } else {
            copyNecessaryJs(bootstrapJs, destinationPathJs, bootstrapJsRoot);
            copyNecessaryJs(extensionJs, destinationPathJs, extensionJsRoot);
        }
    });
}());