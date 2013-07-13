(function(exports) {
  var Message = Backbone.Model.extend({
    class_name: 'Message',

    defaults: {
      sender: '',
      message: '',
      image: '',
      recepients: '',
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
