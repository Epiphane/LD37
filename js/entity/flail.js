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
   var flailRadius = 0.6;
   var flailHeight = 0.5;

   // THREE.JS
   var flailGeometry = new THREE.CylinderGeometry(flailRadius, flailRadius, flailHeight, 32);
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png');
   var flailMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0xffccff});

   return Box2DMesh.extend({
      material: flailMaterial,
      geometry: flailGeometry,

      bodyDef: Box2DHelper.createBodyDef({
         // type: Box2D.b2_kinematicBody,
         type: Box2D.b2_dynamicBody,
         position: new Box2D.b2Vec2(5.0, 0.0)
      }),

      fixtureDef: Box2DHelper.createFixtureDef({
         shape: {
            type: 'circle',
            args: [flailRadius]
         },
         // isSensor: true,
         density: 0.0
      }),

      constructor: function(roomba, world) {
         Box2DMesh.call(this, [], world);

         this.roomba = roomba;

         // Initialize Box2D component
         this.body = world.CreateBody(this.bodyDef);
         this.body.CreateFixture(this.fixtureDef);
         this.body.SetUserData(this.id);

         var joint = new Box2D.b2DistanceJointDef();
             joint.set_collideConnected(false);
             joint.set_bodyA(roomba.body);
             joint.set_bodyB(this.body);
             joint.set_length(2);
             joint.set_dampingRatio(1);
             joint.set_frequencyHz(4);
             joint.set_localAnchorA(new Box2D.b2Vec2(0.0, 0.0));//roomba.body.GetPosition());
             joint.set_localAnchorB(new Box2D.b2Vec2(0.0, 0.0));//this.body.GetPosition());

         // joint.Initialize(entity.body, this.body, new Box2D.b2Vec2(0.0, 0.0));
         world.CreateJoint(joint);

         this.speed = 2;
         // this.position.y -= 0.5;
      },

      activate: function() {
         this.visible = true;
      },

      deactivate: function() {
         this.visible = false;
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
         if (!!this.body.IsActive() !== !!this.visible) {
            this.body.SetActive(!!this.visible);
            if (this.visible) {
               this.body.SetTransform(this.roomba.body.GetPosition(), 0);
            }
         }

         Box2DMesh.prototype.update.apply(this, arguments);
         this.position.x -= this.parent.position.x;
         this.position.z -= this.parent.position.z;

         if (!this.visible)
            return;

         // this.rotation.y += dt * 4 * this.speed;
      }
   });
});
