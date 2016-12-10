define([
   'box2d',
   'component/momentum',
], function(
   Box2D,
   Momentum
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
   var roombaShape = new Box2D.b2PolygonShape();
       roombaShape.SetAsBox(1, 1);
   var roombaFixtureDef = new Box2D.b2FixtureDef();
       roombaFixtureDef.set_density(0.0);
       roombaFixtureDef.set_shape(roombaShape);

   // DEFINITION
   var Roomba = Juicy.Mesh.extend({
      constructor: function(components, world) {
         components.unshift(Momentum);

         Juicy.Mesh.call(this, roombaGeometry, roombaMaterial, components);

         this.position.y += roombaHeight / 2;

         // Initialize Box2D component
         this.body = world.CreateBody(roombaBodyDef);
         this.body.CreateFixture(roombaFixtureDef);
         window.body = this.body;
      },

      update: function(dt, game) {
         var bodyPos = this.body.GetPosition();
         this.position.set(bodyPos.get_y(), this.position.y, -bodyPos.get_x());

         Juicy.Mesh.prototype.update.apply(this, arguments);
      }
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