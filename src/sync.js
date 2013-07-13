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

    console.log('options');
    console.log(options);
    var key_suffix = options['key_suffix'];
    var single = false;
    var key_name = null;
    if (method == 'read') {
      // Model might be a collection in this case
      if (model.class_name) {
        single = true;
        key_name = model.class_name;
      } else {
        key_name = model.model.prototype.class_name;
      }
    } else {
      key_name = model.class_name;
    }

    if (key_suffix) {
      key_name = key_name + key_suffix;
    }
    console.log(key_name, 'key_name');

    chrome.storage.local.get(singleton(key_name, []), function(array) {
      array = array[key_name];
      /*
      var error = chrome.runtime.lastError;
      if (error || array == undefined) {
        array = [];
      }
      */
      console.log(method);
      if (method == 'create') {
        array.push(JSON.stringify(model));
        chrome.storage.local.set(singleton(key_name, array), function() {
          if (options.success) {
            options.success(model, null, options);
          }
        });
      } else if (method == 'read') {
        if (options.success) {
          var models = _.map(array, function (m) {
            return JSON.parse(m);
          });
          if (single) {
            var found = null;
            for (var i = 0; i < array.length; i++) {
              var json_model = JSON.parse(array[i]);
              if (json_model['id'] == model.get('id')) {
                found = json_model;
                break;
              }
            }
            if (found) {
              options.success(found);
            } else {
              options.error_msg = 'Could not fetch single model';
              options.error(model, null, options);
            }
          } else {
            options.success(models);
          }
        }
      } else if (method == 'update') {
        var found = false;
        for (var i = 0; i < array.length; i++) {
          var json_model = JSON.parse(array[i]);
          if (json_model['id'] == model.get('id')) {
            array[i] = JSON.stringify(model);
            found = true;
            break;
          }
        }
        if (found) {
          chrome.storage.local.set(singleton(key_name, array), function() {
            options.success();
          });
        } else {
          array.push(JSON.stringify(model));
          chrome.storage.local.set(singleton(key_name, array), function() {
            if (options.success) {
              options.success();
            }
          });
        }
      } else if (method == 'delete') {
        var found = false;
        for (var i = 0; i < array.length; i++) {
          if (array[i]['id'] == model.get('id')) {
            array.splice(i, 1);
            found = true;
            break;
          }
        }
        if (found) {
          chrome.storage.local.set(singleton(key_name, array), function() {
            options.success();
          });
        } else {
          options.error_msg = 'Model not found for deletion';
          options.error(model, null, options);
        }
      }
    });
  };

})(window);
