(function(exports) {
  var classNameMap = {
    OTRUser: OTRUser,
    OTRFriend: OTRFriend,
    Message: Message
  };

  function singleton(key, value) {
    var obj = {};
    obj[key] = value;
    return obj;
  }

  Backbone.sync = function(method, model, options) {
    // method is one of ("create", "read", "update", or "delete")

    var single = false;
    var class_name = null;
    if (method == 'read') {
      // Model might be a collection in this case
      if (model.class_name) {
        single = true;
        class_name = model.class_name;
      } else {
        class_name = model.model.prototype.class_name;
      }
    } else {
      class_name = model.class_name;
    }

    chrome.storage.local.get(singleton(class_name, []), function(array) {
      array = array[class_name];
      /*
      var error = chrome.runtime.lastError;
      if (error || array == undefined) {
        array = [];
      }
      */
      console.log(method);
      if (method == 'create') {
        array.push(JSON.stringify(model));
        chrome.storage.local.set(singleton(class_name, array), function() {
          if (options.success) {
            options.success(model, null, options);
          }
        });
      } else if (method == 'read') {
        if (options.success) {
          var models = _.map(array, function (m) {
            return JSON.parse(m);
            //return new classNameMap[class_name](m);
          });
          if (single) {
            if (models.length > 0) {
              options.success(models[0], null, options);
            } else {
              options.error_msg = 'Could not fetch single model';
              options.error(model, null, options);
            }
          } else {
            model.models = models; // Update collection
            options.success(model, null, options);
          }
        }
      } else if (method == 'update') {
        var found = false;
        for (var i = 0; i < array.length; i++) {
          if (array[i]['fp'] == model.get('fp')) {
            array[i] = JSON.stringify(model);
            found = true;
            break;
          }
        }
        if (found) {
          chrome.storage.local.set(singleton(class_name, array), function() {
            success(model, null, options);
          });
        } else {
          array.push(JSON.stringify(model));
          chrome.storage.local.set(singleton(class_name, array), function() {
            if (options.success) {
              options.success(model, null, options);
            }
        });
        }
      } else if (method == 'delete') {
        var found = false;
        for (var i = 0; i < array.length; i++) {
          if (array[i]['fp'] == model.get('fp')) {
            array.splice(i, 1);
            found = true;
            break;
          }
        }
        if (found) {
          chrome.storage.local.set(singleton(class_name, array), function() {
            success(model, null, options);
          });
        } else {
          options.error_msg = 'Model not found for deletion';
          error(model, null, options);
        }
      }
    });
  };

})(window);
