(function(exports) {
  var Message = Backbone.Model.extend({
    defaults: {
      sender: '',
      message: '',
      image: ''
    },

    initialize: function() {
    }
  });

  Backbone.Collection.extend({
    model: Message
  });

  exports.Message = Message;
})(window);
