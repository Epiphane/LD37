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
   var lanceWidth = 0.15;
   var lanceLength = 2.0;
   var lanceHeight = 0.1;

   // THREE.JS
   var lanceGeometry = new THREE.BoxGeometry(lanceLength * 2, lanceHeight, lanceWidth * 2);
   var texture = new THREE.TextureLoader().load('textures/square-outline-textured.png');
   var lanceMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0xffccff});

   return Box2DMesh.extend({
      material: lanceMaterial,
      geometry: lanceGeometry,

      bodyDef: Box2DHelper.createBodyDef({
         // type: Box2D.b2_kinematicBody,
         type: Box2D.b2_dynamicBody,
         position: new Box2D.b2Vec2(0.0, 1.0)
      }),

      fixtureDef: Box2DHelper.createFixtureDef({
         shape: {
            type: 'box',
            args: [lanceWidth / 2, lanceLength]
         },
         isSensor: true,
         density: 0.0
      }),

      constructor: function(roomba, world) {
         Box2DMesh.call(this, [], world);

         this.roomba = roomba;

         // Initialize Box2D component
         this.body = world.CreateBody(this.bodyDef);
         this.body.CreateFixture(this.fixtureDef);
         this.body.SetUserData(this.id);

         var joint = new Box2D.b2WeldJointDef();
             joint.set_collideConnected(false);
             joint.set_bodyA(roomba.body);
             joint.set_bodyB(this.body);
             joint.set_localAnchorA(new Box2D.b2Vec2(0.0, 0.0));//roomba.body.GetPosition());
             joint.set_localAnchorB(new Box2D.b2Vec2(0.0, 0.0));//this.body.GetPosition());

         // joint.Initialize(entity.body, this.body, new Box2D.b2Vec2(0.0, 0.0));
         var jt = world.CreateJoint(joint);

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
            if (!other.networked) {
               other.weaponDeath();
            }
         }
      },

      endContact: function(other) {
      },

      update: function(dt) {
         if (this.parent.isPlayer) {
            var vel = this.parent.body.GetLinearVelocity();
            var angle = -Math.atan2(vel.get_y(), vel.get_x()) - Math.PI / 2;
            // console.log(Math.round(vel.get_x()), Math.round(vel.get_y()));
            this.body.SetTransform(this.body.GetPosition(), angle);
         }
         this.rotation.y = this.body.GetAngle();


         Box2DMesh.prototype.update.apply(this, arguments);
         this.position.x -= this.parent.position.x;
         this.position.z -= this.parent.position.z;

         if (!this.visible)
            return;

         // this.rotation.y += dt * 4 * this.speed;
      }
   });
});
