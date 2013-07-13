(function(exports) {
  var MessagesView = Backbone.View.extend({

    tagName: 'ui',

    initialize: function() {
      this.listenTo(this.collection, "change", this.render);
    },

    render: function() {

    }
  });

  exports.MessagesView =  MessagesView;
})(window);
