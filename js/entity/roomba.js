define([
   'component/momentum'
], function(
   Momentum
) {
   var ready;

   // Load texture
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png', function() {
      ready();
   });
   var material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture });

   var roombaRadius = 0.3;
   var roombaHeight = 0.5;
   var roombaGeometry = new THREE.CylinderGeometry(
      roombaRadius, 
      roombaRadius, 
      roombaHeight, 
      32);
   var roombaMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0x66ccff});

   var Roomba = Juicy.Mesh.extend({
      constructor: function() {
         Juicy.Mesh.call(this, roombaGeometry, roombaMaterial, [Momentum]);

         this.position.y += roombaHeight / 2;
      }
   });

   var onReady = [];
   ready = function() {
      Roomba.ready = true;
      while (onReady.length)
         onReady.shift()();
   }

   Roomba.ready = false;
   Roomba.onReady = function(cb) {
      if (Roomba.ready)
         cb();
      else
         onReady.push(cb);
   };

   return Roomba;
})