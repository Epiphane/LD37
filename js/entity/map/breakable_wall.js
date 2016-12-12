define([
   'entity/box2d_mesh',
   'entity/roomba',
   'helper/map_constants'
], function(
   Box2DMesh,
   Roomba,
   MapConstants
) {
   var FullHealthComponent = Juicy.Components.Mesh.extend({
      geometry: MapConstants.wallGeometry,
      material: MapConstants.material,

      constructor: function() {
         Juicy.Components.Mesh.call(this, this.geometry, this.material);
      }
   });

   var OneHitComponent = FullHealthComponent.extend({
      geometry: MapConstants.wallBroken1Geometry
   });

   var TwoHitComponent = FullHealthComponent.extend({
      geometry: MapConstants.wallBroken2Geometry
   });

   var BrokenComponent = FullHealthComponent.extend({
      geometry: MapConstants.wallBrokenGeometry
   });

   var healthComponents = [BrokenComponent, OneHitComponent, FullHealthComponent];

   var BreakingWall = Box2DMesh.extend({
      bodyDef: MapConstants.tileBodyDef,
      fixtureDef: MapConstants.wallFixtureDef,

      constructor: function() {
         Box2DMesh.apply(this, arguments);

         this.health = healthComponents.length - 1;
         this.respawn = 0;
         this.hitCooldown = 0;

         this.geomComponent = new FullHealthComponent();
         this.add(this.geomComponent);
      },

      beginContact: function(other) {
         if (!(other instanceof Roomba) || this.respawn || other.dead || this.hitCooldown > 0) {
            return;
         }

         this.health --;
         this.hitCooldown = 0.2;

         this.remove(this.geomComponent);
         this.geomComponent = new healthComponents[this.health]();
         this.add(this.geomComponent);

         if (this.health === 0) {
            this.respawn = 5;
            this.body.GetFixtureList().SetSensor(true);
         }
      },

      endContact: function(other) {
      },

      update: function(dt, game) {
         Box2DMesh.prototype.update.apply(this, arguments);

         if (this.hitCooldown > 0) {
            this.hitCooldown -= dt;
         }

         this.position.y = this.health * 2.5 / (healthComponents.length - 1) - 0.5;

         if (this.respawn) {
            this.respawn -= dt;

            if (this.respawn <= 0) {
               this.body.GetFixtureList().SetSensor(false);

               this.respawn = 0;
               this.health = healthComponents.length - 1;
               this.remove(this.geomComponent);
               this.geomComponent = new healthComponents[this.health]();
               this.add(this.geomComponent);
            }
         }
      }
   });

   return BreakingWall;
})