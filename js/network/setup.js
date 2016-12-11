define([
   'entity/roomba',
], function(
   Roomba
) {
   var Network = (function() {
      var API_URL = "https://elliot-commitment.herokuapp.com/"
      // var API_URL = "http://localhost:3000/";

      var myId = "";
      var myHandle = "";

      var peerAPI = new Peer({key: 'is1zfbruud31sjor'});

      var newRoombaCallback = null;

      // Keeps track of the stuff that syncs across the network.
      // For roombas, the key is the user's handle and the value is
      // the NetworkSync component. If we add powerups and stuff later it'll
      // work slightly differently.
      var networkSyncedEntities = {};

      // Just connected to remote peer server
      peerAPI.on('open', function(id) {
         console.log("This my id fam: " + id);

         myId = id;
      });

      // Listens for NEW PEOPLE connecting TO me
      peerAPI.on('connection', function(incoming_connection) {
         incoming_connection.on('open', function() {

            // ask the server what their name is
            jQuery.ajax(API_URL + "peer/id/" + incoming_connection.peer, {
               success: function(peerName) {
                  new_connection_established(incoming_connection, peerName);
               },
               error: function() {
                  new_connection_established(incoming_connection, "mysteryman_" + makeid());
               }
            });

         });
      });

      // Key = peerId, vaue = PeerJS connection object
      var peers = {};
      // Array like:
      // [ {name: "Elliot", peerID: "asdf" } ]
      var serverPeerResult = [];

      // Helper function to make an AJAX call and connect to existing players
      function getCurrentPlayers(post_result_data) {
         // GET all current friends
         myHandle = post_result_data;
         jQuery("#myModal").modal('hide');
         jQuery.ajax(API_URL + "peer", {
            success: function(data) {
               serverPeerResult = data;
               data.forEach(function(newFriend) {
                  var new_connection = peerAPI.connect(newFriend.peerid, {reliable: true});

                  new_connection.on('open', function() {
                     // Yay! We're connected to a new friend!
                     console.log("Found a new friend. His name is: " + newFriend.name);
                     new_connection_established(new_connection, newFriend.name);
                  });
               });
            }
         });
      }

      // HTML form submit intercept
      function submitHandle(evt) {
         evt.preventDefault();

         myHandle = jQuery('form').serializeArray()[0]["value"];

         if (myId === "") {
            // I made a race condition. If the peerJS server doesn't respond in
            // time (i.e. before the user puts in a handle, somehow) EVERYTHING
            // IS RUINED
            window.alert("OH NO my crappy code caught up to me. What will I do??");
         }

         // POST my new peer id
         jQuery.ajax({
            url: API_URL + 'peer/id/' + myId + '/name/' + myHandle,
            error: function(jqXHR, textStatus, errorThrown) {
               // un-unique handle :I
               console.warn("Oh no! Trouble telling the server about my new id " + JSON.stringify(textStatus));
               jQuery("#be-more-clever").show(0);
               var fontSize = parseInt(jQuery("#be-more-clever").css("font-size"));
               fontSize = fontSize + 1 + "px";
               jQuery("#be-more-clever").css({'font-size':fontSize});
            },
            type: 'POST',
            success: getCurrentPlayers
         });

         return false;
      }

      /** We have a new friend!
          Note that this can either be called by people connecting TO me via
          this.peerAPI.on('connection') OR when I connect to people myself
          via this.peerAPI.connect
      */
      function new_connection_established(new_connection, handle) {
         // Figure out what their handle is and add them to peers
         peers[handle] = new_connection;

         console.log(handle.toUpperCase() + " HAS ENTERED THE BATTLE");

         // Create a new network-synced roomba
         networkSyncedEntities[handle.toLowerCase()] = newRoombaCallback(handle);

         new_connection.on('error', function(err) {
            console.warn("UH OH: My friend " + handle + " broke!!! Let's kill him :(" + JSON.stringify(err));
            jQuery.ajax({
               url: API_URL + 'peer/' + new_connection.peer,
               type: 'DELETE',
               success: function() {
                  delete peers[handle];
               },
               error: function() {
                  delete peers[handle];
               }
            })
         });

         new_connection.on('data', function(data) {
            networkSyncedEntities[data.name.toLowerCase()].networkUpdate(data);
         });
      }

      // Silly fallback in case we can't get our friend's name
      function makeid() {
         var text = "";
         var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

         for( var i=0; i < 5; i++ )
         text += possible.charAt(Math.floor(Math.random() * possible.length));

         return text;
      }

      function broadcastRoombaState(position, velocity) {
         for (var handle in peers) {
            peers[handle].send({
               type: "UPDATE_OBJECT",
               name: myHandle,
               position: position,
               velocity: velocity
            });
         }
      }

      return {
         submitHandleCallback: submitHandle,
         broadcastRoombaState: broadcastRoombaState,
         newRoombaCallback: function(callback) {
            newRoombaCallback = callback;
         }
      }
   })();

   return Network;
});
