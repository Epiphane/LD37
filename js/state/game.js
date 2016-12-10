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

         var wat = new Juicy.Sprite('index.jpg');

         this.scene.add(wat);

         this.orthographic(2);
      }
   });
});