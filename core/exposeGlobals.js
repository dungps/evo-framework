const _ = require("lodash");
const util = require("util");
const moment = require("moment");
const validator = require("validator");
const database = require("./database");
const i18n = require("./i18n");
const model = require("./database/model");
const mail = require("./mail");
const tpls = require("./views");
const configs = require("./configs");
const log = require("./logs");

module.exports = () => {
  return new Promise(resolve => {
    const evo = {};

    evo.configs = configs;
    evo.database = database;
    evo.i18n = i18n;
    evo.bookshelf = model;
    evo.mail = mail;
    evo.tpls = tpls;
    evo.log = log;

    /**
     *
     * @param message - error message
     * @param options - more response
     * @returns {Error}
     */
    evo.error = function(messagePath, options = {}) {
      let err = new Error(i18n.t(messagePath));

      err = _.assign(err, options);

      return err;
    };

    if (configs.globals && _.isObject(configs.globals)) {
      for (let i in configs.globals) {
        global[i] = configs.globals[i];
      }
    }

    global["evo"] = evo;
    global["_"] = _;
    global["util"] = util;
    global["moment"] = moment;
    global["validator"] = validator;

    resolve();
  });
};
