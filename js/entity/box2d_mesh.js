define([
   'box2d',
], function(
   Box2D
) {
   // DEFINITION
   var Box2DMesh = Juicy.Mesh.extend({
      constructor: function(components, world, geometry, material, bodyDef, fixtureDef) {
         if (!world) {
            world = components;
            components = undefined;
         }

         geometry   = geometry   || this.getDefault('geometry');
         material   = material   || this.getDefault('material');
         bodyDef    = bodyDef    || this.getDefault('bodyDef');
         fixtureDef = fixtureDef || this.getDefault('fixtureDef');

         Juicy.Mesh.call(this, geometry, material, components);

         // Initialize Box2D component
         this.body = world.CreateBody(bodyDef);
         this.body.CreateFixture(fixtureDef);
         this.body.SetUserData(this.id);

         this.shouldRemove = false;
      },

      beginContact: function(other) {
         console.log('ow!');
      },

      endContact: function(other) {

      },

      getDefault: function(key) {
         if (typeof(this[key]) === 'function')
            return this[key]();
         else
            return this[key];
      },

      update: function(dt, game) {
         var bodyPos = this.body.GetPosition();
         this.position.set(bodyPos.get_y(), this.position.y, -bodyPos.get_x());

         Juicy.Mesh.prototype.update.apply(this, arguments);
      }
   });

   return Box2DMesh;
})
