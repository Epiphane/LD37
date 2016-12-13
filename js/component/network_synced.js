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
         if (data.hasOwnProperty('face') && this.entity.face !== data.face)
            this.entity.setFace(data.face);
         if (data.hasOwnProperty('color') && !this.entity.material.color.equals(data.color))
            this.entity.setColor(data.color);
         if (data.flail) {
            this.entity.flail.visible = !!data.flail.enabled;
            this.entity.flail.angle = data.flail.angle;
            // this.entity.flail.body.SetTransform(this.entity.flail.body.GetPosition(), data.flail.angle);
         }
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
