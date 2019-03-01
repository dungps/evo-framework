const exposeGlobals = require("./exposeGlobals");
const server = require("./server");

module.exports = async () => {
  return exposeGlobals()
    .then(server)
    .catch(err => {
      throw err;
    });
};
