/**
 * Created by Ruslan_Dulina on 1/20/2015.
 */
(function () {
    'use strict';
    var generator = require("./src/jsonGenerator");
    var t = generator.readConfiguration();
    generator.getToken(t, function(token){
        generator.getPreferences(t, token, function(globalPreferencesResponse){
            var globalPreferences = globalPreferencesResponse.organizationPreferences;
            var preferences = generator.getVariables(t);
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