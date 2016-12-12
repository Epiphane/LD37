define([
   'box2d',
   'helper/map'
], function(
   Box2D,
   MapHelper
) {

   // R
   var WALL     = 0,
       BREAKABLE= 64,
       FALLING  = 128,
       FLOOR    = 255;
   // G
   var NOTHING = 0,
       COIN    = 64,
       POWERUP = 128,
       SPAWN   = 255;

   var Map = Juicy.Entity.extend({
      constructor: function() {
         Juicy.Entity.apply(this, arguments);

         this.tiles = [];
         this.spawns = {
            player: [],
            powerup: [],
            coin: [],
            all: []
         };
      },

      loadImage: function(canvas, world) {
         var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;

         this.tiles = [];
         this.spawns = {
            player: [],
            coin: [],
            powerup: [],
            all: []
         };
         for (var y = 0; y < canvas.height; y ++) {
            var row = [];

            for (var x = 0; x < canvas.width; x ++) {
               var ndx = 4 * (x + y * canvas.width);
               var r = imageData[ndx + 0],
                   g = imageData[ndx + 1],
                   b = imageData[ndx + 2],
                   a = imageData[ndx + 3];

               var type = r;
               var flag = g;

               // Black = WALL
               row.unshift([type, flag, 0]);
            }

            this.tiles.push(row);
         }

         this.populateTiles(world);
      },

      populateTiles: function(world) {
         var tilesize = 2;

         MapHelper.setWorld(world);

         this.tiles.forEach(function(row, x) {
            row.forEach(function(tile, z) {
               var tileObj;

               // Tile type
               switch (tile[0]) {
                  case FLOOR:
                     tileObj = MapHelper.createFloor();
                     tileObj.position.set(x, -0.5, z);
                     break;
                  case WALL:
                     tileObj = MapHelper.createWall(x, z);
                     tileObj.position.set(x, 2, z);
                     break;
                  case BREAKABLE:
                     tileObj = MapHelper.createBreakableWall();
                     tileObj.setPosition(x, 2, z);
                     break;
                  case FALLING:
                     tileObj = MapHelper.createFallingFloor();
                     tileObj.setPosition(x, -0.5, z);
                     break;
                  default:
                     console.log('o my');
                     break;
               }

               // Tile flag
               switch (tile[1]) {
                  case NOTHING:
                     break;
                  case COIN:
                     this.spawns.coin.push([x, z]);
                     this.spawns.all.push([x, z, 'COIN']);
                     break;
                  case POWERUP:
                     this.spawns.powerup.push([x, z]);
                     this.spawns.all.push([x, z, 'POWERUP']);
                     break;
                  case SPAWN:
                     this.spawns.player.push([x, z]);
                     break;
               }

               this.add(tileObj);
            }.bind(this));
         }.bind(this));
      },

      getCoinAt: function(x, z) {
         return this.coins.find(function(coin) {
            return coin.position.x === x && coin.position.z === z;
         });
      },

      clampCamera: function(position) {
         if (position.x < 8.5)
            position.x = 8.5;

         if (position.x > this.tiles.length - 1)
            position.x = this.tiles.length - 1;

         if (position.z < 5)
            position.z = 5;

         if (position.z > this.tiles.length - 6)
            position.z = this.tiles.length - 6;

         return position;
      },

      getTile: function(position) {
         var z = Math.min(
                  Math.max(
                   Math.round(position.z)
                  , 0),
                 this.tiles.length - 1);
         var x = Math.min(
                  Math.max(
                   Math.round(position.x)
                  , 0)
                 , this.tiles[0].length - 1);
         // return FLOOR;

         return this.tiles[x][z];
      },

      isBlocking: function(position) {
         return this.getTile(position) === WALL;
      },

      update: function(dt, game) {
         this.children.forEach(function(child) {
            if (child.update) {
               child.update(dt, game);
            }
         });
      }
   });

   return Map;
})
