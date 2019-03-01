#!/usr/bin/env node

const _ = require("lodash");
const program = require("commander");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const evoPackageJson = require("../package.json");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

if (process.env.NODE_ENV == "development") {
  if (fs.existsSync(path.resolve(process.cwd(), ".env.development"))) {
    dotenv.config({
      path: path.resolve(process.cwd(), ".env.development")
    });
  }
}

const usage = program.Command.prototype.usage;
program.Command.prototype.usage = program.usage = function() {
  program.commands = _.reject(program.commands, {
    _name: "*"
  });
  return usage.apply(this, Array.prototype.slice.call(arguments));
};

program.Command.prototype.versionInformation = program.versionInformation = function() {
  program.emit("version");
};

program.version(evoPackageJson.version, "-v", "--version");

process.argv = _.map(process.argv, function(arg) {
  return arg === "-V" ? "-v" : arg;
});

program
  .command("version")
  .description("")
  .action(program.versionInformation);

program.command("migrate:make [name]").action(require("./evo-migrate-make"));
program.command("migrate:latest").action(require("./evo-migrate-latest"));
program.command("migrate:rollback").action(require("./evo-migrate-rollback"));

program
  .command("start")
  .option("--prod", "Start in production")
  .action(require("./evo-start"));

program.parse(process.argv);
const NO_COMMAND_SPECIFIED = program.args.length === 0;

if (NO_COMMAND_SPECIFIED) {
  program.help();
}
