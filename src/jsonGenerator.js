/**
 * Created by Ruslan_Dulina on 1/20/2015.
 */
(function () {
    'use strict';
    var fs = require('fs');
    var configName = "/../config.json";
    var outFolderPath = __dirname + '/../.out/';
    var https = require('https');
    var stripJsonComments = require('strip-json-comments');
    var statusCodes = {
        internalErrorCode: 500,
        notImplementedCode: 501,
        notFoundCode: 404
    };
    exports.readConfiguration = function() {
        var fileContent, obj, result = {};
        fileContent = fs.readFileSync(__dirname + configName);
        obj = JSON.parse(stripJsonComments(fileContent.toString()));
        result.restConfig = obj.restServicesUrls;
        result.user = obj.user;
        result.organizationId = obj.organizationId;
        result.path = obj.variablesPath;
        return result;
    };

    exports.sendRequest = function (options, protocol, callback, errorCallback) {
        var dataResponse = '', result;
        var request = protocol.request(options, function (res) {
            res.on('data', function (chunk) {
                dataResponse += chunk;
            });

            res.on('end', function () {
                try {
                    result = JSON.parse(dataResponse);
                    if(this.statusCode === statusCodes.internalErrorCode ||
                        this.statusCode === statusCodes.notImplementedCode ||
                        this.statusCode === statusCodes.notFoundCode){
                        delete options.requestBody;
                        var error = new Error('Service return ' + this.statusCode + ' code. Options: ' +
                        JSON.stringify(options));
                        console.log(error.message.toString());
                        errorCallback(error);
                    }
                    else{
                        callback(result, this.statusCode);
                    }
                }
                catch (exception) {
                    console.log(exception);
                    errorCallback(exception);
                }
            });

            res.on('error', function (error) {
                console.log(error);
                errorCallback(error);
            });
        });
        if (options.requestBody) {
            request.write(options.requestBody);
        }
        request.end();
        request.on('error', function (error) {
            console.log(error);
            errorCallback(error);
        });
    };

    exports.getToken = function (config, callback, errorCallback) {
        var that = this;
        var postData = {
            'scope': {
                'services': ['preferences']
            }
        };
        var auth =  new Buffer(config.user.name  +':' + config.user.password).toString('base64');
        var postOptions = {
            hostname: config.restConfig.tokenService.host,
            path: config.restConfig.tokenService.path,
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            requestBody: JSON.stringify(postData)
        };

        that.sendRequest(postOptions, https, function (response) {
            callback(response.accessToken);
        }, errorCallback);
    };

    exports.getPreferences = function (config, serviceToken, callback, errorCallback) {
        var encodedOrg = encodeURIComponent(config.organizationId), globalPreferences = {}, that = this;
        var getOptions = {
            hostname: config.restConfig.preferencesService.host,
            path: config.restConfig.preferencesService.path + encodedOrg,
            method: 'GET',
            rejectUnauthorized: false,
            headers: {
                'Authorization': 'Bearer ' + serviceToken,
                'Content-Type': 'application/json'
            }
        };

        that.sendRequest(getOptions, https, function (response) {
            globalPreferences.lastModifiedPreferences = response.lastModified;
            globalPreferences.organizationPreferences = response.preferences;
            callback(globalPreferences);
        }, errorCallback);
    };

    exports.splitKeyValue = function(keyValue){
        var preferenceObj = {
            name : "",
            key : ""
        }, lastIndex;
        var index = keyValue.indexOf(' '), j, i;
        var additionalIndex = keyValue.indexOf('\t');
        if(additionalIndex !== -1 && (additionalIndex < index || index === -1)){
            index = additionalIndex;
        }
        if(index !== -1){
            preferenceObj.name = keyValue.substring(1, index-1);
            for(i = index; i < keyValue.length; i++) {
                if(keyValue[i] !== ' ' && keyValue[i] !== '\t'){
                    if(keyValue.indexOf('//') !== -1 && keyValue.indexOf('//') > i){
                        lastIndex = keyValue.indexOf('//');
                    }else{
                        lastIndex = keyValue.length;
                    }
                    preferenceObj.key = keyValue.substring(i, lastIndex).trim().replace(/;/g,'');
                    return preferenceObj;
                }
            }
        }
    };

    exports.getVariables = function(config){
        Array.prototype.remove = function (from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        };
        var globalPreferences, content;
        var preferences = [];
        var i = 0, preference;
        content = fs.readFileSync(__dirname + '/../' + config.path);
        globalPreferences = content.toString().split('\n');

        while (i < globalPreferences.length)
        {
            if(globalPreferences[i] !== '' &&
                globalPreferences[i].indexOf('//') !== 0 &&
                globalPreferences[i] !== '\r' &&
                globalPreferences[i] !== '\r\n' &&
                globalPreferences[i] !== '\n') {
                preference = this.splitKeyValue(globalPreferences[i]);
                preferences.push(preference);
                i++;
            }
            else{
                globalPreferences.remove(i);
            }
        }

        return preferences;
    };

    exports.getNewPreferences = function(preferences, globalPreferences){
        var i, newPreferences = {};
        for(i = 0; i < preferences.length; i++){
            if(!globalPreferences[preferences[i].name]){
                newPreferences[preferences[i].name] = preferences[i].key;
            }
        }

        return newPreferences;
    };
    exports.convertListToObject = function(list){
        var result = {}, i;
        for(i = 0; i < list.length; i++){
            result[list[i].name] = list[i].key;
        }

        return result;
    };

    exports.saveResults = function(preferences, newPreferences, changedPreferences){
        if(!fs.existsSync(outFolderPath)){
            fs.mkdir(outFolderPath);
        }
        fs.writeFileSync(outFolderPath + 'bootstrap-style.json', JSON.stringify(preferences));
        fs.writeFileSync(outFolderPath + 'new-bootstrap-style.json', JSON.stringify(newPreferences));
        fs.writeFileSync(outFolderPath + 'changed-bootstrap-style.json', JSON.stringify(changedPreferences));
    };

    exports.getChangedPreferences = function(preferences, globalPreferences){
        var i, changedPreferences = {};
        for(i = 0; i < preferences.length; i++){
            if(globalPreferences[preferences[i].name] && preferences[i].key !== globalPreferences[preferences[i].name]){
                changedPreferences[preferences[i].name] = preferences[i].key;
            }
        }

        return changedPreferences;
    };
}());