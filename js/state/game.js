define([
    'helper/image'
], function(
    Image
) {
   var ready = false;
   var onReady = function() {};

   // Load texture
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png', function() {
      ready = true;
      onReady();
   });
   var material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture });

   return Juicy.State.extend({
      constructor: function(width, height) {
         Juicy.State.apply(this, arguments);

         this.ready = ready;
         onReady = function() { this.ready = true; }.bind(this);

         this.perspective();
         this.lookAt(new THREE.Vector3(0, 15, 0), new THREE.Vector3(0, 0, 0));

         // Roomba 1
         this.roombaRadius = 1;
         this.roombaHeight = 0.5;
         this.roombaGeometry = new THREE.CylinderGeometry(
            this.roombaRadius, 
            this.roombaRadius, 
            this.roombaHeight, 
            32);
         this.roombaMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0x66ccff});
         this.roomba = new THREE.Mesh(this.roombaGeometry,
                                      this.roombaMaterial);
         this.roomba.position.y += this.roombaHeight / 2;

         this.scene.add(this.roomba);

         var wallLength = 10;
         var wallHeight = 2;
         var wall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, wallLength), material);
             wall.position.x = -3;
             wall.position.y += wallHeight / 2;
         this.scene.add(wall);

         window.game = this;
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
         var speed = 10;
         if (game.keyDown('LEFT')) {
            this.roomba.position.add(this.getCameraLeft().multiplyScalar(speed * dt));
         }
         if (game.keyDown('RIGHT')) {
            this.roomba.position.add(this.getCameraRight().multiplyScalar(speed * dt));
         }
         if (game.keyDown('UP')) {
            this.roomba.position.add(this.getCameraFront().multiplyScalar(speed * dt));
         }
         if (game.keyDown('DOWN')) {
            this.roomba.position.add(this.getCameraBack().multiplyScalar(speed * dt));
         }

         this.lookAt(new THREE.Vector3(10, 15, 0), this.roomba.position);
      }
   });
});