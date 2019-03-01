const configs = require("../../configs");

module.exports = (req, res, next) => {
  res.append("Access-Control-Allow-Origin", configs.security.allowOrigins);
  res.append(
    "Access-Control-Allow-Methods",
    configs.security.allowRequestMethods
  );
  res.append(
    "Access-Control-Allow-Headers",
    configs.security.allowRequestHeaders
  );
  next();
};
