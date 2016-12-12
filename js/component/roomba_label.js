define([
   'box2d',
   'network/setup',
], function(
   Box2D,
   Network
) {
   var font = jQuery.Deferred();
   var loader = new THREE.FontLoader();
   loader.load( './fonts/droid_sans_bold.typeface.json', function ( response ) {
      font.resolve(response);
   });

   return Juicy.Component.create('RoombaLabel', {
      constructor: function(entity) {
         Juicy.Component.apply(this, arguments);

         this.entity = entity;
         this.ready = false;
         this.material = new THREE.MeshBasicMaterial({ color: 0x66ccff });
      },

      setColor: function(hex) {
         this.material.color.setHex(parseInt(hex, 16));
      },

      setText: function(text) {
         var self = this;
         font.then(function(font) {
            if (self.text)
               self.entity.remove(self.text);
            
            var textGeo = new THREE.TextGeometry(text.toUpperCase(), {
               font: font,
               size: 0.3,
               height: 0.2,
               curveSegments: 4,
               bevelThickness: 0.01,
               bevelSize: 0.02,
               bevelEnabled: false,
               material: 0,
               extrudeMaterial: 0
            });
            textGeo.computeBoundingBox();
            textGeo.computeVertexNormals();

            self.text = new THREE.Mesh(textGeo, self.material);
            self.text.position.x = -0.75;
            self.text.position.y = 1;
            self.text.position.z = 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x )
            self.text.rotation.x = -Math.PI / 2;
            self.text.rotation.z = Math.PI / 2;
            self.entity.add(self.text);
         })
      }
   });
});