define([
   'box2d',
   'entity/powerup',
   'entity/roomba'
], function(
   Box2D,
   Powerup,
   Roomba
) {
   var texture = new THREE.TextureLoader().load('art/cover.jpg');
   var material = new THREE.MeshBasicMaterial({map: texture, color: 0xffffff});

   // DEFINITION
   var MinesPowerup = Powerup.extend({
      material: material,

      powerup: 'MINES',

      setType: function(type) {
         console.log(type);
      },

      beginContact: function(other) {
         if (Powerup.prototype.beginContact.apply(this, arguments) && other.isPlayer) {
            other.mineCount = 5;
            other.MINE_COOLDOWN_MAX = 300;
            other.mineCooldown = 0;
         }
      },

      update: function(dt, game) {
         Powerup.prototype.update.apply(this, arguments);

         this.rotation.z += dt * 5;
         this.rotation.y += dt;
      },
   });

   return MinesPowerup;
})
