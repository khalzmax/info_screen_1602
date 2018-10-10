var five = require("johnny-five");
var Raspi = require("raspi-io");
var board = new five.Board({
  io: new Raspi(),
  repl: false
});
const WIDGET_TIMEOUT = 10500;

board.on("ready", function() {

  var lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    pins: ['GPIO25', 'GPIO24', 'GPIO23', 'GPIO17', 'GPIO27', 'GPIO22'],
  });

  // init widgets
  var runner = Runner(lcd);
  var sensor = Sensor_bmp080(lcd);

  var widgets = [runner, sensor ];
  // if we have internet then clock synced and clock widget shows real time
  checkInternet().then( () => {
    var clock = clockWidget(lcd);
    widgets.push(clock);
  })

  var currentWidget = 0;

  widgets[currentWidget].run();
  var presentationInterval = setInterval(() => {
    widgets[currentWidget].stop();
    if (++currentWidget >= widgets.length) {
        currentWidget = 0;
    }
    widgets[currentWidget].run();
  }, WIDGET_TIMEOUT);

  /*
  var stopPresentatoin = () => {
    clearInterval(presentationInterval);
  }
  this.repl.inject({
    lcd, runner, sensor, stopPresentatoin
  }); */

});
/*
function Sensor_dht11(lcd) {
  var multi = new five.Multi({
    controller: "DHT11_I2C_NANO_BACKPACK"
  });
  var temp, humidity;
  multi.on("change", function () {
    temp = this.thermometer.celsius.toFixed(0);
    humidity = this.hygrometer.relativeHumidity.toFixed(0);
  });

  var stopFlag;
  var next = function () {
    lcd.clear();
    lcd.print("Temp   Humidity");
    lcd.cursor(1, 0);
    lcd.print(`${temp} C   ${humidity} Pa`);
  }
  return {
    stop() {
      stopFlag = true;
    },
    run() {
      stopFlag = false;
      return board.loop(1000, function (stopLoop) {
        if (stopFlag) {
          stopLoop();
          return;
        }
        next();
      });
    }
  }
}

function Sensor_ds18b20(lcd) {
  var thermometer = new five.Thermometer({
    controller: "DS18B20",
    pin: 'GPIO04'
  });
  var temp;
  thermometer.on("change", function () {
    temp = this.celsius.toFixed(0);
  });

  var stopFlag;
  var next = function () {
    lcd.clear();
    lcd.print("Temperature");
    lcd.cursor(1, 0);
    lcd.print(`${temp} C   `);
  }
  return {
    stop() {
      stopFlag = true;
    },
    run() {
      stopFlag = false;
      return board.loop(1000, function (stopLoop) {
        if (stopFlag) {
          stopLoop();
          return;
        }
        next();
      });
    }
  }

} */

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
    var screen1 = function() {
      lcd.clear();
      lcd.print("Temp   Pressure");
      lcd.cursor(1, 0);
      lcd.print(`${temp} C   ${pressure} Pa`);
    };
    /* var screen2 = function() {
      lcd.clear();
      lcd.print("Altitute");
      lcd.cursor(1, 0);
      lcd.print(`${altitute} m`);
    }
    var currentScreen = 0; */
    return {
        stop() {
          stopFlag = true;
        },
        run() {
          stopFlag = false;
          return board.loop(3000, function(stopLoop) {
            if (stopFlag) {
              stopLoop();
              return;
            }
            screen1();
            /* currentScreen ? screen2() : screen1();
            currentScreen = !currentScreen; */
          });
        }
    }
}
;
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

function clockWidget(lcd) {
  var date = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var currentDate = date.getDate();
  var currentDay = days[date.getUTCDay()];
  var currentMonth = months[date.getMonth()];
  var currentHour = date.getHours();
  var currentMinute = date.getHours();
  const update = () => {
    lcd.clear();
    lcd.print(`${currentMonth} ${currentDate}, ${currentDay}`);
    lcd.cursor(1, 0);
    lcd.print(`${currentHour} : ${currentMinute}`);
  }
  return new widget({
    name: 'clock widget',
    update,
    timeout: 3000
  })

}

function widget(config = {}) {
  var loopTimeout = config.timeout || 1000;
  var update = config.update || (() => console.error('no update fn for widget %s detected', config.name));
  var stopFlag = false;
  if (typeof config.init === 'function') {
    config.init.apply(config);
  }
  return {
    stop() {
      stopFlag = true;
    },
    run() {
      stopFlag = false;
      return board.loop(loopTimeout, function (stopLoop) {
        if (stopFlag) {
          stopLoop();
          return;
        }
        update();
      });
    }
  }
}

function checkInternet() {
  return new Promise( function(resolve, rejecet) {
    require('dns').lookup('google.com', function (err) {
      if (err && err.code == "ENOTFOUND") {
        resolve();
      } else {
        rejecet();
      }
    })
  })
}
