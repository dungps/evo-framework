const path = require("path");
const fs = require("fs");
const _ = require("lodash");

function Configuration() {
  this.rootPath = process.cwd();
  this.controllerPath = path.resolve(this.rootPath, "api", "controllers");
  this.policiesPath = path.resolve(this.rootPath, "api", "policies");
  this.helpersPath = path.resolve(this.rootPath, "api", "helpers");
  this.tplsPath = path.resolve(this.rootPath, "tpls");
  this.middlewaresPath = path.resolve(this.rootPath, "api", "middlewares");
  this.configsPath = path.resolve(this.rootPath, "configs");
  this.localesPath = path.resolve(this.rootPath, "locales");
  this.logsPath = path.resolve(this.rootPath, "storages", "logs");

  this.globals = {};

  this.load();
  this.loadProduction();
  this.parseRoutes();
  this.parseDatabaseConfig();
  this.parseHelpers();
}

Configuration.prototype.load = function() {
  const self = this;
  const files = fs.readdirSync(this.configsPath);

  if (files.length > 0) {
    files.forEach(file => {
      const filePath = path.resolve(this.configsPath, file);
      if (fs.lstatSync(filePath).isFile())
        self[file.replace(".js", "")] = require(filePath);
    });
  }
};

Configuration.prototype.loadProduction = function() {
  if (process.env.NODE_ENV !== "production") return;

  const self = this;

  const files = fs.readdirSync(path.resolve(this.configsPath, "productions"));

  if (files.length > 0) {
    files.forEach(file => {
      if (file.indexOf(".js") === -1) return;
      const filePath = path.resolve(this.configsPath, file);
      if (fs.lstatSync(filePath).isFile())
        self[file.replace(".js", "")] = require(filePath);
    });
  }
};

Configuration.prototype.parseRoutes = function() {
  const self = this;

  if (self.routes && _.isObject(self.routes)) {
    this.routes = _.map(self.routes, (controller, routePath) => {
      const pathSplit = routePath.split(" ");
      let appPath = routePath;
      let method = "get";
      let appController = controller;

      if (pathSplit.length > 1) {
        method = pathSplit[0];
        appPath = pathSplit[1];
      }

      let data = {};

      if (_.isString(appController)) {
        data.controller = appController;
      } else if (_.isObject(appController)) {
        data = _.assign(data, appController);
      }

      data.path = appPath;
      data.method = method;

      if (_.isString(data.controller)) {
        const pathToController = path.resolve(
          self.controllerPath,
          data.controller + ".js"
        );

        data.controller = pathToController;
      }

      return data;
    });
  }
};

Configuration.prototype.parseDatabaseConfig = function() {
  if (this.database) {
    this.database.migrations = {
      directory: path.resolve(this.rootPath, "databases", "migrations")
    };

    this.database.seeds = {
      directory: path.resolve(this.rootPath, "databases", "seeds")
    };
  }
};

Configuration.prototype.parseHelpers = function() {
  const self = this;
  const files = fs.readdirSync(this.helpersPath);

  if (files && files.length > 0) {
    files.forEach(file => {
      const fileToPath = path.resolve(self.helpersPath, file);
      if (fs.lstatSync(fileToPath).isFile() && file.indexOf(".js") > -1) {
        this.globals[file.replace(".js", "")] = require(fileToPath);
      }
    });
  }
};

const configuration = new Configuration();

module.exports = configuration;
