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
      tileGeometry: tileGeometry,

      texture: texture,
      material: new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture }),
      fallingTileMaterial: new THREE.MeshBasicMaterial({ color: 0xaaaaaa, map: texture }),
   };

   // Texture UVs
   wallGeometry.faceVertexUvs[0] = [];
   // Front
   wallGeometry.faceVertexUvs[0][0] = [new THREE.Vector2(0, 1), new THREE.Vector2(0, 0),     new THREE.Vector2(0.125, 1)];
   wallGeometry.faceVertexUvs[0][1] = [new THREE.Vector2(0, 0), new THREE.Vector2(0.125, 0), new THREE.Vector2(0.125, 1)];
   // Right
   wallGeometry.faceVertexUvs[0][10] = [new THREE.Vector2(0.125, 1), new THREE.Vector2(0.125, 0), new THREE.Vector2(0.25, 1)];
   wallGeometry.faceVertexUvs[0][11] = [new THREE.Vector2(0.125, 0), new THREE.Vector2(0.25, 0),  new THREE.Vector2(0.25, 1)];
   // Back
   wallGeometry.faceVertexUvs[0][2] = [new THREE.Vector2(0.25, 1), new THREE.Vector2(0.25, 0), new THREE.Vector2(0.375, 1)];
   wallGeometry.faceVertexUvs[0][3] = [new THREE.Vector2(0.25, 0), new THREE.Vector2(0.375, 0), new THREE.Vector2(0.375, 1)];
   // Left
   wallGeometry.faceVertexUvs[0][8] = [new THREE.Vector2(0.375, 1), new THREE.Vector2(0.375, 0), new THREE.Vector2(0.5, 1)];
   wallGeometry.faceVertexUvs[0][9] = [new THREE.Vector2(0.375, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0.5, 1)];
   // Top
   wallGeometry.faceVertexUvs[0][4] = [new THREE.Vector2(0.625, 1), new THREE.Vector2(0.5, 1), new THREE.Vector2(0.625, 0.75)];
   wallGeometry.faceVertexUvs[0][5] = [new THREE.Vector2(0.5, 1), new THREE.Vector2(0.5, 0.75), new THREE.Vector2(0.625, 0.75)];
   // Bottom
   wallGeometry.faceVertexUvs[0][6] = [new THREE.Vector2(0.625, 1), new THREE.Vector2(0.625, 0.75), new THREE.Vector2(0.75, 1)];
   wallGeometry.faceVertexUvs[0][7] = [new THREE.Vector2(0.625, 0.75), new THREE.Vector2(0.75, 0.75), new THREE.Vector2(0.75, 1)];

   tileGeometry.faceVertexUvs[0] = [];
   // Front
   tileGeometry.faceVertexUvs[0][0] = [new THREE.Vector2(0.5, 0.5),  new THREE.Vector2(0.5, 0.25),   new THREE.Vector2(0.625, 0.5)];
   tileGeometry.faceVertexUvs[0][1] = [new THREE.Vector2(0.5, 0.25), new THREE.Vector2(0.625, 0.25), new THREE.Vector2(0.625, 0.5)];
   // Right
   tileGeometry.faceVertexUvs[0][10] = [new THREE.Vector2(0.625, 0.5),  new THREE.Vector2(0.625, 0.25), new THREE.Vector2(0.75, 0.5)];
   tileGeometry.faceVertexUvs[0][11] = [new THREE.Vector2(0.625, 0.25), new THREE.Vector2(0.75, 0.25),  new THREE.Vector2(0.75, 0.5)];
   // Back
   tileGeometry.faceVertexUvs[0][2] = [new THREE.Vector2(0.5, 0.25), new THREE.Vector2(0.5, 0),   new THREE.Vector2(0.625, 0.25)];
   tileGeometry.faceVertexUvs[0][3] = [new THREE.Vector2(0.5, 0),    new THREE.Vector2(0.625, 0), new THREE.Vector2(0.625, 0.25)];
   // Left
   tileGeometry.faceVertexUvs[0][8] = [new THREE.Vector2(0.625, 0.25), new THREE.Vector2(0.625, 0), new THREE.Vector2(0.75, 0.25)];
   tileGeometry.faceVertexUvs[0][9] = [new THREE.Vector2(0.625, 0),    new THREE.Vector2(0.75, 0),  new THREE.Vector2(0.75, 0.25)];
   // Top
   tileGeometry.faceVertexUvs[0][4] = [new THREE.Vector2(0.625, 0.75), new THREE.Vector2(0.5, 0.75), new THREE.Vector2(0.625, 0.5)];
   tileGeometry.faceVertexUvs[0][5] = [new THREE.Vector2(0.5, 0.75), new THREE.Vector2(0.5, 0.5), new THREE.Vector2(0.625, 0.5)];
   // Bottom
   tileGeometry.faceVertexUvs[0][6] = [new THREE.Vector2(0.625, 0.625), new THREE.Vector2(0.625, 0.5), new THREE.Vector2(0.75, 0.625)];
   tileGeometry.faceVertexUvs[0][7] = [new THREE.Vector2(0.625, 0.5),   new THREE.Vector2(0.75, 0.5),  new THREE.Vector2(0.75, 0.625)];

   return MapConstants;
});