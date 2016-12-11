define([
   'box2d',
   'entity/box2d_mesh',
   'entity/roomba',
   'entity/powerup_blade',
   'component/fallable'
], function(
   Box2D,
   Box2DMesh,
   Roomba,
   Powerup,
   Fallable
) {
   // TWEAK THESE
   var wallRadius = 0.5;

   // Load texture
   var tileGeometry = new THREE.BoxGeometry(1, 1, 1);
   var wallGeometry = new THREE.BoxGeometry(1, 4, 1);
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png');
   var material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture });

   // R
   var WALL    = 0,
       FALLING = 128,
       FLOOR   = 255;
   // G
   var NOTHING = 0,
       COIN    = 64,
       POWERUP = 128,
       SPAWN   = 255;

   // BOX2D
   var wallBodyDef = new Box2D.b2BodyDef();
       wallBodyDef.set_type(Box2D.b2_kinematicBody);
   var wallShape = new Box2D.b2PolygonShape();
       wallShape.SetAsBox(wallRadius, wallRadius);
   var wallFixtureDef = new Box2D.b2FixtureDef();
       wallFixtureDef.set_density(0.0);
       wallFixtureDef.set_shape(wallShape);

   var FallingTile = Box2DMesh.extend({
      geometry: tileGeometry,
      material: new THREE.MeshBasicMaterial({ color: 0xaaaaaa, map: texture }),
      bodyDef: {
         type: Box2D.b2_kinematicBody
      },
      fixtureDef: {
         density: 0.0,
         isSensor: true,
         shape: {
            type: 'box',
            args: [wallRadius, wallRadius]
         }
      },

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

   var Map = Juicy.Entity.extend({
      constructor: function() {
         Juicy.Entity.apply(this, arguments);

         this.tiles = [];
         this.coins = [];
         this.spawns = {
            player: [],
            powerup: []
         };
      },

      loadImage: function(canvas, world) {
         var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;

         this.tiles = [];
         this.spawns = {
            player: [],
            coin: [],
            powerup: []
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
               row.push([type, flag, 0]);
            }

            this.tiles.push(row);
         }

         this.populateTiles(world);
      },

      populateTiles: function(world) {
         var tilesize = 2;

         this.tiles.forEach(function(row, x) {
            row.forEach(function(tile, z) {
               var tileObj;

               // Tile type
               switch (tile[0]) {
                  case FLOOR:
                     var tileObj = new THREE.Mesh(tileGeometry, material);
                         tileObj.position.set(x, -0.5, z);
                     break;
                  case WALL:
                     var tileObj = new THREE.Mesh(wallGeometry, material);
                         tileObj.position.set(x, 2, z);

                     wallBodyDef.set_position(new Box2D.b2Vec2(-z, x));
                     var wall = world.CreateBody(wallBodyDef);
                         wall.CreateFixture(wallFixtureDef);
                     break;
                  case FALLING:
                     var tileObj = new FallingTile(world);
                         tileObj.setPosition(x, -0.5, z);
                     break;
               }

               // Tile flag
               switch (tile[1]) {
                  case NOTHING:
                     break;
                  case COIN:
                     var coin = new Powerup(world);
                         coin.setPosition(x, coin.position.y, this.tiles.length - 1 - z);

                     this.coins.push(coin);
                     this.add(coin);
                     break;
                  case POWERUP:
                     this.spawns.powerup.push([x, this.tiles.length - 1 - z]);
                     break;
                  case SPAWN:
                     this.spawns.player.push([x, this.tiles.length - 1 - z]);
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