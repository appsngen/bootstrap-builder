/**
 * Created by Ruslan_Dulina on 1/20/2015.
 */
(function () {
    'use strict';
    var generator = require("./src/diffPrefsGenerator");
    var config = generator.readConfiguration();
    generator.getToken(config, function(token){
        generator.getPreferences(config, token, function(globalPreferencesResponse){
            var globalPreferences = globalPreferencesResponse.organizationPreferences;
            var preferences = generator.getVariables(config);
            var newPreferences = generator.getNewPreferences(preferences, globalPreferences);
            var changedPreferences = generator.getChangedPreferences(preferences, globalPreferences);
            preferences = generator.convertListToObject(preferences);
            generator.saveResults(preferences, newPreferences, changedPreferences)
        }, function(error){
            console.log(error);
        })
    }, function(error){
        console.log(error);
    })
}());