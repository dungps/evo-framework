/**
 * @see https://github.com/TryGhost/Ghost/blob/master/core/server/models/plugins/pagination.js
 */

const _ = require("lodash");

const defaults = {
  page: 1,
  limit: 10
};

const parseOptions = function(options) {
  options = _.defaults(options || {}, defaults);

  if (options.limit !== "all") {
    options.limit = parseInt(options.limit, 10) || defaults.limit;
  }

  options.page = parseInt(options.page, 10) || defaults.page;

  return options;
};

const addLimitAndOffset = function(model, options) {
  if (_.isNumber(options.limit)) {
    model
      .query("limit", options.limit)
      .query("offset", options.limit * (options.page - 1));
  }
};

/**
 * ### Pagination Object
 * @typedef {Object} pagination
 * @property {Number} page - page in set to display
 * @property {Number|String} limit - no. results per page, or 'all'
 * @property {Number} pages - total no. pages in the full set
 * @property {Number} total - total no. items in the full set
 * @property {Number|null} next - next page
 * @property {Number|null} prev - previous page
 */

/**
 * Fetch Page Options
 * @typedef {Object} options
 * @property {Number} page - page in set to display
 * @property {Number|String} limit - no. results per page, or 'all'
 * @property {Object} order - set of order by params and directions
 */

/**
 * ### Fetch Page Response
 * @typedef {Object} paginatedResult
 * @property {Array} collection \- set of results
 * @property {pagination} pagination \- pagination metadata
 */

/**
 * ## Pagination
 * Extends `bookshelf.Model` with `fetchPage`
 * @param {Bookshelf} bookshelf \- the instance to plug into
 */
const pagination = function(bookshelf) {
  _.extend(bookshelf.Model.prototype, {
    /**
     * ### Fetch page
     *
     * @param options
     * @returns {paginatedResult} set of results + pagination metadata
     */
    fetchPage: function(options) {
      options = parseOptions(options);

      const tableName = _.result(this.constructor.prototype, "tableName");
      const idAttribute = _.result(this.constructor.prototype, "idAttribute");
      const self = this;
      const countPromise = this.query()
        .clone()
        .select(
          bookshelf.knex.raw(
            `count(distinct ${tableName}.${idAttribute}) as aggregate`
          )
        );

      return countPromise
        .then(function(countResult) {
          addLimitAndOffset(self, options);

          if (options.order && !_.isEmpty(options.order)) {
            _.forOwn(options.order, function(direction, property) {
              self.query("orderBy", `${tableName}.${property}`, direction);
            });
          } else if (options.orderRaw) {
            self.query(function(qb) {
              qb.orderByRaw(options.orderRaw);
            });
          }

          if (options.groups && !_.isEmpty(options.groups)) {
            _.each(options.groups, function(group) {
              self.query("groupBy", group);
            });
          }

          return self
            .fetchAll(_.omit(options, ["page", "limit"]))
            .then(function(fetchResult) {
              return {
                collection: fetchResult,
                pagination: formatResponse(
                  countResult[0] ? countResult[0].aggregate : 0,
                  options
                )
              };
            })
            .catch(function(err) {
              if (err.errno === 20 || err.errno === 1064) {
                // throw new
              }

              throw err;
            });
        })
        .catch(function(err) {
          throw err;
        });
    }
  });
};

/**
 * Export pagination plugin
 * @api public
 */
module.exports = pagination;
