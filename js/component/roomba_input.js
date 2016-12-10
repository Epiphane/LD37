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
         this.slowdown = 4;
      },

      update: function(dt, game) {
         var velocity = this.entity.body.GetLinearVelocity();
         var v_x = velocity.get_x();
         var v_y = velocity.get_y();
         var speed = 50;
         var rev_speed = 50;
         if (game.keyDown('LEFT')) {
            if (v_x > 0) {
               this.entity.body.ApplyForce(new Box2D.b2Vec2(-rev_speed, 0), this.entity.body.GetWorldCenter());
            }
            else {
               this.entity.body.ApplyForce(new Box2D.b2Vec2(-speed, 0), this.entity.body.GetWorldCenter());
            }
         }
         if (game.keyDown('RIGHT')) {
            if (v_x < 0) {
               this.entity.body.ApplyForce(new Box2D.b2Vec2(rev_speed, 0), this.entity.body.GetWorldCenter());
            }
            else {
               this.entity.body.ApplyForce(new Box2D.b2Vec2(speed, 0), this.entity.body.GetWorldCenter());
            }
         }
         if (game.keyDown('UP')) {
            if (v_y > 0) {
               this.entity.body.ApplyForce(new Box2D.b2Vec2(0, -rev_speed), this.entity.body.GetWorldCenter());
            }
            else {
               this.entity.body.ApplyForce(new Box2D.b2Vec2(0, -speed), this.entity.body.GetWorldCenter());
            }
         }
         if (game.keyDown('DOWN')) {
            if (v_y < 0) {
               this.entity.body.ApplyForce(new Box2D.b2Vec2(0, rev_speed), this.entity.body.GetWorldCenter());
            }
            else {
               this.entity.body.ApplyForce(new Box2D.b2Vec2(0, speed), this.entity.body.GetWorldCenter());
            }
         }
      }
   });
});