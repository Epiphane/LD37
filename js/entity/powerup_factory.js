define([
   'box2d',
   'entity/powerup',
   'entity/powerup_blade',
   'entity/powerup_flail',
   'entity/powerup_mines',
   'entity/powerup_lance',
   'entity/mineman',
], function(
   Box2D,
   Powerup,
   SpinningBlade,
   FlailPowerup,
   Mines,
   LancePowerup,
   MineInstance
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
         if (spawns.length === 0) return;

         var spawn, type, position;
         var tries = 5;
         do {
            spawn = spawns[Math.floor(Math.random() * spawns.length)];
            type = spawn[2];
            position = { x: spawn[0], z: spawn[1] };

            if (--tries < 0)
               return;
         } while (this.getPowerupAt(position));

         if (type === 'POWERUP')
            type = chance.pickone(['LANCE', 'MINES', 'BLADE', 'FLAIL']);

         this.spawnPowerup(type, position);
      },

      spawnPowerup: function(type, position, silent, life, spawner) {
         var spawn;

         if (this.getPowerupAt(position)) {
            return;
         }

         switch(type) {
         case 'COIN':
            var spawn = new Powerup(this.world);
            break;
         case 'BLADE':
            var spawn = new SpinningBlade(this.world);
            break;
         case 'FLAIL':
            var spawn = new FlailPowerup(this.world);
            break;
         case 'LANCE':
            var spawn = new LancePowerup(this.world);
            break;
         case 'MINES':
            var spawn = new Mines(this.world);
            break;
         case 'ACTUAL_MINE':
            var spawn = new MineInstance(this.world, life, spawner === window.game.roomba);
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
               type: powerup.powerup,
               life: powerup.life
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
