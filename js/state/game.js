define([
   'box2d',
   'helper/image',
   'helper/camera',
   'entity/roomba',
   'entity/map',
   'entity/powerup_factory',
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
   PowerupFactory,
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

         Juicy.Sound.play('music');

         Juicy.State.apply(this, arguments);

         this.ready = ready;

         this.perspective(70);
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
         }.bind(this);

         // Roomba 1
         this.roomba = new Roomba([RoombaInput], this.world, this.room);
         this.roomba.isPlayer = true;
         this.roomba.handle = window.myHandle;
         this.scene.add(this.roomba);

         // Camera magic
         this.cameraMan.follow(this.roomba, new THREE.Vector3(0, 12, 0));
         this.angle = Math.PI / 2;

         var that = this;
         this.networkedRoombas = [];
         Network.newRoombaCallback(function(handle, color) {
            var networkedRoomba = new Roomba([NetworkedRoomba], that.world, that.room);
            networkedRoomba.getComponent('RoombaLabel').setColor(color);
            networkedRoomba.getComponent('RoombaLabel').setText(handle);
            // later, maybe add a label with the roomba's name to the game world..?
            that.scene.add(networkedRoomba);
            that.networkedRoombas.push(networkedRoomba);
            return networkedRoomba.getComponent('NetworkedRoomba');
         });

         Network.roombaDisconnectedCallback(function(networkComponent) {
            var dedRoomba = networkComponent.entity;
            // debugger;
            that.world.DestroyBody(dedRoomba.body);
            that.scene.remove(dedRoomba);
            var ndx = that.networkedRoombas.indexOf(dedRoomba);
            that.networkedRoombas.splice(ndx, 1);
         });

         this.powerups = new PowerupFactory(this.world);
         this.powerups.onSpawn = this.onSpawn.bind(this);
         this.powerups.onDespawn = this.onDespawn.bind(this);
         this.scene.add(this.powerups);
         Network.updateSpawnCallback(function(data) {
            data.data.forEach(function(powerup) {
               that.powerups.spawnPowerup(powerup.type, powerup.position, true, powerup.life);
            })
         });

         Network.despawnCallback(function(data) {
            var powerup = that.powerups.getPowerupAt(data.position);
            if (powerup)
               powerup.shouldRemove = true;
         });

         Network.requestSpawnCallback(function() {
            return that.powerups.getSpawnData();
         });

         this.canSpawn = Network.canSpawn();
         this.spawnTime = 5;
         this.spawnDelay = 0;
         Network.syncSpawnCallback(function() {
            that.canSpawn = true;
            that.spawnDelay = 0;
         });
      },

      onSpawn: function(thing) {
         Network.broadcastSpawn(thing);
      },

      onDespawn: function(thing) {
         Network.broadcastDespawn(thing);
      },

      updateCoinSpawns: function(data) {
         this.room.coins.forEach(function(coin, i) {
            coin.setRespawn(data[i]);
         })
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

         if (this.roomba.handle !== window.myHandle) {
            delete scores[this.roomba.handle]
            this.roomba.handle = window.myHandle;
            this.roomba.setColor(window.roombaColor);
            this.roomba.getComponent('RoombaLabel').setText(this.roomba.handle);
         }

         if (typeof(window.roombaFace) === 'number' && this.roomba.face !== window.roombaFace) {
            this.roomba.setFace(window.roombaFace);
         }

         if (this.canSpawn) {
            this.spawnDelay -= dt;
            if (this.spawnDelay <= 0) {
               this.spawnDelay = this.spawnTime;
               this.powerups.spawn(this.room);
            }
         }

         // Using 1/60 instead of dt because fixed-time calculations are more accurate
         // var before = this.networkedRoombas[0].body.GetPosition().get_x();
         this.world.Step(dt, 1, 1);
         this.world.ClearForces();
         // console.log(before, this.networkedRoombas[0].body.GetPosition().get_x());

         this.cameraMan.update(dt);

         this.scene.children.forEach(function(child) {
            if (!child.update)
               return;

            child.update(dt, game);

            if (child.shouldRemove) {
               self.scene.remove(child);
            }
         });
      }
   });
});
