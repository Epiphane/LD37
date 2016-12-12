define([
   'entity/box2d_mesh',
   'entity/roomba',
   'helper/map_constants'
], function(
   Box2DMesh,
   Roomba,
   MapConstants
) {
   var FallingTile = Box2DMesh.extend({
      geometry: MapConstants.tileGeometry,
      material: MapConstants.fallingTileMaterial,
      bodyDef: MapConstants.tileBodyDef,
      fixtureDef: MapConstants.tileFixtureDef,

      components: ['Fallable'],

      constructor: function() {
         Box2DMesh.apply(this, arguments);

         this.shaking = false;
         this.falling = false;
         this.respawn = 0;
         this.t = 0;
      },

      beginContact: function(other) {
         if (other instanceof Roomba) {
            // Unstable!
            other.feet[this.id] = this;
         }

         if (!(other instanceof Roomba) || this.respawn || other.dead) {
            return;
         }

         this.shaking = true;
         this.t = 0;
      },

      fall: function() {
         this.falling = true;
         this.shaking = false;
         this.t = 0;
         this.respawn = 2;
         this.getComponent('Fallable').fall();
      },

      endContact: function(other) {
         if (other instanceof Roomba) {
            delete other.feet[this.id];
         }

         if (!(other instanceof Roomba)) {
            return;
         }

         if (this.shaking) {
            this.fall();
         }
      },

      update: function(dt, game) {
         Box2DMesh.prototype.update.apply(this, arguments);

         if (this.shaking) {
            this.t += dt;
            this.position.z += Math.sin(this.t * 50) / 15;

            if (this.t > 1.5) {
               this.fall();
            }
         }

         if (this.respawn) {
            this.respawn -= dt;

            if (this.respawn <= 0) {
               this.respawn = 0;
               this.falling = false;
               this.shaking = false;
               this.getComponent('Fallable').reset();
            }
         }
      }
   });

   return FallingTile;
})