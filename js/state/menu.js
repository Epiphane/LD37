define([
   'state/screen_2d'
], function(
   Screen2D
) {
   /* 
    * Menu screen
    */
   return Screen2D.extend({
      constructor: function(width, height) {
      },

      update: function(dt, game) {
         Screen2D.prototype.update.apply(this, arguments);
      },
   });
});