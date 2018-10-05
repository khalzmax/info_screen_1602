var five = require("johnny-five");
var Raspi = require("raspi-io");
var board = new five.Board({
  io: new Raspi(),
  repl: false
});

board.on("ready", function() {

  var lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    pins: ['GPIO25', 'GPIO24', 'GPIO23', 'GPIO17', 'GPIO27', 'GPIO22'],
  });

  // init widgets
  var runner = Runner(lcd);
  var sensor = Sensor_bmp080(lcd);

  var widgets = [ runner, sensor ];

  var currentWidget = 0;

  widgets[currentWidget].run();
  var presentationInterval = setInterval(() => {
    widgets[currentWidget].stop();
    if (++currentWidget >= widgets.length) {
        currentWidget = 0;
    }
    widgets[currentWidget].run();
  }, 10500);

  var stopPresentatoin = () => {
    clearInterval(presentationInterval);
  }
  // this.repl.inject({
  //   lcd, runner, sensor, stopPresentatoin
  // });

});


function Sensor_bmp080(lcd) {
  var multi = new five.Multi({
    controller: "BMP180"
  });
  var temp, pressure, altitute;
  multi.on("change", function() {
    temp = this.thermometer.celsius.toFixed(0);
    pressure = this.barometer.pressure.toFixed(0);
    altitute = this.altimeter.meters.toFixed(0);
  });

  var stopFlag;
    var next = function() {
      lcd.clear();
      lcd.print("Temp   Pressure");
      lcd.cursor(1, 0);
      lcd.print(`${temp} C   ${pressure} Pa`);
    }
    return {
        stop() {
          stopFlag = true;
        },
        run() {
          stopFlag = false;
          return board.loop(1000, function(stopLoop) {
            if (stopFlag) {
              stopLoop();
              return;
            }
            next();
          });
        }
    }

}

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

  var stopFlag;
  var next = function() {

      lcd.clear().cursor(row, col).print(
        frames[frame ^= 1]
      );

      if (++col === lcd.cols) {
        col = 0;
        if (++row === lcd.rows) {
          row = 0;
        }
      }
   };

  return {

    stop() {
        stopFlag = true;
    },
    run() {
      stopFlag = false;
      return board.loop(300, function(stopLoop) {
          if (stopFlag) {
            stopLoop();
            return;
          }
          next();
      });
    }
  }
}

