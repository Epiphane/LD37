define([], function() {
   return Juicy.Component.create('Momentum', {
      constructor: function(entity) {
         Juicy.Component.call(this);

         this.entity = entity;

         entity.applyForce = this.applyForce.bind(this);
         this.velocity = new THREE.Vector3(0, 0, 0);
         this.force = new THREE.Vector3(0, 0, 0);
         this.maxVelocity = 100;
         this.slowdown = 4;
      },

      applyForce: function(dir) {
         this.force.add(dir);
      },

      update: function(dt, game) {
         this.velocity.multiplyScalar(Math.max(0, 1 - dt * this.slowdown));

         this.force.multiplyScalar(dt);

         this.velocity.add(this.force);
         if (this.velocity.length() > this.maxVelocity) {
            this.velocity.normalize().multiplyScalar(this.maxVelocity);
         }

         this.entity.position.add(this.velocity);

         this.force.set(0, 0, 0);
      }
   });
});