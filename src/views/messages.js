(function(exports) {
  var MessagesView = Backbone.View.extend({

    initialize: function() {
      this.listenTo(this.collection, "change", this.render);
    },

    render: function() {
      console.log('render messages', this.collection);
      var $container = $('#broadcast-container');
      $container.empty();

      var models = this.collection.models;
      for(var c in models){
        var msg = models[c];
        var $broadcast_ele_tpl = $($('#broadcast-tpl').html());
        $broadcast_ele_tpl.find('.Title').text(msg.get('sender'));
        $broadcast_ele_tpl.find('.Text').text(msg.get('message'));
        $broadcast_ele_tpl.find('.Image').attr('src', msg.get('image'));
        $container.append($broadcast_ele_tpl);
      }
    }
  });

  exports.MessagesView =  MessagesView;
})(window);
