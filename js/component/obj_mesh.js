define([
   'box2d',
], function(
   Box2D
) {
   return Juicy.Component.create('OBJMesh', {
      constructor: function(entity) {
         Juicy.Component.call(this);

         this.entity = entity;
      },

      load: function(path, mtl, obj) {
         var self = this;

         var mtlLoader = new THREE.MTLLoader();
         var objLoader = new THREE.OBJLoader();

         mtlLoader.setPath(path);
         mtlLoader.load(mtl, function( materials ) {
            materials.preload();
            objLoader.setMaterials( materials );

            objLoader.setPath(path);
            objLoader.load(obj, function (object) {
               // Make this component the group
               self.add(object);
               self.onReady();
            });
         });
      },

      update: function(dt) {
         this.rotation.y += 6 * dt;
         this.entity.rotation.y -= 3 * dt;
      }
   });
});