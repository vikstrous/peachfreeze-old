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

  Backbone.sync = function(method, query_model, options) {
    // method is one of ("create", "read", "update", or "delete")

    console.log('options');
    console.log(options);
    var key_suffix = options['key_suffix'];
    var single = false;
    var key_name = null;
    if (method == 'read') {
      // Model might be a collection in this case
      if (query_model.class_name) {
        single = true;
        key_name = query_model.class_name;
      } else {
        key_name = query_model.model.prototype.class_name;
      }
    } else {
      key_name = query_model.class_name;
    }

    if (key_suffix) {
      key_name = key_name + key_suffix;
    }
    console.log(key_name + ' ' + method, 'SYNC OP');
    console.log(query_model, 'SYNC OP data');

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
        array.push(JSON.stringify(query_model));
        chrome.storage.local.set(singleton(key_name, array), function() {
          console.log('return nothing');
          options.success();
        });
      } else if (method == 'read') {
        var models_data = _.map(array, function(m) {
          return JSON.parse(m);
        });
        console.log(array, 'ARRAY');
        console.log(models_data, 'ARRAY');
        if (single) {
          var found = null;
          var json_model;
          for (var i = 0; i < array.length; i++) {
            json_model = JSON.parse(array[i]);
            if (json_model['id'] == query_model.get('id')) {
              found = json_model;
              break;
            }
          }
          if (found) {
            console.log('return nothing');
            options.success(json_model);
          } else {
            options.error_msg = 'Could not fetch single model';
            options.error(query_model, null, options);
          }
        } else {
          console.log('return models');
          options.success(models_data);
        }
      } else if (method == 'update') {
        var found = false;
        for (var i = 0; i < array.length; i++) {
          var json_model = JSON.parse(array[i]);
          if (json_model['id'] == query_model.get('id')) {
            array[i] = JSON.stringify(query_model);
            found = true;
            break;
          }
        }
        if (found) {
          chrome.storage.local.set(singleton(key_name, array), function() {
            console.log('return nothing');
            options.success();
          });
        } else {
          array.push(JSON.stringify(query_model));
          chrome.storage.local.set(singleton(key_name, array), function() {
            console.log('return nothing');
            options.success();
          });
        }
      } else if (method == 'delete') {
        var found = false;
        for (var i = 0; i < array.length; i++) {
          if (array[i]['id'] == query_model.get('id')) {
            array.splice(i, 1);
            found = true;
            break;
          }
        }
        if (found) {
          chrome.storage.local.set(singleton(key_name, array), function() {
            console.log('return nothing');
            options.success();
          });
        } else {
          options.error_msg = 'Model not found for deletion';
          options.error(query_model, null, options);
        }
      }
    });
  };

})(window);