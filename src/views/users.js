(function(exports) {
  var UsersView = Backbone.View.extend({

    initialize: function(opts) {
      this.listenTo(this.collection, "add change", this.render);
      this.user = opts.user;

      this.addingContact = false;
      $('#contacts-button').click(this.contacts_click.bind(this));
    },

    contacts_click: function(){
      this.addingContact = !this.addingContact;
      if(!this.addingContact){
        $('#contacts-button').html("Add A Contact");
        this.user.findAndAddFriend($('#new-contact-input').val());
      } else {
        $('#contacts-button').html("Submit");
        $('#contacts-container').animate({
          marginTop: "62px"
        }, 500);
        $('#contacts-column .PopupContainer').fadeIn("slow");
      }
    },

    render: function() {
      if(this.addingContact === false){
        $('#contacts-column .PopupContainer').fadeOut("slow");
        $('#contacts-button').html("Add A Contact");
      } else {
        $('#contacts-button').html("Submit");
      }

      var $container = $('#contacts-container');
      $container.empty();
      var models = this.collection.models;

      for(var c in models){
        var user = models[c];
        var $contact_ele_tpl = $($('#contact-tpl').html());
        console.log(user, 'REDNERING');
        var profile = user.get('profile');
        if(profile){
          $contact_ele_tpl.find('.Name').text(profile.name + (user.get('connected') ? ' + ' : ' - ') + user.get('fp').substr(0,2));
          $contact_ele_tpl.find('.Image').attr('src', profile.image);
        } else {
          $contact_ele_tpl.find('.Name').text('Anonymous' + (user.get('connected') ? ' + ' : ' - ') + user.get('fp').substr(0,2));
        }
        $container.append($contact_ele_tpl);
      }
      $container.css('margin-top', '0px');
    }
  });

  var ProfileView = Backbone.View.extend({

    initialize: function() {
      this.listenTo(this.model, 'add change', this.render);
      this.edit_mode = false;
      $('#profile-button').click(this.edit_click.bind(this));
      $('#profile-info-edit').click(this.upload_click.bind(this));
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
		 $('#profile-info-edit').css("display", "none");
        this.model.set('profile', prof);
        this.model.trigger('change:profile');
        this.model.trigger('change');
        this.model.save();
      } else {
		$('#profile-info-edit').css("display", "block");
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
