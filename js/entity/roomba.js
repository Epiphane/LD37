define([
   'box2d',
   'component/obj_mesh',
   'entity/box2d_mesh'
], function(
   Box2D,
   OBJMesh,
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
         components.unshift(OBJMesh);

         Box2DMesh.call(this, components, world);

         this.position.y += roombaHeight / 2;

         this.getComponent('OBJMesh').load('art/', 'test_texture.mtl', 'test_texture.obj');
         this.getComponent('OBJMesh').position.y -= 0.25;;
      },

      beginContact: function(other) {
         if (other instanceof Roomba)
            return;

         // Let other object define behavior?
         other.beginContact(this);
      },

      endContact: function(other) {
         if (other instanceof Roomba)
            return;
         
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
