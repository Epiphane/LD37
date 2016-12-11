define([
   'box2d',
   'entity/powerup',
   'entity/powerup_blade'
], function(
   Box2D,
   Powerup,
   SpinningBlade
) {
   var PowerupFactory = Juicy.Entity.extend({
      constructor: function(world) {
         Juicy.Entity.call(this);

         this.world = world;

         this.onSpawn = function() {};
         this.onDespawn = function() {};
      },

      spawnPowerup: function(type, position, silent) {
         var spawn;

         switch(type) {
         case 'COIN':
            var spawn = new Powerup(this.world);
            break;
         case 'BLADE':
            var spawn = new SpinningBlade(this.world);
            break;
         default:
            console.log('Type ' + type + ' not recognized :O');
            return;
         }
         
         spawn.setPosition(position.x, spawn.position.y, position.z);
         spawn.onDespawn = this.onDespawn;
         this.add(spawn);

         if (!silent && this.onSpawn)
            this.onSpawn(spawn);
      },

      getPowerupAt: function(position) {
         return this.children.find(function(child) {
            return child.position.x === position.x && child.position.z === position.z;
         });
      },

      getSpawnData: function() {
         return this.children.map(function(powerup) {
            return {
               position: { x: powerup.position.x, z: powerup.position.z },
               type: powerup.powerup
            }
         });
      },

      update: function(dt, game) {
         var self = this;
         this.children.forEach(function(child) {
            child.update(dt, game);

            if (child.shouldRemove) {
               self.remove(child);
            }
         })
      }
   });

   return PowerupFactory;
})
