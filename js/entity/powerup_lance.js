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
   var LancePowerup = Powerup.extend({
      material: material,

      powerup: 'LANCE',

      beginContact: function(other) {
         if (Powerup.prototype.beginContact.apply(this, arguments) && other.isPlayer) {
            other.lance.activate()
            other.blade.deactivate();
            other.flail.deactivate();
         }
      },

      update: function(dt, game) {
         Powerup.prototype.update.apply(this, arguments);

         this.rotation.z += dt;
         this.rotation.y += dt;
      },
   });

   return LancePowerup;
})
