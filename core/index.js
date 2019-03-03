const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const exposeGlobals = require("./exposeGlobals");
const server = require("./server");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

if (process.env.NODE_ENV == "development") {
  if (fs.existsSync(path.resolve(process.cwd(), ".env.development"))) {
    dotenv.config({
      path: path.resolve(process.cwd(), ".env.development")
    });
  }
}

module.exports = async () => {
  return exposeGlobals()
    .then(server)
    .catch(err => {
      throw err;
    });
};
