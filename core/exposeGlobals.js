module.exports = () => {
  return new Promise(resolve => {
    const evo = {};

    const configs = require("./configs");
    const i18n = require("./i18n");

    evo.configs = configs;
    evo.database = require("./database");
    evo.i18n = i18n;
    evo.bookshelf = require("./database/model");
    evo.mail = require("./mail");
    evo.tpls = require("./views");
    evo.log = require("./logs");

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
    global["_"] = require("lodash");
    global["util"] = require("util");
    global["moment"] = require("moment");
    global["validator"] = require("validator");

    resolve();
  });
};
