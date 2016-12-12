define([
   'entity/box2d_mesh',
   'entity/roomba',
   'entity/map/falling_tile',
   'helper/map_constants'
], function(
   Box2DMesh,
   Roomba,
   FallingTile,
   MapConstants
) {
   var Pit = FallingTile.extend({
      material: MapConstants.pitMaterial,

      components: [],

      constructor: function() {
         FallingTile.apply(this, arguments);

         this.falling = true;
      },

      fall: function() {},

      update: function(dt, game) {
         Box2DMesh.prototype.update.apply(this, arguments);
         this.position.y = -10;
      }
   });

   return Pit;
})