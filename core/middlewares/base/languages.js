const i18n = require("../../i18n");

module.exports = (req, res, next) => {
  const code = req.headers["accept-language"] || "en";

  i18n.setLanguageCode(code);

  next();
};
