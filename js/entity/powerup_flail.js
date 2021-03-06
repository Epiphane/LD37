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
   var FlailPowerup = Powerup.extend({
      material: material,

      powerup: 'FLAIL',

      beginContact: function(other) {
         if (Powerup.prototype.beginContact.apply(this, arguments) && other.isPlayer) {
            other.flail.activate()
            other.lance.deactivate()
            other.blade.deactivate()
         }
      },

      update: function(dt, game) {
         Powerup.prototype.update.apply(this, arguments);

         this.rotation.z += dt;
         this.rotation.y += dt;
      },
   });

   return FlailPowerup;
})
