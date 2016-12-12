requirejs.config({
   baseUrl: 'js',
   paths: {
      lib: '../lib',
      juicy: '../lib/juicy.three',
      box2d: '../lib/box2d'
   }
});

$(document).ready(function() {
   require([
      'state/game',
      'helper/keymap',
      'network/setup'
   ], function(
      MenuState,
      KeyMap,
      Network
   ) {
      window.GAME_WIDTH = 800,
      window.GAME_HEIGHT = 694;

      var form = document.getElementById("html-sux");
      form.onsubmit = Network.submitHandleCallback;
      // Show name modal
      if (false && location.href.indexOf('localhost') >= 0) {
         var online = jQuery('<button class="btn btn-primary" style="position:fixed;bottom:0;left:0">Go Online</button>');
         jQuery('body').append(online);

         online.click(function() {
            jQuery("#myModal").modal('show');
            online.remove();
         });

         var l = 'abcdefghijklmnopqrstuvwxyz';
         var randomStr = '';
         for (var letter = 0; letter < 10; letter ++) {
            randomStr += l[Math.floor(Math.random() * l.length)];
         }

         jQuery('#fart').val(randomStr);
         // jQuery("#myModal").modal('show');
         // jQuery('form').submit();
      }
      else {
         jQuery("#myModal").modal('show');
      }

      // Initialize scene & camera
      var renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
      jQuery('#game').append(renderer.domElement);

      Juicy.Game.init(renderer, GAME_WIDTH, GAME_HEIGHT, KeyMap);

      // Load sounds
      // Juicy.Sound.load('select', './audio/select2.mp3', false);
      // Juicy.Sound.load('place_piece', './audio/place_piece.mp3', false, 4);
      // Juicy.Sound.load('move', './audio/move_piece.mp3', false, 8);
      // Juicy.Sound.load('rotate', './audio/rotate_piece.mp3', false, 8);
      // Juicy.Sound.load('twister', './audio/Twister Tetris2.mp3', true, 1, 0.35);
      // Juicy.Sound.load('combo_0', './audio/combo_0.mp3', false, 2);
      // Juicy.Sound.load('combo_1', './audio/combo_1.mp3', false, 2);
      // Juicy.Sound.load('combo_2', './audio/combo_2.mp3', false, 2);
      // Juicy.Sound.load('combo_3', './audio/combo_3.mp3', false, 2);
      // Juicy.Sound.load('combo_4', './audio/combo_4.mp3', false, 2);
      // Juicy.Sound.load('levelup', './audio/Coin01.mp3', false);

      // Juicy.Game.setState(new EndGameScore(GAME_WIDTH, GAME_HEIGHT, 'classic2', 262, {}, {"seed": 0})).run();
      Juicy.Game.setState(new MenuState(GAME_WIDTH, GAME_HEIGHT, 'classic', 250, {}, {"seed": 0})).run();

      return renderer.domElement;
   });
});

// Update hi score list every second
function updateHighScores() {
   if (!window.scores) return;

   var scoresSorted = [];
   for (var handle in window.scores) {
      scoresSorted.push({name: handle, score: window.scores[handle]});
   }
   scoresSorted.sort(function(a, b) {
      return b.score - a.score;
   });

   for (var i = 1; i <= 10; i++) {
      if (i <= scoresSorted.length) {
         jQuery("#" + i + "-place").show(0);
         jQuery("#" + i + "-place-name").html(scoresSorted[i - 1].name);
         jQuery("#" + i + "-place-score").html(scoresSorted[i - 1].score);
      }
      else {
         jQuery("#" + i + "-place").hide(0);
      }
   }
}

// Prevent arrow keys from scrolling
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);
