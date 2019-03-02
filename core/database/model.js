const _ = require("lodash");
const bookshelf = require("bookshelf");
const uuid = require("uuid/v1");
const events = require("../events");
const knex = require("./knex");
const plugins = require("./plugins");

let appBookshelf, proto;

// Khởi tạo một Bookshelf mới gọi là appBookshelf để có thể tái sử dụng ở những nơi khác trong ứng dụng
appBookshelf = bookshelf(knex);

/**
 * Thêm plugin Registry của Bookshelf
 * @see https://github.com/bookshelf/bookshelf/wiki/Plugin:-Model-Registry
 */
appBookshelf.plugin("registry");

// Thêm plugin pagination cho Bookshelf, nó sẽ cung cấp thêm method `fetchPage` cho Models
appBookshelf.plugin(plugins.pagination);

// Cache lại instance của Model prototype
proto = appBookshelf.Model.prototype;

// Base model của ứng dụng
// cung cấp thêm một số function tiện ích như một thuộc tính tĩnh trong Models
appBookshelf.Model = appBookshelf.Model.extend({
  // xử lý `created_at` và `updated_at`
  hasTimestamps: true,

  emitChange: function(model, event, options) {
    const _emit = (modelEvent, model) => {
      if (!model.wasChanged()) {
        return;
      }

      events.emit(modelEvent, model, _.omit(options, "transacting"));
    };

    if (!options.transacting) {
      return _emit(event, model, options);
    }

    if (!model.modelEvents) {
      model.modelEvents = [];

      options.transacting.once("committed", committed => {
        if (!committed) {
          return;
        }

        _.each(this.modelEvents, modelEvent => {
          _emit(modelEvent, model, options);
        });

        delete model.modelEvents;
      });
    }

    model.modelEvents.push(event);
  },

  initialize: function() {
    const self = this;

    this.on("saving", function(newObj, attrs, options) {
      if (options.method == "insert") {
        if (_.isUndefined(newObj.id) || _.isNull(newObj.id)) {
          newObj.setId();
        }
      }
    });

    [
      ("fetching",
      "fetching:collection",
      "fetched",
      "fetched:collection",
      "creating",
      "created",
      "updating",
      "updated",
      "destroying",
      "destroyed",
      "saving",
      "saved")
    ].forEach(function(eventName) {
      let functionName = "on" + eventName[0].toUpperCase() + eventName.slice(1);

      if (functionName.indexOf(":") !== -1) {
        functionName =
          functionName.slice(0, functionName.indexOf(":")) +
          functionName[functionName.indexOf(":") + 1].toUpperCase() +
          functionName.slice(functionName.indexOf(":") + 2);
        functionName = functionName.replace(":", "");
      }

      if (!self[functionName]) {
        return;
      }

      self.on(eventName, self[functionName]);
    });

    // @NOTE: Hãy giữ lại
    proto.initialize.call(this);
  },

  onCreating: function(model) {
    if (!model.get("created_at")) {
      model.set("created_at", new Date());
    }

    if (!model.get("updated_at")) {
      model.set("updated_at", new Date());
    }
  },

  onUpdating: function(model) {
    model.set("updated_at", new Date());
  },

  wasChanged: function() {
    if (!this.changed) {
      return true;
    }

    if (!Object.keys(this.changed).length) {
      return false;
    }

    return true;
  },

  // generate unique id
  setId: function() {
    const self = this;
    this.set("id", uuid(self.toJSON()));
  }
});

module.exports = appBookshelf;
