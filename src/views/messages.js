(function(exports) {
  var MessagesView = Backbone.View.extend({

    initialize: function(options) {
      this.user = options['user'];
      this.listenTo(this.collection, 'add change', this.render);
      this.posting = false;
      $('#post-button').click(this.post.bind(this));
    },

    post: function(){
      if(this.posting === false){
        $('#broadcast-container').animate({
          marginTop: "135px"
        }, 300);
        $('#broadcast-column .PopupContainer').fadeIn("slow");
        this.posting = true;
      } else {
        this.posting = false;
        this.user.broadcastMessage(new Message({'message': $('#new-broadcast-input').val()}));
        //this.collection.unshift({'message': $('#new-broadcast-input').val()});
        console.log('post message: ', $('#new-broadcast-input').val());
      }
      this.render();
    },

    render: function() {
      var $container = $('#broadcast-container');
      $container.empty();
      if(this.posting === false){
        $('#broadcast-column .PopupContainer').fadeOut("slow");
        $('#post-button').html("Post A Broadcast");
      } else {
        $('#post-button').html("Submit");
      }

      var models = this.collection.models.reverse();

      for(var c in models){
        var msg = models[c];
        var $broadcast_ele_tpl = $($('#broadcast-tpl').html());
        $broadcast_ele_tpl.find('.Title').text(msg.get('sender'));
        $broadcast_ele_tpl.find('.Text').text(msg.get('message'));
        $broadcast_ele_tpl.find('.Image').attr('src', msg.get('image'));
        $container.append($broadcast_ele_tpl);
      }
      $('#broadcast-container').css('margin-top', '0px');
    }
  });

  exports.MessagesView =  MessagesView;
})(window);
