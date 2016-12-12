define([
   'box2d',
   'network/setup',
], function(
   Box2D,
   Network
) {
   return Juicy.Component.create('RoombaInput', {
      constructor: function(entity) {
         Juicy.Component.call(this);

         this.entity = entity;
      }
   });
});