define(['box2d'], function(Box2D) {
   var b2Vec2 = Box2D.b2Vec2;
   var b2BodyDef = Box2D.b2BodyDef;
   var b2FixtureDef = Box2D.b2FixtureDef;
   var b2EdgeShape = Box2D.b2EdgeShape;
   var b2CircleShape = Box2D.b2CircleShape;
   var b2PolygonShape = Box2D.b2PolygonShape;
   var Box2DHelper = {};

   // General utility
   var copyVec2 = Box2DHelper.copyVec2 = function(vec) {
      return new b2Vec2(vec.get_x(), vec.get_y());
   };

   var scaledVec2 = Box2DHelper.scaledVec2 = function(vec, scale) {
      return new b2Vec2(scale * vec.get_x(), scale * vec.get_y());
   };

   Box2DHelper.createBodyDef = function(params) {
      var body = new b2BodyDef();

      for (var property in params) {
         if (!body['set_' + property]) {
            console.error('b2BodyDef.set_' + property + ' does not exist');
         }

         body['set_' + property](params[property]);
      }

      return body;
   };

   Box2DHelper.createFixtureDef = function(params) {
      var fixture = new b2FixtureDef();

      for (var property in params) {
         if (!fixture['set_' + property]) {
            console.error('b2BodyDef.set_' + property + ' does not exist');
         }

         fixture['set_' + property](params[property]);
      }

      // Create shape
      if (params.shape.type) {
         var shape;
         var constructionMethod = 'Set';
         if (params.shape.type === 'edge') {
            shape = new b2EdgeShape();
         }
         else if (params.shape.type === 'circle') {
            shape = new b2CircleShape();
            constructionMethod = 'set_m_radius';
         }
         else if (params.shape.type === 'box') {
            shape = new b2PolygonShape();
            constructionMethod = 'SetAsBox';
         }
         else {
            console.error('Shape type', params.shape.type, 'not implemented yet');
         }
         shape[constructionMethod].apply(shape, params.shape.args);
         fixture.set_shape(shape);
      }

      return fixture;
   };

   // Helper for polygon shapes
   Box2DHelper.createPolygonShape = function(vertices) {
      var shape = new b2PolygonShape();            
      var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
      var offset = 0;
      for (var i = 0; i < vertices.length; i ++) {
         Box2D.setValue(buffer+ (offset),     vertices[i].get_x(), 'float'); // x
         Box2D.setValue(buffer+ (offset + 4), vertices[i].get_y(), 'float'); // y
         offset += 8;
      }            
      var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
      shape.Set(ptr_wrapped, vertices.length);
      return shape;
   }

   return Box2DHelper;
});