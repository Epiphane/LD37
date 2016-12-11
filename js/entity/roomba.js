define([
   'box2d',
   'entity/box2d_mesh'
], function(
   Box2D,
   Box2DMesh
) {
   var ready;

   // TWEAK THESE
   var roombaRadius = 0.6;
   var roombaHeight = 0.5;

   // THREE.JS
   var roombaGeometry = new THREE.CylinderGeometry(roombaRadius, roombaRadius, roombaHeight, 32);
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png', function() {
      ready();
   });
   var roombaMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0x66ccff});


   var manager = new THREE.LoadingManager();
   manager.onProgress = function ( item, loaded, total ) {
      console.log( item, loaded, total );
   };
   var mtlLoader = new THREE.MTLLoader();
      mtlLoader.setPath( 'art/' );
      mtlLoader.load( 'test_texture.mtl', function( materials ) {
         materials.preload();
         var objLoader = new THREE.OBJLoader();
         objLoader.setMaterials( materials );
         window.m = materials;
         objLoader.setPath( 'art/' );
         objLoader.load( 'test_texture.obj', function ( object ) {
            window.o = object;
            o.position.set(6, 2, 2);
            game.scene.add(o)
         } );
      });

   // BOX2D
   var roombaBodyDef = new Box2D.b2BodyDef();
       roombaBodyDef.set_type(Box2D.b2_dynamicBody);
       roombaBodyDef.set_position(new Box2D.b2Vec2(-2, 2));
       roombaBodyDef.set_linearDamping(5.0);
   var roombaShape = new Box2D.b2CircleShape();
       roombaShape.set_m_radius(roombaRadius);;
   var roombaFixtureDef = new Box2D.b2FixtureDef();
       roombaFixtureDef.set_density(0.0);
       roombaFixtureDef.set_shape(roombaShape);

   // DEFINITION
   var Roomba = Box2DMesh.extend({
      constructor: function(components, world) {
         Box2DMesh.call(this, components, world);

         this.position.y += roombaHeight / 2;
      },

      beginContact: function(other) {
         // Let other object define behavior?
         other.beginContact(this);
      },

      endContact: function(other) {
         // Let other object define behavior?
         other.endContact(this);
      },

      bodyDef: roombaBodyDef,
      fixtureDef: roombaFixtureDef,
      material: roombaMaterial,
      geometry: roombaGeometry
   });

   var onReady = [];
   ready = function() {
      Roomba.ready = true;
      while (onReady.length)
         onReady.shift()();
   };

   Roomba.ready = false;
   Roomba.onReady = function(cb) {
      if (Roomba.ready)
         cb();
      else
         onReady.push(cb);
   };

   return Roomba;
})
