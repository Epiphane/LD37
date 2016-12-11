define([
   'box2d',
   'helper/box2d'
], function(
   Box2D,
   Box2DHelper
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

         if (!(bodyDef instanceof Box2D.b2BodyDef)) {
            bodyDef = Box2DHelper.createBodyDef(bodyDef);
         }
         if (!(fixtureDef instanceof Box2D.b2FixtureDef)) {
            fixtureDef = Box2DHelper.createFixtureDef(fixtureDef);
         }

         // Initialize Box2D component
         this.body = world.CreateBody(bodyDef);
         this.body.CreateFixture(fixtureDef);
         this.body.SetUserData(this.id);

         this.shouldRemove = false;
      },

      setPosition: function(x, y, z) {
         this.body.SetTransform(new Box2D.b2Vec2(-z, x), 0);
         this.position.set(x, y, z);
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
         
         this.children.forEach(function(child) {
            if (child.update) {
               child.update(dt, game);
            }
         });
      }
   });

   return Box2DMesh;
})
