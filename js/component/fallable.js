define([], function() {
   return Juicy.Component.create('Fallable', {
      constructor: function(entity) {
         Juicy.Component.call(this);

         this.entity = entity;
         this.falling = false;
         this.t = 0;
      },

      fall: function() {
         if (this.falling)
            return;

         this.falling = true;
         this.t = 0;
         this.base_y = this.entity.position.y;
      },

      reset: function() {
         this.falling = false;
         this.t = 0;

         this.entity.rotation.x = 0;
         this.entity.rotation.z = 0;
         this.entity.position.y = this.base_y;
      },

      update: function(dt, game) {
         if (!this.falling)
            return;

         this.t += dt;
         this.entity.rotation.x = 5 * this.t;
         this.entity.rotation.z = 2 * this.t;
         this.entity.position.y = this.base_y - 10 * this.t;
      }
   });
});