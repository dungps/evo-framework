const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const configs = require("../configs");

function Template() {}

Template.prototype.getTemplate = function(tplPath) {
  const pathToTpl = path.resolve(configs.tplsPath, tplPath);

  if (fs.lstatSync(pathToTpl).isFile()) {
    return fs.readFileSync(pathToTpl, {
      encoding: "utf-8"
    });
  }

  return "";
};

Template.prototype.render = function(tplPath, data = {}) {
  const content = this.getTemplate(tplPath);

  return ejs.render(content, data);
};

module.exports = new Template();
