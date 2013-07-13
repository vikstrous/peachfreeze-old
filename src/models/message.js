(function(exports) {
  var Message = Backbone.Model.extend({
    defaults: {
      sender: '',
      message: '',
      image: '',
      date: new Date()
    },

    initialize: function() {
    }
  });

  var Messages = Backbone.Collection.extend({
    model: Message
  });

  exports.Message = Message;
  exports.Messages = Messages;
})(window);
