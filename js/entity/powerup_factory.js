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

      spawn: function(room) {
         var spawns = room.spawns.all;
         var spawn, type, position;
         do {
            spawn = spawns[Math.floor(Math.random() * spawns.length)];
            type = spawn[2];
            position = { x: spawn[0], z: spawn[1] };
         } while (this.getPowerupAt(position));

         if (type === 'POWERUP')
            type = 'BLADE';

         this.spawnPowerup(type, position);
      },

      spawnPowerup: function(type, position, silent) {
         var spawn;

         if (this.getPowerupAt(position)) {
            console.error('Ya dingus! theres already a powerup at ' + position + '!');
         }

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
