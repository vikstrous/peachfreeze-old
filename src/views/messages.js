(function(exports) {
  var MessagesView = Backbone.View.extend({

    tagName: 'ul',

    initialize: function() {
      this.listenTo(this.collection, "change", this.render);
    },

    render: function() {
      console.log('render messages', this.collection);
    }
  });

  exports.MessagesView =  MessagesView;
})(window);
