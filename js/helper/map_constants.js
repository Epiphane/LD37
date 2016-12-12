define([
   'box2d',
   'helper/box2d'
], function(
   Box2D,
   Box2DHelper
) {
   // TWEAK THESE
   var tileRadius = 0.5;

   // THREE JS
   var texture = new THREE.TextureLoader().load('textures/environment1.png');
   var tileGeometry = new THREE.BoxGeometry(1, 1, 1);
   var wallGeometry = new THREE.BoxGeometry(1, 4, 1);
   var wallBroken1Geometry = new THREE.BoxGeometry(1, 3, 1);
   var wallBroken2Geometry = new THREE.BoxGeometry(1, 2, 1);
   var wallBrokenGeometry = new THREE.BoxGeometry(1, 1, 1);

   var MapConstants = {
      tileRadius: tileRadius,
      tileBodyDef: Box2DHelper.createBodyDef({
         type: Box2D.b2_kinematicBody
      }),
      wallFixtureDef: Box2DHelper.createFixtureDef({
         shape: {
            type: 'box',
            args: [tileRadius, tileRadius]
         },
         density: 0.0
      }),
      tileFixtureDef: Box2DHelper.createFixtureDef({
         density: 0.0,
         isSensor: true,
         shape: {
            type: 'box',
            args: [tileRadius, tileRadius]
         }
      }),
      
      wallGeometry: wallGeometry,
      wallBroken1Geometry: wallBroken1Geometry,
      wallBroken2Geometry: wallBroken2Geometry,
      wallBrokenGeometry: wallBrokenGeometry,
      tileGeometry: tileGeometry,

      texture: texture,
      material: new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, transparent: true }),
      fallingTileMaterial: new THREE.MeshBasicMaterial({ color: 0xaaaaaa, map: texture, transparent: true }),
   };

   // Texture UVs
   var FRONT = 0, BACK = 2, TOP = 4, BOTTOM = 6, LEFT = 8, RIGHT = 10;
   function uvSquare(geometry, side, width, height, min_x, min_y, max_x, max_y) {
      min_x /= width;
      max_x /= width;
      min_y /= height;
      max_y /= height;

      geometry.faceVertexUvs[0][side]     = [new THREE.Vector2(min_x, max_y), new THREE.Vector2(min_x, min_y), new THREE.Vector2(max_x, max_y)];
      geometry.faceVertexUvs[0][side + 1] = [new THREE.Vector2(min_x, min_y), new THREE.Vector2(max_x, min_y), new THREE.Vector2(max_x, max_y)];
   }

   var texture_size = 512;

   wallGeometry.faceVertexUvs[0] = [];
   uvSquare(wallGeometry, FRONT,  texture_size, texture_size, 0,   0,  32,  128);
   uvSquare(wallGeometry, RIGHT,  texture_size, texture_size, 32,  0,  64,  128);
   uvSquare(wallGeometry, BACK,   texture_size, texture_size, 64,  0,  96,  128);
   uvSquare(wallGeometry, LEFT,   texture_size, texture_size, 96,  96, 128, 128);
   uvSquare(wallGeometry, TOP,    texture_size, texture_size, 128, 96, 160, 128);
   uvSquare(wallGeometry, BOTTOM, texture_size, texture_size, 160, 96, 192, 128);

   var off = 192;
   wallBroken1Geometry.faceVertexUvs[0] = [];
   uvSquare(wallBroken1Geometry, FRONT,  texture_size, texture_size, off+0,   0,  off+32,  128);
   uvSquare(wallBroken1Geometry, RIGHT,  texture_size, texture_size, off+32,  0,  off+64,  128);
   uvSquare(wallBroken1Geometry, BACK,   texture_size, texture_size, off+64,  0,  off+96,  128);
   uvSquare(wallBroken1Geometry, LEFT,   texture_size, texture_size, off+96,  96, off+128, 128);
   uvSquare(wallBroken1Geometry, TOP,    texture_size, texture_size, off+128, 96, off+160, 128);
   uvSquare(wallBroken1Geometry, BOTTOM, texture_size, texture_size, off+160, 96, off+192, 128);

   var off = 384;
   wallBroken2Geometry.faceVertexUvs[0] = [];
   uvSquare(wallBroken2Geometry, TOP,    texture_size, texture_size, 192+128, 64, 192+160, 96);
   uvSquare(wallBroken2Geometry, BOTTOM, texture_size, texture_size, 192+160, 64, 192+192, 96);
   uvSquare(wallBroken2Geometry, FRONT,  texture_size, texture_size, off+0,   0,  off+32,  128);
   uvSquare(wallBroken2Geometry, RIGHT,  texture_size, texture_size, off+32,  0,  off+64,  128);
   uvSquare(wallBroken2Geometry, BACK,   texture_size, texture_size, off+64,  0,  off+96,  128);
   uvSquare(wallBroken2Geometry, LEFT,   texture_size, texture_size, off+96,  96, off+128, 128);

   wallBrokenGeometry.faceVertexUvs[0] = [];
   uvSquare(wallBrokenGeometry, TOP,    texture_size, texture_size, 128, 64, 160, 96);
   uvSquare(wallBrokenGeometry, BOTTOM, texture_size, texture_size, 160, 64, 192, 96);
   uvSquare(wallBrokenGeometry, FRONT,  texture_size, texture_size, 128, 32, 160, 64);
   uvSquare(wallBrokenGeometry, RIGHT,  texture_size, texture_size, 160, 32, 192, 64);
   uvSquare(wallBrokenGeometry, BACK,   texture_size, texture_size, 128,  0, 160, 32);
   uvSquare(wallBrokenGeometry, LEFT,   texture_size, texture_size, 160,  0, 192, 32);

   tileGeometry.faceVertexUvs[0] = [];
   uvSquare(tileGeometry, TOP,    texture_size, texture_size, 128, 64, 160, 96);
   uvSquare(tileGeometry, BOTTOM, texture_size, texture_size, 160, 64, 192, 96);
   uvSquare(tileGeometry, FRONT,  texture_size, texture_size, 128, 32, 160, 64);
   uvSquare(tileGeometry, RIGHT,  texture_size, texture_size, 160, 32, 192, 64);
   uvSquare(tileGeometry, BACK,   texture_size, texture_size, 128,  0, 160, 32);
   uvSquare(tileGeometry, LEFT,   texture_size, texture_size, 160,  0, 192, 32);

   return MapConstants;
});