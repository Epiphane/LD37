define([
   'box2d',
   'network/setup',
], function(
   Box2D,
   Network
) {
   return Juicy.Component.create('RoombaInput', {
      constructor: function(entity) {
         Juicy.Component.call(this);

         this.entity = entity;

         this.cameraDirection = new THREE.Vector3(1, 0, 0);
         this.cameraRight = new THREE.Vector3(0, 0, 1);
         this.slowdown = 4;

         this.broadcastTick = 3;
      },

      broadcastState: function() {
         this.broadcastTick--
         if (this.broadcastTick === 0) {
            this.broadcastTick = 2;
            var posn = this.entity.body.GetPosition();
            var velc = this.entity.body.GetLinearVelocity();
            var f_posn = this.entity.flail.body.GetPosition();
            var f_velc = this.entity.flail.body.GetLinearVelocity();
            Network.broadcastRoombaState({
               face: this.entity.face,
               color: this.entity.material.color.getHexString(),
               position: {x: posn.get_x(), y: posn.get_y()},
               velocity: {x: velc.get_x(), y: velc.get_y()},
               score: this.entity.score,
               bladeEnabled: this.entity.blade.visible,
               flail: {
                  enabled: this.entity.flail.visible,
                  position: {x: f_posn.get_x(), y: f_posn.get_y()},
                  angle: this.entity.flail.body.GetAngle()
               },
               lance: {
                  enabled: this.entity.lance.visible,
                  angle: this.entity.lance.body.GetAngle()
               }
            });
         }
      },

      update: function(dt, game) {
         if (this.entity.dead && !this.entity.falling)
            return;

         var velocity = this.entity.body.GetLinearVelocity();
         var v_x = velocity.get_x();
         var v_y = velocity.get_y();
         var speed = 5000;
         var rev_speed = 5000;
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

         this.broadcastState();
      }
   });
});
