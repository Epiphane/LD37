define([
    'helper/image'
], function(
    Image
) {
   /* 
    * 2D screen
    */
   return Juicy.State.extend({
      constructor: function(width, height) {
         Juicy.State.apply(this, arguments);

         var wat = new Image('index.jpg');

         var self = this;
         setTimeout(function() {
            self.scene.add(wat);
         }, 10);

         this.orthographic();

         // this.scene = new THREE.Scene();

         // this.imageScale = 128;

         // this.width = width;
         // this.height = height;

         // // Create random particle system first
         // // this.particleSystem = new THREE.GPUParticleSystem({
         // //    maxParticles: 250000
         // // });
         // // this.scene.add(this.particleSystem);
         // this.tick = 0;

         // // Lighting
         // var ambientLight = new THREE.AmbientLight(0x606060);
         // this.scene.add(ambientLight);

         // var directionalLight = new THREE.DirectionalLight(0xffffff);
         //     directionalLight.position.set(1, 0.75, 0.5).normalize();
         // this.scene.add(directionalLight);

         // // Camera
         // var orthoScale = 2;
         // this.camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 1000);
         // this.camera = new THREE.OrthographicCamera(-this.width / orthoScale, 
         //                                             this.width / orthoScale, 
         //                                             this.height / orthoScale, 
         //                                            -this.height / orthoScale, -500, 1000);
         // this.camera.position.y = 0;
         // this.camera.position.z = 20;
         // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      }
   });
});