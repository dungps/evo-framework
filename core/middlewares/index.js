const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const compression = require("compression");
const skipper = require("skipper");
const configs = require("../configs");
const base = require("./base");
const logger = require("../logs");

function Middleware() {
  this.app = null;
}

Middleware.prototype.loadSelfMiddleWare = function(app) {
  const files = fs.readdirSync(configs.middlewaresPath);

  if (files.length > 0) {
    files.forEach(file => {
      const filePath = path.resolve(configs.middlewaresPath, file);
      if (fs.lstatSync(filePath).isFile() && file.indexOf(".js") > 0)
        app.use(require(filePath));
    });
  }
};

Middleware.prototype.load = function(app) {
  const self = this;

  app.use(bodyParser.json());

  app.use(
    bodyParser.urlencoded({
      extended: false
    })
  );

  app.use(skipper());

  // if (process.env.NODE_ENV === "development") {
  app.use(
    require("morgan")("combined", {
      stream: logger
    })
  );
  // }

  if (process.env.NODE_ENV === "production") {
    app.use(compression());
  }

  self.loadCoreMiddeware(app);
  self.loadSelfMiddleWare(app);

  return app;
};

Middleware.prototype.loadCoreMiddeware = function(app) {
  app.use(base.headers);
  app.use(base.languages);
};

module.exports = new Middleware();
