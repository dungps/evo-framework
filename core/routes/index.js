const _ = require("lodash");
const router = require("express").Router();
const i18n = require("../i18n");
const configs = require("../configs");
const logger = require("../logs");

if (configs.routes && _.isObject(configs.routes)) {
  if (configs.routes && _.isArray(configs.routes)) {
    configs.routes.forEach(function(options) {
      router.route(options.path)[options.method](async (req, res, next) => {
        try {
          return await require(options.controller)(req, res, next);
        } catch (e) {
          if (process.env.NODE_ENV === "production") {
            logger.error(
              JSON.stringify({
                message: e.message,
                stack: e.stack
              })
            );
          } else {
            console.log(e);
          }

          const err = new Error(i18n.t("errors.anErrorOccurred"));

          err.errCode = 500;
          err.responseType = "json";

          return next(err);
        }
      });
    });
  }
}

module.exports = router;
