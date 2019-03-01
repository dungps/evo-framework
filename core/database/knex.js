const knex = require("knex");
const configs = require("../configs");

module.exports = knex(configs.database);
