const express = require("express");
const http = require("http");
const configs = require("./configs");
const routes = require("./routes");
const middlewares = require("./middlewares");
const policies = require("./policies");
const i18n = require("./i18n");

const app = express();

module.exports = async () => {
  middlewares.load(app);
  policies.load(app);

  // Add documentation page for development
  app.use("/", routes);

  app.use((req, res, next) => {
    const err = new Error(i18n.t("errors.notFound"));

    err.errCode = 404;
    err.responseType = "json";

    next(err);
  });

  app.use((err, req, res, next) => {
    const statusCode = err.errCode || 500;

    res.status(statusCode);

    if (err && err.responseType && err.responseType != "json") {
      return res.send(err.message);
    }

    return res.json({
      error: true,
      message: err.message
    });
  });

  const server = http.createServer(app);

  server.listen(configs.server.port, configs.server.host, function() {
    console.log(
      `App is running at ${configs.server.host}:${configs.server.port}`
    );
  });
};
