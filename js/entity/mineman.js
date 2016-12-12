define([
   'box2d',
   'entity/roomba',
   'entity/powerup',
], function(
   Box2D,
   Roomba,
   Powerup
) {

   // DEFINITION
   var MineInstance = Powerup.extend({

      powerup: 'ACTUAL_MINE',

      setType: function(type) {
         console.log(type);
      },

      beginContact: function(other) {
         // Only collide with Roombas
         if (!other.isPlayer) {
            return false;
         }

         this.shouldRemove = true;
         this.onDespawn(this);

         other.body.ApplyForce(new Box2D.b2Vec2(0, 2000), other.body.GetWorldCenter());

         return true;
      },

      update: function(dt, game) {
         Powerup.prototype.update.apply(this, arguments);

         // Maybe blink red, later. But who cares??? not me.
      },
   });

   return MineInstance;
})
