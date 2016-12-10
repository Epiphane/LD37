define([
   'state/screen_2d',
   'three_image'
], function(
   Screen2D,
   ThreeImage
) {
   /* 
    * Menu screen
    */
   return Screen2D.extend({
      constructor: function(width, height) {
         Screen2D.prototype.constructor.apply(this, arguments);

         var wat = new ThreeImage('index.jpg');

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