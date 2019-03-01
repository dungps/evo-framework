const path = require("path");
const fs = require("fs");
const async = require("async");
const _ = require("lodash");
const configs = require("../configs");

function Policies() {
  this.app = null;
}

Policies.prototype.load = function(app) {
  this.loadSelfPolicies(app);

  return app;
};

Policies.prototype.loadSelfPolicies = function(app) {
  app.use((req, res, next) => {
    const index = _.findIndex(configs.routes, ["path", req.path]);

    if (index > -1 && configs.routes[index]) {
      const route = configs.routes[index];

      if (route.policies) {
        let policies = route.policies;

        if (_.isString(policies)) {
          policies = [policies];
        }

        async.forEachOf(
          policies,
          (value, key, callback) => {
            const pathToPolicies = path.resolve(
              configs.policiesPath,
              value + ".js"
            );

            if (fs.lstatSync(pathToPolicies).isFile()) {
              require(pathToPolicies)(req, res, callback);
            }
          },
          err => {
            if (err) return next(err);

            next();
          }
        );
      }
    }

    next();
  });
};

module.exports = new Policies();
