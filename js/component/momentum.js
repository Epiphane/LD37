define(['box2d'], function(Box2D) {
   return Juicy.Component.create('Momentum', {
      constructor: function(entity) {
         Juicy.Component.call(this);

         this.entity = entity;

         entity.applyForce = this.applyForce.bind(this);
         this.velocity = new THREE.Vector3(0, 0, 0);
         this.force = new THREE.Vector3(0, 0, 0);
         this.maxVelocity = 200;
         this.slowdown = 4;
      },

      applyForce: function(dir) {
         this.force.add(dir);
      },

      update: function(dt, game) {
         this.velocity.multiplyScalar();

         this.force.multiplyScalar(dt);

         this.velocity.add(this.force);
         // if (this.velocity.length() > this.maxVelocity) {
         //    this.velocity.normalize().multiplyScalar(this.maxVelocity);
         // }

         this.entity.position.add(this.velocity);

         this.force.set(0, 0, 0);

         if (game.keyDown('DOWN') || game.keyDown('UP') || game.keyDown('LEFT') || game.keyDown('RIGHT'))
            return;

         var velocity = this.entity.body.GetLinearVelocity();
         if (velocity.get_x() || velocity.get_y()) {
            var damp = Math.max(0, 1 - dt * this.slowdown);
            var damped_x = velocity.get_x() * damp;
            var damped_y = velocity.get_y() * damp;
            this.entity.body.SetLinearVelocity(new Box2D.b2Vec2(damped_x, damped_y));
         }
      }
   });
});