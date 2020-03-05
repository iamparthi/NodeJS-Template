/*jslint node:true*/
let Lang = function() {
  "use strict";
  let loadLangFile,
  path = require('path');
  // Function to load the Language based on User preferred language
  loadLangFile = function getPort(whichLang) {
    let fileName, langData;
    whichLang = (whichLang ? whichLang.toLowerCase() : "en-us") + ".json";
    fileName = "lang_" + whichLang.toLowerCase();
    langData = require(path.resolve('.') + '/lang/' + fileName) || {};
    return langData;
  };
  return {
    load: loadLangFile
  };
};
module.exports = new Lang();
