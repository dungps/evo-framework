module.exports = function(cmd) {
  try {
    require("../core")();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};
