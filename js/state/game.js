define([
   'box2d',
   'helper/image',
   'helper/camera',
   'entity/roomba',
   'entity/map',
   'entity/powerup',
   'component/roomba_input',
   'network/setup',
   'component/network_synced',
   'helper/contact_manager'
], function(
   Box2D,
   ThreeImage,
   CameraManager,
   Roomba,
   Map,
   Powerup,
   RoombaInput,
   Network,
   NetworkedRoomba,
   ContactManager
) {
   var ready = false;
   var onReady = function() {};

   // Roomba.onReady(function() {
   //    ready = true;
   //    onReady();
   // });

   var mapImage = new Image();
       mapImage.src = './textures/room.png';
   var mapCanvas = document.createElement('canvas');
       window.m = mapCanvas;
       mapImage.onload = function() {
         mapCanvas.width = mapImage.width;
         mapCanvas.height = mapImage.height;
         mapCanvas.getContext('2d').drawImage(mapImage, 0, 0);

         ready = true;
         onReady(mapCanvas);
       };

   return Juicy.State.extend({
      constructor: function(width, height) {
         window.game = this;

         Juicy.State.apply(this, arguments);

         this.ready = ready;

         this.perspective(38);
         this.lookAt(new THREE.Vector3(0, 5, 0), new THREE.Vector3(0, 0, 0));

         // Lighting for OBJ files
         var ambient = new THREE.AmbientLight(0xffffff);
         this.scene.add(ambient);

         var directionalLight = new THREE.DirectionalLight(0xffeedd);
             directionalLight.position.set(0, 0, 1).normalize();
         this.scene.add(directionalLight);

         // Camera Manager
         this.cameraMan = new CameraManager(this.camera);

         // Box2D?
         this.world = new Box2D.b2World(new Box2D.b2Vec2(0.0, 0.0));
         this.world.SetAllowSleeping(false);
         this.world.SetContactListener(ContactManager);

         ContactManager.setBeginContactCallback(this.beginContact.bind(this));
         ContactManager.setEndContactCallback(this.endContact.bind(this));

         // Room
         this.room = new Map();
         this.scene.add(this.room);
         onReady = function(mapCanvas) {
            this.ready = true;

            this.room.loadImage(mapCanvas, this.world);
            this.roomba.respawn();

            var onRespawn = this.onCoinRespawn.bind(this);
            var onDespawn = this.onCoinDespawn.bind(this);
            this.room.coins.forEach(function(coin) {
               coin.onRespawn = onRespawn;
               coin.onDespawn = onDespawn;
            });

            Network.requestSpawnTimers(function(data) {
               this.updateCoinSpawns(data);
            });
         }.bind(this);

         // Roomba 1
         this.roomba = new Roomba([RoombaInput], this.world, this.room);
         this.roomba.isPlayer = true;
         this.scene.add(this.roomba);

         // Camera magic
         this.cameraMan.follow(this.roomba, new THREE.Vector3(0, 20, 0));
         this.angle = Math.PI / 2;

         var that = this;
         this.networkedRoombas = [];
         this.broadcastTick = 3;
         Network.newRoombaCallback(function(handle) {
            var networkedRoomba = new Roomba([NetworkedRoomba], that.world, that.room);
            // later, maybe add a label with the roomba's name to the game world..?
            that.scene.add(networkedRoomba);
            that.networkedRoombas.push(networkedRoomba);
            return networkedRoomba.getComponent('NetworkedRoomba');
         });
         this.roomba.body.ApplyLinearImpulse(new Box2D.b2Vec2(-0.01, -0.01), this.roomba.body.GetPosition());

         Network.updateCoinCallback(function(data) {
            var coin = that.room.getCoinAt(data.position.x, data.position.y);
            if (coin) {
               coin.setRespawn(data.respawn);
            }
         });
      },

      onCoinRespawn: function(coin) {
         Network.broadcastSpawnTimer(coin.position, coin.respawnTimer);
      },

      onCoinDespawn: function(coin) {
         Network.broadcastSpawnTimer(coin.position, coin.respawnTimer);
      },

      updateCoinSpawns: function(data) {
         this.room.coins.forEach(function(coin, i) {
            coin.setRespawn(data[i]);
         })
      },

      spawnPowerup: function(location, type) {
         var spawned = new Powerup(this.world);
             spawned.setPosition(location.x, spawned.position.y, location.z);
             spawned.setType(type);

         this.scene.add(spawned);
      },

      beginContact: function(contact, idA, idB) {
         var A = this.scene.getObjectById(idA);
         var B = this.scene.getObjectById(idB);

         if (A && B)
            A.beginContact(B);
      },

      endContact: function(contact, idA, idB) {
         var A = this.scene.getObjectById(idA);
         var B = this.scene.getObjectById(idB);

         if (A && B)
            A.endContact(B);
      },

      update: function(dt, game) {
         var self = this;

         // Using 1/60 instead of dt because fixed-time calculations are more accurate
         this.world.Step(1/60, 1, 1);

         this.cameraMan.update(dt);

         this.scene.children.forEach(function(child) {
            if (!child.update)
               return;

            child.update(dt, game);

            if (child.shouldRemove) {
               self.scene.remove(child);
            }
         });

         this.broadcastTick--
         if (this.broadcastTick === 0) {
            this.broadcastTick = 1;
            var posn = this.roomba.body.GetPosition();
            var velc = this.roomba.body.GetLinearVelocity();
            Network.broadcastRoombaState(
               {x: posn.get_x(), y: posn.get_y()},
               {x: velc.get_x(), y: velc.get_y()},
               this.roomba.score
            );
         }
      }
   });
});
