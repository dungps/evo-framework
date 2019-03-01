const knex = require("../core/database");

module.exports = function(name, cmd) {
  knex.migrate
    .make(name)
    .then(log => {
      console.log(log);
    })
    .catch(e => {
      console.log(e);
    });
};
