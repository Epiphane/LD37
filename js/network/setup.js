define([], function() {
   var Network = (function() {
      var API_URL = "https://elliot-commitment.herokuapp.com/"

      var myId = "";
      var myHandle = "";

      var peerAPI = new Peer({key: 'is1zfbruud31sjor'});

      // Just connected to remote peer server
      peerAPI.on('open', function(id) {
         console.log("This my id fam: " + id);

         myId = id;
      });

      // Listens for NEW PEOPLE connecting TO me
      peerAPI.on('connection', function(incoming_connection) {
         incoming_connection.on('open', function() {

            // ask the server what their name is
            $.ajax(API_URL + "peer/id/" + incoming_connection.peer, {
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
         $("#myModal").modal('hide');
         $.ajax(API_URL + "peer", {
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

         myHandle = $('form').serializeArray()[0]["value"];

         if (myId === "") {
            // I made a race condition. If the peerJS server doesn't respond in
            // time (i.e. before the user puts in a handle, somehow) EVERYTHING
            // IS RUINED
            window.alert("OH NO my crappy code caught up to me. What will I do??");
         }

         // POST my new peer id
         $.ajax({
            url: API_URL + 'peer/id/' + myId + '/name/' + myHandle,
            error: function(jqXHR, textStatus, errorThrown) {
               // un-unique handle :I
               console.warn("Oh no! Trouble telling the server about my new id " + JSON.stringify(textStatus));
               $("#be-more-clever").show(0);
               var fontSize = parseInt($("#be-more-clever").css("font-size"));
               fontSize = fontSize + 1 + "px";
               $("#be-more-clever").css({'font-size':fontSize});
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

         new_connection.on('error', function(err) {
            console.warn("UH OH: My friend " + handle + " broke!!! Let's kill him :(" + JSON.stringify(err));
            $.ajax({
               url: API_URL + 'peer/' + new_connection.peer,
               type: 'DELETE',
               success: function() {
                  delete peers[handle];
               }
            })
         });

         new_connection.on('data', function(data) {
            console.log(handle + " says " + JSON.stringify(data));
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

      // Heartbeat TODO: send your current game state here.
      var i = 0;
      setInterval(function() {
         for (var handle in peers) {
            peers[handle].send({
               type: "MESSAGE",
               payload: "hi friend! " + i++
            });
         }
      }, 100);

      return {
         submitHandleCallback: submitHandle
      }
   })();

   return Network;
});
