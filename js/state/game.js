define([
   'box2d',
   'helper/image',
   'helper/camera',
   'entity/roomba',
   'entity/map',
   'component/roomba_input',
   'network/setup',
   'component/network_synced'
], function(
   Box2D,
   Image,
   CameraManager,
   Roomba,
   Map,
   RoombaInput,
   Network,
   NetworkedRoomba
) {
   var ready = false;
   var onReady = function() {};

   Roomba.onReady(function() {
      ready = true;
      onReady();
   });

   var map = [
      '|-------------------|----|',
      '|                   |    |',
      '|                   |  __|',
      '|                        |',
      '|                        |',
      '|                        |',
      '|                        |',
      '|                        |',
      '|                        |',
      '|                        |',
      '|                        |',
      '|                        |',
      '==========================',
   ];

   return Juicy.State.extend({
      constructor: function(width, height) {
         window.game = this;

         Juicy.State.apply(this, arguments);

         this.ready = ready;
         onReady = function() { this.ready = true; }.bind(this);

         this.perspective(38);
         this.lookAt(new THREE.Vector3(0, 5, 0), new THREE.Vector3(0, 0, 0));

         // Camera Manager
         this.cameraMan = new CameraManager(this.camera);

         // Box2D?
         this.world = new Box2D.b2World(new Box2D.b2Vec2(0.0, 0.0));
         this.world.SetAllowSleeping(false);

         // Room
         this.room = new Map();
         this.room.load(map, this.world);
         this.scene.add(this.room);

         // Roomba 1
         this.roomba = new Roomba([RoombaInput], this.world);

         this.cameraMan.follow(this.roomba, new THREE.Vector3(5, 15, 0));
         this.angle = Math.PI / 2;

         this.scene.add(this.roomba);

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
      },

      getCameraDirection: function(x, y, z) {
         var pLocal = new THREE.Vector3(x, y, z);

         var pWorld = pLocal.applyMatrix4( this.camera.matrixWorld );
             pWorld.y = this.camera.position.y;

         return pWorld.sub(this.camera.position).normalize();
      },

      getCameraFront: function() {
         return this.getCameraDirection(0, 0, -1);
      },

      getCameraBack: function() {
         return this.getCameraDirection(0, 0, 1);
      },

      getCameraRight: function() {
         return this.getCameraDirection(1, 0, 0);
      },

      getCameraLeft: function() {
         return this.getCameraDirection(-1, 0, 0);
      },

      update: function(dt, game) {
         // Using 1/60 instead of dt because fixed-time calculations are more accurate
         this.world.Step(1/60, 3, 2);

         this.cameraMan.update(dt);

         this.roomba.update(dt, game);

         this.networkedRoombas.forEach(function(roomba) {
            roomba.update(dt, game);
         });

         this.broadcastTick--
         if (this.broadcastTick === 0) {
            this.broadcastTick = 2;
            var posn = this.roomba.body.GetPosition();
            Network.broadcastRoombaState({x: posn.get_x(), y: posn.get_y()});
         }
      }
   });
});
