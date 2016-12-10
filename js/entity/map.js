define([
   'box2d',
], function(
   Box2D
) {
   // TWEAK THESE
   var wallRadius = 0.5;

   // Load texture
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png');
   var material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture });

   var FLOOR = 0,
       WALL  = 1;

   // BOX2D
   var wallBodyDef = new Box2D.b2BodyDef();
       wallBodyDef.set_type(Box2D.b2_kinematicBody);
   var wallShape = new Box2D.b2PolygonShape();
       wallShape.SetAsBox(wallRadius, wallRadius);
   var wallFixtureDef = new Box2D.b2FixtureDef();
       wallFixtureDef.set_density(0.0);
       wallFixtureDef.set_shape(wallShape);

   var Map = Juicy.Entity.extend({
      constructor: function() {
         Juicy.Entity.apply(this, arguments);

         this.tiles = [];
      },

      load: function(layout, world) {
         this.tiles = [];
         layout.forEach(function(row, x_2) {
            var row_1 = [];
            var row_2 = [];

            for (var z = 0; z < row.length; z ++) {
               var top = FLOOR, bottom = FLOOR;
               switch(row[z]) {
                  case ' ':
                     break;
                  case '_':
                     bottom = WALL;
                     break;
                  case '=':
                  case '|':
                     bottom = WALL;
                  case '-':
                     top = WALL;
                     break;
               }

               row_1.unshift(top);
               row_2.unshift(bottom);
            }

            this.tiles.push(row_1);
            this.tiles.push(row_2);
         }.bind(this));

         var tilesize = 2;
         var tileGeometry = new THREE.BoxGeometry(1, 1, 1);
         var wallGeometry = new THREE.BoxGeometry(1, 4, 1);

         this.tiles.forEach(function(row, x) {
            row.forEach(function(tile, z) {
               var tileObj;

               switch (tile) {
                  case FLOOR:
                     var tileObj = new THREE.Mesh(tileGeometry, material);
                         tileObj.position.y = -0.5;
                     break;
                  case WALL:
                     var tileObj = new THREE.Mesh(wallGeometry, material);
                         tileObj.position.y = 2;

                     wallBodyDef.set_position(new Box2D.b2Vec2(-z, x));
                     var wall = world.CreateBody(wallBodyDef);
                         wall.CreateFixture(wallFixtureDef);
                     break;
               }
   
               tileObj.position.x = x;
               tileObj.position.z = z;
               this.add(tileObj);
            }.bind(this));
         }.bind(this));
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
      }
   });

   return Map;
})