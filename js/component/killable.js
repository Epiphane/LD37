define([], function() {
   return Juicy.Component.create('Killable', {
      constructor: function(entity) {
         Juicy.Component.call(this);

         this.entity = entity;
         this.killed = false;
         this.t = 0;
      },

      kill: function() {
         if (this.killed)
            return;

         this.killed = true;
         this.t = 0;
         this.entity.material.color.set(0xff0000);
      },

      reset: function() {
         if (!this.killed)
            return;

         this.killed = false;
         this.t = 0;

         this.entity.rotation.z = 0;
         this.entity.material.color.set(0x66ccff);
      },

      update: function(dt, game) {
         if (!this.killed)
            return;

         this.t = Math.min(this.t + dt, 1);
         this.entity.rotation.z = Math.PI * this.t;
      }
   });
});