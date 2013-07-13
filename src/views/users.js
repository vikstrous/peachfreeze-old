(function(exports) {
  var UsersView = Backbone.View.extend({

    tagName: 'ul',

    initialize: function() {
      this.listenTo(this.collection, "change", this.render);
    },

    render: function() {
      console.log('render users', this.collection);
    }
  });

  exports.UsersView = UsersView;
})(window);
