const redis = require("redis");
const util = require("util");
const configs = require("../../configs");

module.exports = (req, res, next) => {
  req.redis = {};
  if (configs.redis) {
    const client = redis.createClient(configs.redis);

    const getAsync = util.promisify(client.get).bind(client);
    const setAsync = util.promisify(client.set).bind(client);

    req.redis = {
      get: async (key, defaultValue = false) => {
        let data = false;
        try {
          data = await getAsync(key);
        } catch (e) {
          return defaultValue;
        }

        return data ? data : defaultValue;
      },
      set: async (key, data, group = "ex", expires) => {
        return await setAsync(key, JSON.stringify(data), group, expires);
      },
      client: client
    };
  }

  next();
};
