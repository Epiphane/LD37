define([
    'helper/image'
], function(
    Image
) {
   /* 
    * 2D screen
    */
   return Juicy.State.extend({
      constructor: function(width, height) {
         Juicy.State.apply(this, arguments);

         var wat = new Image('index.jpg');

         var self = this;
         setTimeout(function() {
            self.scene.add(wat);
         }, 10);

         this.orthographic(2);
      }
   });
});