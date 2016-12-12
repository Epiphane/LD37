define([
   'box2d',
   'component/fallable',
   'component/killable',
   'component/roomba_label',
   'entity/spinning_blade',
   'entity/box2d_mesh',
   'network/setup'
], function(
   Box2D,
   Fallable,
   Killable,
   RoombaLabel,
   SpinningBlade,
   Box2DMesh,
   Network
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
       roombaBodyDef.set_linearDamping(5.0);
   var roombaShape = new Box2D.b2CircleShape();
       roombaShape.set_m_radius(roombaRadius);;
   var roombaFixtureDef = new Box2D.b2FixtureDef();
       roombaFixtureDef.set_density(0.0);
       roombaFixtureDef.set_shape(roombaShape);

   // DEFINITION
   var Roomba = Box2DMesh.extend({
      constructor: function(components, world, room) {
         components.unshift(RoombaLabel);
         components.unshift(Fallable);
         components.unshift(Killable);

         this.material = roombaMaterial.clone();

         Box2DMesh.call(this, components, world);

         this.position.y += roombaHeight / 2;

         this.feet = {};
         this.respawnTimer = 0;
         this.dead = false;
         this.room = room;
         this.score = 0;

         this.add(this.blade = new SpinningBlade(world));
         var joint = new Box2D.b2WeldJointDef();
             joint.set_collideConnected(false);

         joint.Initialize(this.body, this.blade.body, new Box2D.b2Vec2(0.0, 0.0));
         world.CreateJoint(joint);
      },

      setPosition: function(x, y, z) {
         Box2DMesh.prototype.setPosition.apply(this, arguments);

         // Update the blade b2Body...
         Box2DMesh.prototype.setPosition.apply(this.blade, arguments);
         // But anchor the visual part
         this.blade.position.set(0, 0, 0);
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
         this.getComponent('Killable').reset();
         this.blade.visible = false;

         var amountToLose = Math.min(5, window.scores[window.myHandle]);
         window.scores[window.myHandle] -= amountToLose;
         updateHighScores();

         if (!this.room) {
            console.error('Why is my room null? Who has done such a thing?');
            return null;
         }

         var spawns = this.room.spawns.player;
         var spawn = spawns[Math.floor(Math.random() * spawns.length)];

         this.setPosition(spawn[0], this.position.y, spawn[1]);
      },

      die: function(how) {
         if (this.dead) return;
         
         this.dead = true;
         this.respawnTimer = 2;
         Network.broadcastDeath(how);
      },

      fallDeath: function() {
         this.die('fall');
         this.getComponent('Fallable').fall();
      },

      weaponDeath: function() {
         this.die('weapon');
         this.getComponent('Killable').kill();
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

         if (!this.networked) {
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
               this.fallDeath();
            }
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
