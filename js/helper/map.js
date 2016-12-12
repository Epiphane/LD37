define([
   'box2d',
   'helper/box2d',
   'helper/map_constants',
   'entity/map/falling_tile',
   'entity/map/breakable_wall'
], function(
   Box2D,
   Box2DHelper,
   MapConstants,
   FallingTile,
   BreakableWall
) {
   var world = null;

   var MapHelper = {
      setWorld: function(w) {
         world = w;
      }
   };

   MapHelper.createFloor = function() {
      var tileObj = new THREE.Mesh(MapConstants.tileGeometry, MapConstants.material);

      return tileObj;
   };

   MapHelper.createFallingFloor = function() {
      var tileObj = new FallingTile(world);

      return tileObj;
   };

   MapHelper.createWall = function(x, z) {
      var tileObj = new THREE.Mesh(MapConstants.wallGeometry, MapConstants.material);

      MapConstants.tileBodyDef.set_position(new Box2D.b2Vec2(-z, x));
      tileObj.body = world.CreateBody(MapConstants.tileBodyDef);
      tileObj.body.CreateFixture(MapConstants.wallFixtureDef);

      return tileObj;
   };

   MapHelper.createBreakableWall = function() {
      var tileObj = new BreakableWall(world);

      return tileObj;
   };

   return MapHelper;
});