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
         }.bind(this);

         // Roomba 1
         this.roomba = new Roomba([RoombaInput], this.world);
         this.scene.add(this.roomba);

         // Camera magic
         this.cameraMan.follow(this.roomba, new THREE.Vector3(0, 15, 0));
         this.angle = Math.PI / 2;

         var that = this;
         this.networkedRoombas = [];
         this.broadcastTick = 3;
         Network.newRoombaCallback(function(handle) {
            var networkedRoomba = new Roomba([NetworkedRoomba], that.world);
            // later, maybe add a label with the roomba's name to the game world..?
            that.scene.add(networkedRoomba);
            that.networkedRoombas.push(networkedRoomba);
            return networkedRoomba.getComponent('NetworkedRoomba');
         });
         this.roomba.body.ApplyLinearImpulse(new Box2D.b2Vec2(-0.01, -0.01), this.roomba.body.GetPosition());

         // Populate room with one powerup
         this.powerup = new Powerup(this.world);
         this.scene.add(this.powerup);
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
         this.world.Step(1/60, 3, 2);

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
            Network.broadcastRoombaState({x: posn.get_x(), y: posn.get_y()});
         }
      }
   });
});
