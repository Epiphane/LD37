define([
   'box2d',
   'entity/box2d_mesh',
   'entity/roomba'
], function(
   Box2D,
   Box2DMesh,
   Roomba
) {
   var ready;

   // TWEAK THESE
   var powerupRadius = 0.3;
   var powerupHeight = 0.25;

   // THREE.JS
   var powerupGeometry = new THREE.CylinderGeometry(powerupRadius, powerupRadius, powerupHeight, 32);
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png');
   var powerupMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0xffcc66});

   // BOX2D
   var powerupBodyDef = new Box2D.b2BodyDef();
       powerupBodyDef.set_type(Box2D.b2_dynamicBody);
   var powerupShape = new Box2D.b2CircleShape();
       powerupShape.set_m_radius(powerupRadius);;
   var powerupFixtureDef = new Box2D.b2FixtureDef();
       powerupFixtureDef.set_density(0.0);
       powerupFixtureDef.set_shape(powerupShape);
       powerupFixtureDef.set_isSensor(true);

   // DEFINITION
   var Powerup = Box2DMesh.extend({
      constructor: function(components, world) {
         Box2DMesh.apply(this, arguments);

         this.position.y = 0.5 + powerupHeight / 2;
         this.rotation.x = Math.PI / 2;

         this.visible = true;
         this.respawnTimer = 0;

         this.onRespawn = function() {};
         this.onDespawn = function() {};
      },

      setType: function(type) {
         console.log(type);
      },

      setRespawn: function(value) {
         this.respawnTimer = value;
         this.visible = (value === 0);
      },

      beginContact: function(other) {
         if (!this.visible)
            return;

         // Only collide with Roombas
         if (!(other instanceof Roomba)) {
            return;
         }

         this.setRespawn(10 + Math.random() * 5);
         this.onDespawn(this);
         other.score ++;
         window.scores[window.myHandle] = other.score;
      },

      endContact: function(other) {
      },

      update: function(dt, game) {
         Box2DMesh.prototype.update.apply(this, arguments);

         this.rotation.z += dt;

         if (!this.visible) {
            this.respawnTimer -= dt;

            if (this.respawnTimer <= 0) {
               this.setRespawn(0);
               this.onRespawn(this);
            }
         }
      },

      bodyDef: powerupBodyDef,
      fixtureDef: powerupFixtureDef,
      material: powerupMaterial,
      geometry: powerupGeometry
   });

   return Powerup;
})
