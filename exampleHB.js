var serial;
var portName = '/dev/cu.usbmodem101';
var circleSize = 10;
var heartRate;

// Setup only runs once 
function setup() {
  createCanvas(windowWidth, windowHeight);
  serial = new p5.SerialPort();
  serial.on('list', printList);  // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen);        // callback for the port opening
  serial.on('data', serialEvent);     // callback for when new data arrives
  serial.on('error', serialError);    // callback for errors
  serial.on('close', portClose);

  serial.list();
  serial.open(portName);
}

function serverConnected() {
  print('connected to server.');
}

function portOpen() {
  print('the serial port opened.')
}

function serialEvent() {
  heartRate = serial.read();
  circleSize = heartRate;
}

function serialError(err) {
  print('Something went wrong with the serial port. ' + err);
}

function portClose() {
  print('The serial port closed.');
}

function printList(portList) {
    for(var i = 0; i < portList.length; i++) {
        print(i + " " + portList[i]);
    }
}

// Draws in the browser
function draw() {
  background("#85144b");
  fill("#FF851B");
  noStroke();
  ellipse(width/2, height/2, circleSize, circleSize);
}