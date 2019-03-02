module.exports = function() {
  try {
    require("../core")();
  } catch (e) {
    console.log(e);
  }
};
