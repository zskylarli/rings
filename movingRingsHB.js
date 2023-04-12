var serial;
var portName = '/dev/tty.usbmodem101';
var circleSize = 1;
var heartRate;
let threshold = 120;
let rings = [];
let ringSets = [];
let center;
var count = 30;
var color1 = "#666666";
var heartRateLine; 
let pulseData = []; 
let minHeartRate = 200;
let lastMinTime = 0; 
let beatsPerMinute = 0; 
let currentR = 0;
let previousR = 0;
let RR = 0;
let oscillator;
let playing = false;
let showingRings = false;

function setup() {
	createCanvas(windowWidth, windowHeight);

  serial = new p5.SerialPort();
  serial.on('list', printList);  // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen); // callback for the port opening
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.on('close', portClose);

  serial.list();
  serial.open(portName);

	let clearButton = select('#clearButton');
  clearButton.mousePressed(clearRingSets);

	let thresholdInput = select('#thresholdInput')
  thresholdInput.input(updateThreshold);

	let soundButton = select('#soundButton');
  soundButton.mousePressed(playSound);

	let downloadButton = select('#downloadButton');
  downloadButton.mousePressed(download);

	let showAllButton = select('#showAllButton');
  showAllButton.mousePressed(showAll);

	oscillator = new p5.Oscillator(); // Create a new sine wave oscillator
  oscillator.setType('sine'); // Set the oscillator type to sine wave
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

function updateThreshold() {
  threshold = this.elt.value;
}

function draw() {
	drawRadialGradientBackground("#FFF8DD", "#FDDEA5");
	drawFrame();

	fill(color('rgba(255, 232, 186,0.6)'));
  noStroke();
  ellipse(width/2, height/2, circleSize);

	if (heartRate > threshold && center) {
		if (ringSets.length === 0 || ringSets[ringSets.length - 1].length === 0) {
			ringSets.push([]);
		}
		ringSets[ringSets.length - 1].push(new Ring(center.x, center.y, circleSize, currentColor));
	}

	for (let i = 0; i < ringSets.length; i++) {
		let currentSet = ringSets[i];

		if (currentSet.length > 0) {
			let currentLargest = currentSet[0];

			// Check if the largest ring is touching the edge of the screen
			if (currentLargest.isTouchingEdge()) {
				currentLargest.stopGrowing();

				// Freeze the rings inside the largest ring
				stopGrowingRingsInSet(currentSet);
			}

			for (let j = 0; j < currentSet.length; j++) {
				let ring = currentSet[j];
				ring.grow();
				ring.fade();
				ring.display();
			}

			for (let j = 0; j < ringSets.length; j++) {
				if (i === j) continue; // Skip comparing rings within the same set

				let otherSet = ringSets[j];

				for (let k = 0; k < currentSet.length; k++) {
					for (let l = 0; l < otherSet.length; l++) {
						let currentRing = currentSet[k];
						let otherRing = otherSet[l];

						let distance = dist(currentRing.x, currentRing.y, otherRing.x, otherRing.y);
						if (distance <= currentRing.r / 2 + otherRing.r / 2) {
							fadeRingsInSet(currentSet);
							fadeRingsInSet(otherSet);
						}
					}
				}
			}
			if (currentSet.every(ring => ring.isFullyFaded())) {
				center = null;
			}
		}
	}
	pulseChart();
}

class Ring {
	constructor(x, y, r, c) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.c = c;
		this.growRate = 1;
		this.isGrowing = true;
		this.isFading = false;
		this.alpha = 255;
	}

	grow() {
		if (this.isGrowing) {
			this.r += this.growRate;
		} 
	}

	fade() {
		if (this.isFading) {
			this.alpha -= 10;
		}
	}

  display() {
    noFill();
    stroke(this.c.levels[0], this.c.levels[1], this.c.levels[2], this.alpha);
    strokeWeight(2);
    ellipse(this.x, this.y, this.r, this.r);
  }

	isTouchingEdge() {
		let frameThickness = 20;
		let plateWidth = width - frameThickness;
		let plateHeight = height - frameThickness;
		return (
			this.x - this.r / 2 < frameThickness ||
			this.x + this.r / 2 > plateWidth ||
			this.y - this.r / 2 < frameThickness ||
			this.y + this.r / 2 > plateHeight
		);
	}

	stopGrowing() {
		this.isGrowing = false;
	}

	fadeOut() {
		this.isGrowing = false;
		this.isFading = true;
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

	isFullyFaded() {
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
	let clearButton = select('#clearButton');
	let buttonWidth = clearButton.elt.offsetWidth;
	let buttonHeight = clearButton.elt.offsetHeight;

	let thresholdInput = select('#thresholdInput');
	let thresholdInputX = thresholdInput.elt.offsetLeft;
	let thresholdInputY = thresholdInput.elt.offsetTop;
	let thresholdInputWidth = thresholdInput.elt.offsetWidth;
	let thresholdInputHeight = thresholdInput.elt.offsetHeight;

	if (
		mouseX >= thresholdInputX &&
		mouseX <= width &&
		mouseY >= 0 &&
		mouseY <= thresholdInputHeight
	) {
		return;
	}

	currentColor = generateRandomColor();
	if (center) {
		center.set(mouseX, mouseY);
	} else {
		center = createVector(mouseX, mouseY);
	}
	ringSets.push([]);
}

function generateRandomColor() {
	let rV = random(0, 255);
	let gV = random(0, 255);
	let bV = random(0, 255);
	let someColor = color(rV, gV, bV);
	return someColor;
}

function clearRingSets() {
	ringSets = [];
	rings = [];
	center = null;
}

function stopGrowingRingsInSet(ringSet) {
	for (let ring of ringSet) {
		ring.stopGrowing();
	}
}

function fadeRingsInSet(ringSet) {
	if(!showingRings) {
		for (let ring of ringSet) {
			ring.fadeOut();
		}
	}
}

function showRingsInSet(ringSet) {
  for (let ring of ringSet) {
    ring.alpha = 255;
    ring.isFading = false;
  }
}

function drawRadialGradientBackground(color1, color2) {
	let radius = Math.sqrt(width * width + height * height) / 2;
	let numSteps = 100;
	let stepSize = radius / numSteps;

	for (let r = radius; r > 0; r -= stepSize) {
		let t = map(r, 0, radius, 0, 1);
		let fillColor = lerpColor(color(color1), color(color2), t);
		fill(fillColor);
		noStroke();
		ellipse(width / 2, height / 2, r * 2, r * 2);
	}
}

function drawFrame() {
	let outerMargin = 2;
	let innerMargin = 6;
	let cornerRadius = 10;

	noFill();
	stroke("#AAAE8F");
	strokeWeight(5);
	rect(outerMargin, outerMargin, width - 2 * outerMargin, height - 2 * outerMargin, cornerRadius);

	noFill();
  stroke(color('rgba(186, 192, 190, 0.4)'));
	strokeWeight(11);
  rect(outerMargin + innerMargin, outerMargin + innerMargin, width - 2 * (outerMargin + innerMargin), height - 2 * (outerMargin + innerMargin), cornerRadius);
}

function pulseChart() {
  let maxDataPoints = 180; // Maximum number of data points to show (3 seconds at 60 fps)
  let graphWidth = 200; // Width of the graph
  let graphHeight = 100; // Height of the graph
  let graphX = width - graphWidth - 20; // X-coordinate of the graph
  let graphY = 50; // Y-coordinate of the graph
  
  // Draw the rectangular box
  noFill();
  stroke(0);
  strokeWeight(2);
  rect(graphX, graphY, graphWidth, graphHeight);
  
  // Set the background color of the box to transparent
  fill(0, 0, 0, 0);
  noStroke();
  rect(graphX, graphY, graphWidth, graphHeight);

	getBPM();
  
  if (heartRate >= 0 && heartRate <= 255) {
    heartRateLine = map(heartRate, 0, 255, 0, 1);
    pulseData.push(heartRateLine);
  }

  // Trim the pulseData array if it exceeds the maximum number of data points
  if (pulseData.length > maxDataPoints) {
    pulseData.splice(0, 1);
  }

  // Draw the pulse graph inside the rectangular box
  noFill();
  stroke(color1);
  strokeWeight(2);
  curveTightness(1.0); // Increase the curve tightness
  beginShape();
  for (let i = 0; i < pulseData.length; i++) {
    let x = map(i, 0, pulseData.length - 1, graphX, graphX + graphWidth);
    let y = map(pulseData[i]*2, 0, 2, graphY, graphY + graphHeight);
    curveVertex(x, y);
  }
  endShape();

	// Draw the BPM text inside the rectangular box
	fill(0);
	noStroke();
	textSize(16);
	text("BPM: " + int(beatsPerMinute), graphX + 10, graphY + 20);
}

function getBPM() {
	let t = millis();
	let leeway = 2;

	if (heartRate < minHeartRate && heartRate >= 50) {
		minHeartRate = heartRate;
		let frequency = map(beatsPerMinute, 40, 200, 100, 1000); 
		oscillator.freq(frequency); 
	}

	if (heartRate <= minHeartRate + leeway && heartRate > minHeartRate - leeway) {
		currentR = t;
		if(previousR != 0 && currentR - previousR > 300){
			RR = currentR - previousR;
			let tempBeatsPerMinute = 60 / RR * 1000; 
			if(tempBeatsPerMinute > 50){
				beatsPerMinute = tempBeatsPerMinute;
			}
		}
		previousR = currentR;
	}
}

function playSound() {
	oscillator.start();
	if (playing) {
		oscillator.amp(0, 0.1); // Set the amplitude to 0 with a short attack time to stop the oscillator smoothly
	} else {
		oscillator.amp(0.5, 0.1); // Set the amplitude to 0.5 with a short attack time to start the oscillator smoothly
	}
	playing = !playing; // Toggle the playing flag
}

function download() {
  saveCanvas('myCanvas', 'jpg');
}

function showAll() {
	showingRings = true;
  for (let ringSet of ringSets) {
    showRingsInSet(ringSet);
  }
}
