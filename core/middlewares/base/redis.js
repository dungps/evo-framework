const redis = require("redis");
const _ = require("lodash");
const configs = require("../../configs");

module.exports = (req, res, next) => {
  req.redis = {};
  if (configs.redis) {
    const client = redis.createClient(configs.redis);

    req.redis = {
      get: async (key, defaultValue = false) => {
        let data = false;
        try {
          data = await client.get(key);
        } catch (e) {
          return defaultValue;
        }

        return data ? data : defaultValue;
      },
      set: async (key, data, group = "ex", expires) => {
        return await client.set(key, JSON.stringify(data), group, expires);
      },
      client: client
    };
  }

  next();
};
