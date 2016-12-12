define([
   'network/setup'
], function(
   Network
) {
   return Juicy.Component.create('NetworkedRoomba', {
      constructor: function(entity) {
         Juicy.Component.call(this);

         this.entity = entity;

         this.entity.networked = true;
      },

      networkUpdate: function(data) {
         this.entity.body.SetTransform(new Box2D.b2Vec2(data.position.x, data.position.y), this.entity.body.GetAngle());
         this.entity.body.SetLinearVelocity(new Box2D.b2Vec2(data.velocity.x, data.velocity.y));
         this.entity.blade.visible = data.bladeEnabled;
         this.entity.setColor(data.color);
         if (data.flail) {
            // this.entity.flail.visible = !!data.flail.enabled;
            // this.entity.flail.body.SetTransform(new Box2D.b2Vec2(data.flail.position.x, data.flail.position.y), this.entity.flail.body.GetAngle());
            // this.entity.flail.body.SetLinearVelocity(new Box2D.b2Vec2(data.flail.velocity.x, data.flail.velocity.y));
         }
            // console.log(this.entity.body.GetPosition().get_x(), this.entity.body.GetPosition().get_y());
            // console.log(this.entity.body.GetLinearVelocity().get_x(), this.entity.body.GetLinearVelocity().get_y());
         if (data.lance) {
            this.entity.lance.visible = !!data.lance.enabled;
            this.entity.lance.body.SetTransform(this.entity.lance.body.GetPosition(), data.lance.angle);
         }

         // Get score, update hi-score table
         if (window.scores[data.name] !== data.score) {
            window.scores[data.name] = data.score;
            updateHighScores();
         }
      },
   });
});
