define([
   'entity/roomba',
], function(
   Roomba
) {
   var Network = (function() {
      var API_URL = "https://elliot-commitment.herokuapp.com/"
      // var API_URL = "http://localhost:3000/";

      var myId = "";
      window.myHandle = "";

      var peerAPI = new Peer({key: 'is1zfbruud31sjor'});

      var newRoombaCallback = null;
      var roombaDisconnectedCallback = null;
      var updateCoinCallback = null;
      var updateSpawnCallback = null;
      var requestSpawnCallback = null;
      var despawnCallback = null;
      var hasSyncedSpawns = false;

      // Keeps track of the stuff that syncs across the network.
      // For roombas, the key is the user's handle and the value is
      // the NetworkSync component. If we add powerups and stuff later it'll
      // work slightly differently.
      var networkSyncedEntities = {};

      // Just connected to remote peer server
      var delayedModalSubmit = null;
      peerAPI.on('open', function(id) {
         console.log("This my id fam: " + id);

         myId = id;

         if (delayedModalSubmit)
         delayedModalSubmit();
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
      window.peers = {};
      window.scores = {};
      // Array like:
      // [ {name: "Elliot", peerID: "asdf" } ]
      var serverPeerResult = [];

      // Helper function to make an AJAX call and connect to existing players
      function getCurrentPlayers(post_result_data) {
         // GET all current friends
         window.myHandle = post_result_data;
         jQuery("#myModal").modal('hide');
         jQuery.ajax(API_URL + "peer", {
            success: function(data) {
               serverPeerResult = data;
               data.forEach(function(newFriend) {
                  var new_connection = peerAPI.connect(newFriend.peerid, {reliable: false});

                  new_connection.on('open', function() {
                     // Yay! We're connected to a new friend!
                     console.log("Found a new friend. His name is: " + newFriend.name);
                     new_connection_established(new_connection, newFriend.name);
                  });

                  new_connection.on('error', function(err) {
                     console.log("aha, an error for handle " + newFriend.name + " err " + JSON.stringify(err));
                     jQuery.ajax({
                        url: API_URL + 'peer/' + new_connection.peer,
                        type: 'DELETE',
                        success: function() {
                           pruneDeadRoomba(handle);
                        },
                        error: function() {
                           pruneDeadRoomba(handle);
                        }
                     });
                  })
               });

               hasSyncedSpawns = (data.length === 0);
            }
         });
      }

      // HTML form submit intercept
      function submitHandle(evt) {
         evt.preventDefault();

         window.myHandle = jQuery('form').serializeArray()[0]["value"];
         window.scores[window.myHandle.toLowerCase()] = 0;
         updateHighScores();

         if (myId === "") {
            delayedModalSubmit = function() {
               submitHandle(evt);
            }
            return;
         }

         // POST my new peer id
         jQuery.ajax({
            url: API_URL + 'peer/id/' + myId + '/name/' + window.myHandle,
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
            delete window.scores[handle];
            updateHighScores();
            jQuery.ajax({
               url: API_URL + 'peer/' + new_connection.peer,
               type: 'DELETE',
               success: function() {
                  pruneDeadRoomba(handle);
               },
               error: function() {
                  pruneDeadRoomba(handle);
               }
            });
         });

         new_connection.on('data', function(data) {
            switch(data.type) {
               case 'UPDATE_OBJECT':
               networkSyncedEntities[data.name.toLowerCase()].networkUpdate(data);
               break;
               case 'DESPAWN':
               despawnCallback(data);
               break;
               case 'SPAWN':
               case 'SPAWNS':
               if (updateSpawnCallback)
               updateSpawnCallback(data);
               break;
               case 'REQUEST_SPAWNS':
               if (requestSpawnCallback) {
                  var spawnData = requestSpawnCallback();

                  peers[data.name].send({
                     type: 'SPAWNS',
                     name: window.myHandle,
                     data: spawnData
                  });
                  peers[data.name].send({
                     type: 'SYNC_SPAWN',
                     name: window.myHandle
                  })
               }
               break;
               case 'SYNC_SPAWN':
               console.log('My spawns are synced!');
               hasSyncedSpawns = true;
               break;
            }
         });

         if (!hasSyncedSpawns) {
            initialRequestSpawnTimers();

            // somebody peacefully disconnected. END THEM.
            new_connection.on('disconnected', function() {
               pruneDeadRoomba(handle);
            });
            new_connection.on('close', function() {
               pruneDeadRoomba(handle);
            });
         }
      }

      function pruneDeadRoomba(handle) {
         if (peers[handle]) {
            roombaDisconnectedCallback(peers[handle]);
            delete peers[handle];
         }
      }

      // Silly fallback in case we can't get our friend's name
      function makeid() {
         var text = "";
         var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

         for( var i=0; i < 5; i++ )
         text += possible.charAt(Math.floor(Math.random() * possible.length));

         return text;
      }

      function broadcastRoombaState(state) {
         state.type = 'UPDATE_OBJECT';
         state.name = window.myHandle;
         for (var handle in peers) {
            peers[handle].send(state);
         }
      }

      function broadcastSpawn(spawned) {
         for (var handle in peers) {
            peers[handle].send({
               type: "SPAWN",
               name: window.myHandle,
               data: [{
                  type: spawned.powerup,
                  position: {x: spawned.position.x, z: spawned.position.z}
               }]
            });
         }
      }

      function broadcastDespawn(despawned) {
         for (var handle in peers) {
            peers[handle].send({
               type: "DESPAWN",
               name: window.myHandle,
               position: {x: despawned.position.x, z: despawned.position.z}
            });
         }
      }

      var POLL_DELAY = 250;
      function initialRequestSpawnTimers() {
         if (hasSyncedSpawns)
         return;

         setTimeout(initialRequestSpawnTimers, POLL_DELAY);

         var handles = Object.keys(peers);
         if (handles.length === 0) {
            return;
         }

         var tribute = handles[Math.floor(Math.random() * handles.length)];

         console.log('Syncing spawns with ' + tribute + '...');
         peers[tribute].send({
            type: 'REQUEST_SPAWNS',
            name: window.myHandle
         });
      }

      return {
         submitHandleCallback: submitHandle,
         broadcastRoombaState: broadcastRoombaState,
         broadcastSpawn: broadcastSpawn,
         broadcastDespawn: broadcastDespawn,
         initialRequestSpawnTimers: initialRequestSpawnTimers,
         newRoombaCallback: function(callback) {
            newRoombaCallback = callback;
         },
         roombaDisconnectedCallback: function(cb) {
            roombaDisconnectedCallback = cb;
         },
         updateCoinCallback: function(callback) {
            updateCoinCallback = callback;
         },
         updateSpawnCallback: function(callback) {
            updateSpawnCallback = callback;
         },
         requestSpawnCallback: function(callback) {
            requestSpawnCallback = callback;
         },
         despawnCallback: function(callback) {
            despawnCallback = callback;
         }
      };
   })();

   return Network;
});
