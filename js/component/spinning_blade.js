define([
   'box2d',
   'component/obj_mesh'
], function(
   Box2D,
   OBJMesh
) {
   return OBJMesh.create('SpinningBlade', {
      constructor: function() {
         OBJMesh.apply(this, arguments);

         this.load('art/', 'test_texture.mtl', 'test_texture.obj');
         this.position.y -= 0.25;
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
      }
   });
});