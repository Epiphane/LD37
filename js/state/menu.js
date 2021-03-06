define([
   'state/screen_2d',
   'helper/image'
], function(
   Screen2D,
   Image
) {
   /* 
    * Menu screen
    */
   return Screen2D.extend({
      constructor: function(width, height) {
         Screen2D.prototype.constructor.apply(this, arguments);

         var wat = new Image('index.jpg');

         var self = this;
         setTimeout(function() {
            self.scene.add(wat);
         }, 10);
      },

      update: function(dt, game) {
         Screen2D.prototype.update.apply(this, arguments);
      },
   });
});