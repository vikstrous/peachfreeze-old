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

  var ProfileView = Backbone.View.extend({

    initialize: function() {
      this.listenTo(this.model, "change", this.render);
    },

    render: function() {
      var $profile_container = $('#profile-container');
      $profile_container.find('.Name').text(this.model.get('profile').name);
    }
  });

  exports.UsersView = UsersView;
  exports.ProfileView = ProfileView;
})(window);
