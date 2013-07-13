(function(exports) {
  var UsersView = Backbone.View.extend({

    tagName: 'ul',

    initialize: function() {
      this.listenTo(this.collection, 'add change', this.render);
    },

    render: function() {
      console.log('render users', this.collection);
    }
  });

  var ProfileView = Backbone.View.extend({

    initialize: function() {
      this.listenTo(this.model, 'add change', this.render);
      this.edit_mode = false;
      $('#profile-button').click(this.edit_click.bind(this));
      $('#profile-container .ProfileImage').click(this.upload_click.bind(this));
    },

    upload_click: function(){
      if(this.edit_mode){
        uploadProfileImage(function(img){
          this.preview = img;
          $('#profile-container .ProfileImage').attr('src', this.preview || '');
        }.bind(this));
      }
    },

    edit_click: function(){
      this.edit_mode = !this.edit_mode;
      if(!this.edit_mode){
        var prof = this.model.get('profile');
        prof.name = $('#profile-container .Name input').val();
        prof.epithet = $('#profile-container .Epithet textarea').val();
        prof.description = $('#profile-description textarea').val();
        prof.image = this.preview || prof.image;
        this.model.set('profile', prof);
        this.model.trigger('change:profile');
        this.model.trigger('change');
        this.model.save();
      } else {
        this.model.trigger('change:profile');
        this.model.trigger('change');
      }
    },

    render: function() {
      var profile = this.model.get('profile');
      var $profile_container = $('#profile-container');

      var fingerPrint = this.model.get('fp').match(/.{1,8}/g);
      $profile_container.find(".finger-print").empty();
      for(var i=0;i<fingerPrint.length;i++){
        $profile_container.find(".finger-print").append("<div style='background-color: #" + fingerPrint[i].substring(0,6) + "'></div>");
      }
      $profile_container.find('.FingerPrint').text(fingerPrint.join(' ').toUpperCase());

      if(!this.edit_mode){
        $profile_container.find('.ProfileInfoArea>a').removeAttr('href');
        $profile_container.find('.ProfileImage').attr('src', profile.image || '');
        $profile_container.find('.Name').empty().text(profile.name || '');
        $profile_container.find('.Epithet').empty().text(profile.epithet || '');
        $profile_container.find('.Epithet').dotdotdot();
        $profile_container.find('#profile-description').empty().text(profile.description || '');
        $profile_container.find('#profile-description').dotdotdot();
        $('#profile-button').text('Edit Profile');
      } else {
        $('#profile-container .ProfileInfoArea>a').attr('href', '#');
        $('#profile-container .Name').empty().html('<input type="text" name="edit_name" id="edit_name_input" value="' + (profile.name || '') + '">');
        $('#profile-container .Epithet').empty().html('<textarea  name="edit_epithet" id="edit_epithet_input"></textarea>').find('textarea').val(profile.epithet);
        $('#profile-description').empty().html('<textarea name="edit_description" id="edit_description_input"></textarea>').find('textarea').val(profile.description);
        $('#profile-button').text('Save Profile');
      }
    }
  });

  exports.UsersView = UsersView;
  exports.ProfileView = ProfileView;
})(window);
