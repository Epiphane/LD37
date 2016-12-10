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
         var wat = new ThreeImage('wat.jpg');

         this.scene.add(wat);
      },

      update: function(dt, game) {
         Screen2D.prototype.update.apply(this, arguments);
      },
   });
});