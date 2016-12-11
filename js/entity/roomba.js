define([
   'box2d',
   'component/obj_mesh',
   'component/fallable',
   'entity/box2d_mesh'
], function(
   Box2D,
   OBJMesh,
   Fallable,
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
      constructor: function(components, world, room) {
         components.unshift(OBJMesh);
         components.unshift(Fallable);

         Box2DMesh.call(this, components, world);

         this.position.y += roombaHeight / 2;

         this.getComponent('OBJMesh').load('art/', 'test_texture.mtl', 'test_texture.obj');
         this.getComponent('OBJMesh').position.y -= 0.25;

         this.feet = {};
         this.respawnTimer = 0;
         this.dead = false;
         this.room = room;
         this.score = 0;
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

      respawn: function() {
         this.dead = false;
         this.respawnTimer = 0;
         this.getComponent('Fallable').reset();

         var spawns = this.room.spawns.player;
         var spawn = spawns[Math.floor(Math.random() * spawns.length)];

         this.setPosition(spawn[0], this.position.y, spawn[1]);
      },

      die: function() {
         this.dead = true;
         this.respawnTimer = 2;
      },

      bodyDef: roombaBodyDef,
      fixtureDef: roombaFixtureDef,
      material: roombaMaterial,
      geometry: roombaGeometry,

      update: function(dt, game) {
         Box2DMesh.prototype.update.apply(this, arguments);

         if (this.dead) {
            this.respawnTimer -= dt;

            if (this.respawnTimer <= 0) {
               this.respawn();
            }
         }

         var unstable = 0;
         var stable = 0;
         for (var id in this.feet) {
            var foot = this.feet[id];
            if (foot.falling) {
               unstable ++;
            }
            else {
               stable ++;
            }
         }

         if (unstable > 2) {
            this.die();
            this.getComponent('Fallable').fall();
         }
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
