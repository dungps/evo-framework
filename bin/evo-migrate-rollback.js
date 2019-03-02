const knex = require("../core/database");

module.exports = function() {
  knex.migrate
    .rollback()
    .then(log => {
      console.log(log);
    })
    .catch(e => {
      console.log(e);
    });
};
