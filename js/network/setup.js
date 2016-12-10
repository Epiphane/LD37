define([], function() {
   this.peerAPI = new Peer({key: 'is1zfbruud31sjor'});

   this.peers = [];

   // Just connected to remote peer server
   this.peerAPI.on('open', function(id) {
      console.log("This my id fam: " + id);

      // POST my new peer id
      $.ajax({
         url: 'http://localhost:3000/peer',
         data: {
            name: 'fart',
            peerid: id
         },
         success: function(data) {
            console.log("Data get! " + JSON.stringify(data));
         },
         error: function(jqXHR, textStatus, errorThrown) {
            console.warn("Oh no! Trouble telling the server about my new id " + JSON.stringify(err));
         },
         type: 'POST'
      });

      // GET all current friends
      $.ajax("http://localhost:3000/peer", {
         success: function(data) {
            data.forEach(function(newFriend) {
               var new_connection = this.peerAPI.connect(newFriend.peerid, {reliable: true});

               new_connection.on('open', function() {
                  // Yay! We're connected to a new friend!
                  console.log("Found a new friend. His name is: " + newFriend.name);
               });

               new_connection.on('error', function(err) {
                  console.warn("UH OH: My friend " + newFriend.name + " broke!!! " + JSON.stringify(err));
               });
            });
         }
      });
   });

   return this;
});
