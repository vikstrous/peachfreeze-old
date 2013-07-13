(function(exports) {
    var Message = Backbone.Model.extend({
        defaults: {
            sender: '',
            message: '',
            image: ''
        },

        initialize: function() {
        }
    });

    exports.Message = Message;
})(window);
