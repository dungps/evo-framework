const path = require("path");
const fs = require("fs");
const jp = require("jsonpath");
const configs = require("../configs");

function i18n() {
  this.code = "en";
}

i18n.prototype.setLanguageCode = function(code) {
  this.code = code;
};

i18n.prototype.t = function(msgPath) {
  const pathToFile = path.resolve(configs.localesPath, this.code + ".json");
  let coreString;
  if (fs.existsSync(pathToFile)) {
    coreString = require(pathToFile);
  } else {
    coreString = require(path.resolve(configs.localesPath, "en.json"));
  }

  return jp.value(coreString, msgPath);
};

module.exports = new i18n();
