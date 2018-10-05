var five = require("johnny-five");
var Raspi = require("raspi-io");
var board = new five.Board({
	io: new Raspi()
});

board.on("ready", function() {

  var lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    pins: ['GPIO25', 'GPIO24', 'GPIO23', 'GPIO17', 'GPIO27', 'GPIO22'],
  });

  /*var frame = 1;
  var frames = [":runninga:", ":runningb:"];
  var row = 0;
  var col = 0;*/

  var multi = new five.Multi({
    controller: "BMP080"
  });
  var temp, pressure, altitute;
  multi.on("change", function() {
    temp = this.thermometer.celsius;
    pressure = this.barometer.pressure;
    altitute = this.altimeter.meters;
  });

  var runner = Runner(lcd);

  
  /*
  lcd.useChar("runninga");
  lcd.useChar("runningb");  

  this.loop(300, function() {
    lcd.clear().cursor(row, col).print(
      frames[frame ^= 1]
    );

    if (++col === lcd.cols) {
      col = 0;
      if (++row === lcd.rows) {
        row = 0;
      }
    }
  });*/

  board.loop(300, function(stop) {
    runned.next();
  });

});

function Runner(lcd) {
  var frame = 1;
  var frames = [":runninga:", ":runningb:"];
  var row = 0;
  var col = 0;

  // These calls will store the "runninga" and "runningb"
  // characters in the LCD's built-in memory. The LCD
  // allows up to 8 custom characters to be pre-loaded
  // into memory.
  //
  // http://johnny-five.io/api/lcd/#predefined-characters
  //
  lcd.useChar("runninga");
  lcd.useChar("runningb");

  var stop = false;

  return {
    next() {
      if (stop) {
        return;
      };

      lcd.clear().cursor(row, col).print(
        frames[frame ^= 1]
      );

      if (++col === lcd.cols) {
        col = 0;
        if (++row === lcd.rows) {
          row = 0;
        }
      }
    },
    stop() {
      stop = true;
    },
    run() {
      stop = false;
    }
  }
}

