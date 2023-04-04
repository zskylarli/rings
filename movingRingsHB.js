var serial;
var portName = '/dev/cu.usbmodem101';
var circleSize = 10;
var heartRate;
let threshold = 130;
let swarms = [];
let rings = [];
let currentColor;
let center;
let i = 0;

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
setInterval(serialEvent, 5000);

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

// // Draws in the browser
// function draw() {
//   background("#85144b");
//   fill("#FF851B");
//   noStroke();
//   ellipse(width/2, height/2, circleSize, circleSize);
// }

function draw() {
  background(220);

  if (heartRate > threshold && center) {
    let r = map(heartRate, 0, 250, 10, 200);
    rings.push(new Ring(center.x, center.y, r, currentColor));
  }

  for (let i = rings.length - 1; i >= 0; i--) {
    let ring = rings[i];

    if(ring.isLargest()){
      for (let j = i-1; j >= 0; j--) {
        if(!rings[j].isInside(ring)){
          let distance = dist(ring.x, ring.y, rings[j].x, rings[j].y);
          // if (distance < ring.r) {
          //   console.log("Ring " + i + " is touching ring " + j);
          // }
        }
      }
    }

    if (ring.isTouchingEdge()) {
      ring.stopGrowing();
      for (let j = i - 1; j >= 0; j--) {
        if (rings[j].isInside(ring)) {
          rings[j].stopGrowing();
        }
      }
    } else {
      ring.grow();
      ring.display();
    }
  }
}

class Ring {
  constructor(x, y, r, c) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = c;
    this.growRate = 2;
    this.isGrowing = true;
    this.alpha = 255;
  }

  grow() {
    if (this.isGrowing) {
      this.r += this.growRate;
    } else {
      this.x = 0;
      this.y = 0;
      this.r = 0;
      this.alpha -= 100;
    }
  }

  display() {
    noFill();
    stroke(this.c); 
    strokeWeight(2);
    ellipse(this.x, this.y, this.r, this.r);
  }

  isTouchingEdge() {
    return (
      this.x - this.r / 2 < 0 ||
      this.x + this.r / 2 > width ||
      this.y - this.r / 2 < 0 ||
      this.y + this.r / 2 > height
    );
  }

  stopGrowing() {
    this.isGrowing = false;
  }

  isLargest() {
    for (let i = 0; i < rings.length; i++) {
      if (rings[i].centerX === this.x && rings[i].centerY === this.y) {
        if (rings[i].r > this.r) {
          return false;
        }
      }
    }
    return true;
  }

  isInside(otherRing) {
    return (
      this.centerX === otherRing.centerX &&
      this.centerY === otherRing.centerY &&
      this.r < otherRing.r
    );
  }

  isTransparent() {
    return this.alpha <= 0;
  }

  get centerX() {
    return this.x;
  }

  get centerY() {
    return this.y;
  }
}

function mouseClicked() {
  currentColor = generateRandomColor();
  if (center) {
    center.set(mouseX, mouseY);
  } else {
    center = createVector(mouseX, mouseY);
  }
}

function generateRandomColor() {
  let rV = random(0, 255);
  let gV = random(0, 255);
  let bV = random(0, 255);
  let someColor = color(rV, gV, bV);
  return someColor;
}
