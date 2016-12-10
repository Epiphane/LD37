define([], function() {
   var CameraManager = function(camera) {
      this.camera = camera;
      this.following = null;
      this.offset = null;

      // this.velocity = new THREE.Vector3(0, 0, 0);
      this.speed   = 0;
      this.accel   = 40;
      this.elastic = 0.25;
      this.maxDist = 2;
   };

   CameraManager.prototype.follow = function(entity, offset) {
      this.following = entity;
      this.offset = offset;

      this.camera.position.copy(this.following.position.clone().add(offset));
      this.camera.lookAt(this.following.position);
   };

   CameraManager.prototype.update = function(dt) {
      if (this.following) {
         var dpos = this.following.position.clone().add(this.offset).sub(this.camera.position);
         var dist = dpos.length();
         var dir  = dpos.normalize();

         if (dist > this.speed * this.elastic) {
            this.speed += this.accel * dt;
         }
         else {
            this.speed -= this.accel * dt;
         }

         if (this.speed < 0)
            this.speed = 0;

         if (this.speed * dt > dist) {
            this.speed = dist / dt;
         }
         if (dist > this.maxDist) {
            this.camera.position.add(dir.clone().multiplyScalar(dist - this.maxDist));
         }

         this.camera.position.add(dir.clone().multiplyScalar(this.speed * dt));
      }
   };

   return CameraManager;
})