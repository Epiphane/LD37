define([
   'box2d',
   'entity/roomba',
   'entity/powerup',
], function(
   Box2D,
   Roomba,
   Powerup
) {
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png');
   var powerupMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0xff0000});

   // DEFINITION
   var MineInstance = Powerup.extend({
      material: powerupMaterial,

      constructor: function(world, life, delayArming) {
         Powerup.call(this, world);
         if (delayArming) {
            this.timeToArm = 100;
         }
         else {
            this.timeToArm = 0;
         }
         this.life = life || 90;
      },

      powerup: 'ACTUAL_MINE',
      MINE_POWER: 100000000,

      setType: function(type) {
         console.log(type);
      },

      beginContact: function(other) {
         // Only collide with Roombas, and wait for a bit before exploding
         if (!other.isPlayer || this.timeToArm >= 0) {
            return false;
         }

         this.shouldRemove = true;
         this.onDespawn(this);

         var minepos = this.body.GetWorldCenter();
         var unsaferoombapos = other.body.GetWorldCenter();
         var roombapos = new Box2D.b2Vec2(unsaferoombapos.get_x(), unsaferoombapos.get_y());
         roombapos.op_sub(minepos);
         roombapos.op_mul(this.MINE_POWER);
         other.body.ApplyForce(roombapos, other.body.GetWorldCenter());

         Juicy.Sound.play(chance.pickone(['mine']));

         return true;
      },

      update: function(dt, game) {
         Powerup.prototype.update.apply(this, arguments);

         this.life -= dt;
         if (this.life < 0) {
            this.shouldRemove = true;
            this.onDespawn(this);
         }

         this.rotation.z += dt;
         // Maybe blink red, later. But who cares??? not me.
         this.timeToArm --;
      },
   });

   return MineInstance;
})
