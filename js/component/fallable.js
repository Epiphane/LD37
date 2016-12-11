define([], function() {
   return Juicy.Component.create('Fallable', {
      constructor: function(entity) {
         this.entity = entity;
         this.falling = false;
         this.t = 0;
      },

      fall: function() {
         this.falling = true;
         this.t = 0;
      },

      reset: function() {
         this.falling = false;
         this.t = 0;

         this.entity.rotation.x = 0;
         this.entity.rotation.z = 0;
      },

      update: function(dt, game) {
         if (!this.falling)
            return;

         this.t += dt;
         this.entity.rotation.x = 5 * this.t;
         this.entity.rotation.z = 2 * this.t;
         this.entity.position.y = -10 * this.t;
      }
   });
});