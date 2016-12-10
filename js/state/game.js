define([
    'helper/image',
    'component/momentum'
], function(
    Image,
    Momentum
) {
   var ready = false;
   var onReady = function() {};

   // Load texture
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png', function() {
      ready = true;
      onReady();
   });
   var material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture });

   var map = [
      'T------------------------7',
      '|                        |',
      '|                        |',
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
   ]

   return Juicy.State.extend({
      constructor: function(width, height) {
         Juicy.State.apply(this, arguments);

         this.ready = ready;
         onReady = function() { this.ready = true; }.bind(this);

         this.perspective(38);
         this.lookAt(new THREE.Vector3(0, 5, 0), new THREE.Vector3(0, 0, 0));

         // Roomba 1
         this.roombaRadius = 0.3;
         this.roombaHeight = 0.5;
         this.roombaGeometry = new THREE.CylinderGeometry(
            this.roombaRadius, 
            this.roombaRadius, 
            this.roombaHeight, 
            32);
         this.roombaMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0x66ccff});
         this.roomba = new Juicy.Mesh(this.roombaGeometry,
                                      this.roombaMaterial,
                                      ['Momentum']);
         this.roomba.position.y += this.roombaHeight / 2;

         this.cameraDirection = new THREE.Vector3(1, 0, 0);
         this.cameraRight = new THREE.Vector3(0, 0, 1);
         this.angle = Math.PI / 2;

         this.scene.add(this.roomba);

         var wallLength = 10;
         var wallHeight = 2;
         var wall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, wallLength), material);
             wall.position.x = -3;
             wall.position.y += wallHeight / 2;
         this.scene.add(wall);

         wall = new THREE.Mesh(new THREE.BoxGeometry(1, wallHeight, wallLength), material);
         wall.position.x = 7;
         wall.position.y += wallHeight / 2;
         this.scene.add(wall);

         wall = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, 1), material);
         wall.position.z = 7;
         wall.position.y += wallHeight / 2;
         this.scene.add(wall);

         window.game = this;

         

         var tilesize = 2;
         map.forEach(function(row, x_2) {
            // for (var z = 0; z < row.length; z ++) {
            //    var tile = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 1), material);
            //        tile.position.x = x;
            //        tile.position.z = z;
            //        tile.position.y = -0.25;
            //    this.scene.add(tile);
            // }  
         })
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
         var speed = 25;
         if (game.keyDown('LEFT')) {
            this.roomba.applyForce(this.cameraRight.clone().multiplyScalar(speed * dt));
         }
         if (game.keyDown('RIGHT')) {
            this.roomba.applyForce(this.cameraRight.clone().multiplyScalar(-speed * dt));
         }
         if (game.keyDown('UP')) {
            this.roomba.applyForce(this.cameraDirection.clone().multiplyScalar(-speed * dt));
         }
         if (game.keyDown('DOWN')) {
            this.roomba.applyForce(this.cameraDirection.clone().multiplyScalar(speed * dt));
         }

         this.lookAt(
            this.roomba.position.clone()
               // .add(this.cameraDirection)
               .add(new THREE.Vector3(0, 15, 0)),
            this.roomba.position);

         this.roomba.update(dt, game);
      }
   });
});