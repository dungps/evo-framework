const _ = require("lodash");
const crypto = require("crypto");

/**
 * Exports a plugin to pass into the bookshelf instance, i.e.:
 *
 *      import config from './knexfile';
 *      import knex from 'knex';
 *      import bookshelf from 'bookshelf';
 *      import redisCache from 'bookshelf-redis-cache';
 *
 *      const ORM = bookshelf(knex(config));
 *
 *      ORM.plugin(redisCache);
 *
 *      export default ORM;
 *
 * The plugin attaches two instances methods to the bookshelf
 * Model object: fetchCache and fetchAllCache
 *
 * Model#fetchCache tries to retrieve the data from Redis database,
 * else it calls fetch method with the exact same options.
 *
 * Model#fetchAllCache tries to retrieve the data from Redis database,
 * else it calls the fetchAll method with the exact same options.
 *
 * See methods below for details.
 *
 */

module.exports = (bookshelf, settings) => {
  /**
   * @method Model#retrieveCache
   * @belongsTo Model
   *
   * Generic method that fetch data from Redis database first, then calls
   * the {@link Model#fetch}/{@link Model#fetchAll} methods.
   *
   * Any options that may be passed to {@link Model#fetch} or {@link Model#fetchAll} may also be passed
   * in the options to this method.
   *
   * To perform pagination, you may include *either* an `offset` and `limit`, **or**
   * a `page` and `pageSize`.
   *
   * @example
   *
   * Car
   * .forge(params)
   * .fetchCache({
   *   cacheKey: 'car_fetch',
   *   withRelated: ['engine']
   * })
   * .orderBy('-productionYear') // Same as .orderBy('cars.productionYear', 'DESC')
   * .then(function (results) {
   *    console.log(results); // Paginated results object with metadata example below
   * })
   *
   * @param options {object}
   *    The fetching options, plus any additional options that will be passed to
   *    {@link Model#fetch} or {@link Model#fetchAll}
   *    The serial key is required. It has to be unique. This key will be used to store the record
   *    in the Redis database.
   * @param method {string}
   *    The method option is the name of the method. It could be fetch or fetchAll. Nothing else.
   * @returns {Promise<Model|null>}
   */

  const { instance: cacheInstance } = settings;

  async function retrieveCache(options, method) {
    const {
      cacheKey,
      expired = 60 * 60, // Lưu cache trong 1 tiếng
      group
    } = options;

    delete options.cacheKey;
    delete options.expired;
    delete options.group;

    if (!cacheKey) {
      return await this[method](options);
    }

    return cacheInstance.get(cacheKey).then(async result => {
      if (result === null) {
        const cache = await this[method](options).then(data =>
          data === null ? null : data.toJSON()
        );

        cacheInstance.set(cacheKey, JSON.stringify(cache), group, expired);

        return {
          toJSON: () => cache
        };
      }

      return {
        toJSON: () => JSON.parse(result)
      };
    });
  }

  async function md5(key, data) {
    const md5sum = crypto.createHash("md5");

    const dataObj =
      _.isArray(data) || _.isObject(data) ? JSON.stringify(data) : data;

    md5sum.update(`${key}_${dataObj}`);

    return md5sum.digest("hex");
  }

  bookshelf.Model.prototype.fetchAllCache = function(options) {
    return retrieveCache.apply(this, [options, "fetchAll"]);
  };

  bookshelf.Model.fetchAllCache = function(...args) {
    return this.forge().retrieveCache(...args, "fetchAll");
  };

  bookshelf.Collection.prototype.fetchAllCache = function(...args) {
    return bookshelf.Model.fetchAllCache.apply(this.model.forge(), ...args);
  };

  bookshelf.Model.prototype.fetchPageCache = function(options) {
    return retrieveCache.apply(this, [options, "fetchPage"]);
  };

  bookshelf.Model.fetchPageCache = function(...args) {
    return this.forge().retrieveCache(...args, "fetchPage");
  };

  bookshelf.Collection.prototype.fetchPageCache = function(...args) {
    return retrieveCache.apply(this.model.forge(), ...args);
  };

  bookshelf.Model.prototype.fetchCache = function(options) {
    return retrieveCache.apply(this, [options, "fetch"]);
  };

  bookshelf.Model.fetchCache = function(...args) {
    return this.forge().retrieveCache(...args, "fetch");
  };

  bookshelf.Collection.prototype.fetchCache = function(...args) {
    return bookshelf.Model.fetchCache.apply(this.model.forge(), ...args);
  };
};
