define([
   'box2d'
], function(
   Box2D
) {
   var beginContactCallback = function(contact, idA, idB) {}, 
       endContactCallback   = function(contact, idA, idB) {};

   var listener = new Box2D.JSContactListener();
   listener.BeginContact = function (contactPtr) {
      var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
      var fixtureA = contact.GetFixtureA();
      var fixtureB = contact.GetFixtureB();

      var idA = fixtureA.GetBody().GetUserData();
      var idB = fixtureB.GetBody().GetUserData();

      if (idA && idB) {
         beginContactCallback(contact, idA, idB);
      }
   }
   listener.EndContact = function (contactPtr) {
      var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
      var fixtureA = contact.GetFixtureA();
      var fixtureB = contact.GetFixtureB();

      var idA = fixtureA.GetBody().GetUserData();
      var idB = fixtureB.GetBody().GetUserData();

      if (idA && idB) {
         endContactCallback(contact, idA, idB);
      }
   }
   // Empty implementations for unused methods.
   listener.PreSolve = function() {};
   listener.PostSolve = function() {};

   listener.setBeginContactCallback = function(cb) {
      beginContactCallback = cb;
   };
   listener.setEndContactCallback = function(cb) {
      endContactCallback = cb;
   };

   return listener;
})