define([
   'box2d',
], function(
   Box2D
) {
   return Juicy.Component.create('RoombaInput', {
      constructor: function(entity) {
         Juicy.Component.call(this);

         this.entity = entity;

         this.cameraDirection = new THREE.Vector3(1, 0, 0);
         this.cameraRight = new THREE.Vector3(0, 0, 1);
      },

      update: function(dt, game) {
         var speed = 40;
         var input = false;
         if (game.keyDown('LEFT')) {
            this.entity.body.ApplyForce(new Box2D.b2Vec2(-speed, 0), this.entity.body.GetWorldCenter());
            input = true;
         }
         if (game.keyDown('RIGHT')) {
            this.entity.body.ApplyForce(new Box2D.b2Vec2(speed, 0), this.entity.body.GetWorldCenter());
            input = true;
         }
         if (game.keyDown('UP')) {
            this.entity.body.ApplyForce(new Box2D.b2Vec2(0, -speed), this.entity.body.GetWorldCenter());
            input = true;
         }
         if (game.keyDown('DOWN')) {
            this.entity.body.ApplyForce(new Box2D.b2Vec2(0, speed), this.entity.body.GetWorldCenter());
            input = true;
         }

         // if (input && !input) {
         //    var velocity = this.entity.body.GetLinearVelocity();
         //    var damp = Math.max(0, 1 - dt * this.slowdown);
         //    var damped_x = velocity.get_x() * damp;
         //    var damped_y = velocity.get_y() * damp;
         //    // console.log(new Box2D.b2Vec2(damped_x, damped_y));
         //    this.entity.body.SetLinearVelocity(new Box2D.b2Vec2(damped_x, damped_y));
         // }
      }
   });
});