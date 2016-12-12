define([
   'box2d',
   'helper/box2d',
   'entity/box2d_mesh',
   'component/obj_mesh',
], function(
   Box2D,
   Box2DHelper,
   Box2DMesh,
   OBJMesh
) {
   // TWEAK THESE
   var bladeRadius = 1.0;
   var bladeHeight = 0.5;

   return Juicy.Entity.extend({
      bodyDef: Box2DHelper.createBodyDef({
         // type: Box2D.b2_kinematicBody,
         type: Box2D.b2_dynamicBody
      }),

      fixtureDef: Box2DHelper.createFixtureDef({
         shape: {
            type: 'circle',
            args: [bladeRadius]
         },
         isSensor: true,
         density: 0.0
      }),

      constructor: function(entity, world) {
         Juicy.Entity.call(this, ['OBJMesh']);

         // Initialize Box2D component
         this.body = world.CreateBody(this.bodyDef);
         this.body.CreateFixture(this.fixtureDef);
         this.body.SetUserData(this.id);

         var joint = new Box2D.b2WeldJointDef();
             joint.set_collideConnected(false);

         joint.Initialize(entity.body, this.body, new Box2D.b2Vec2(0.0, 0.0));
         world.CreateJoint(joint);

         this.shouldRemove = false;

         this.getComponent('OBJMesh').load('art/', 'test_texture.mtl', 'sawblade.obj');
         this.getComponent('OBJMesh').position.y -= 0.25;

         this.speed = -1;
         // this.visible = false;
      },

      activate: function() {
         this.visible = true;
         this.body.GetFixtureList().SetSensor(false);
      },

      deactivate: function() {
         this.visible = false;
         this.body.GetFixtureList().SetSensor(true);
      },

      beginContact: function(other) {
         if (!this.visible || this.parent.dead)
            return;

         // Using Roomba itself would create a circular dependency
         if (other instanceof this.parent.__proto__.constructor) {
            if (other.blade.visible) {
               // var rando = new Box2D.b2Vec2(Math.random() * 20, Math.random * 20);
               // this.body.ApplyForce(rando, this.body.GetWorldCenter());

               // rando = new Box2D.b2Vec2(Math.random() * 20, Math.random * 20);
               // other.body.ApplyForce(rando, other.body.GetWorldCenter());
            }
            else {
               if (!other.networked) {
                  other.weaponDeath();
               }
            }
         }
      },

      endContact: function(other) {
      },

      update: function(dt) {
         if (!this.visible)
            return;

         this.rotation.y += dt * 4 * this.speed;
      }
   });
});
