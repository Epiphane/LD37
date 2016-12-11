define([
   'network/setup'
], function(
   Network
) {
   return Juicy.Component.create('NetworkedRoomba', {
      constructor: function(entity) {
         Juicy.Component.call(this);

         this.entity = entity;
      },

      networkUpdate: function(data) {
         this.entity.body.SetTransform(new Box2D.b2Vec2(data.position.x, data.position.y), this.entity.body.GetAngle());
         this.entity.body.SetLinearVelocity(new Box2D.b2Vec2(data.velocity.x, data.velocity.y));


      },
   });
});
