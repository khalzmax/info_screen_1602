var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var lcd = new five.LCD({
    // LCD pin name RS EN DB4 DB5 DB6 DB7
    ping: [];
  });
  var frame = 1;
  var flames = [":runninga:", ":runningb:"];
  var row = 0;
  var col = 0;



});
