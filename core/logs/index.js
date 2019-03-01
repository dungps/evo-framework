const path = require("path");
const winston = require("winston");
const configs = require("../configs");

function Logger() {
  this.logger = null;
  this.access = null;

  this.setUpLogger();
}

Logger.prototype.setUpLogger = function() {
  this.logger = winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: path.resolve(configs.logsPath, "error.log"),
        format: winston.format.json()
      })
    ]
  });

  this.access = winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: path.resolve(configs.logsPath, "access.log"),
        format: winston.format.simple()
      })
    ]
  });
};

Logger.prototype.log = function(msg, level = "error") {
  this.logger.log({
    level: level,
    message: msg
  });
};

Logger.prototype.error = function(msg) {
  this.log(msg, "error");
};

Logger.prototype.info = function(msg) {
  this.log(msg, "info");
};

Logger.prototype.write = function(msg) {
  this.access.log({
    level: "info",
    message: msg
  });
};

module.exports = new Logger();
