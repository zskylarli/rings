// at http://127.0.0.1:5500/

let mic;
let threshold = 0.005;
let rings = [];
let currentColor;
let center;
let ringSets = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.mousePressed(userStartAudio);
  mic = new p5.AudioIn();
  mic.start();

  let clearButton = select('#clearButton');
  clearButton.mousePressed(clearRingSets);
}

function draw() {
  drawRadialGradientBackground("#FFF8DD", "#FDDEA5");

  drawFrame();

  let vol = mic.getLevel();

  if (vol > threshold && center) {
    let r = map(vol, 0, 1, 10, 200);
    if (ringSets.length === 0 || ringSets[ringSets.length - 1].length === 0) {
      ringSets.push([]);
    }
    ringSets[ringSets.length - 1].push(new Ring(center.x, center.y, r, currentColor));
  }

  for (let i = 0; i < ringSets.length; i++) {
    let currentSet = ringSets[i];

    if (currentSet.length > 0) {
      let currentLargest = currentSet[0];

      // Check if the largest ring is touching the edge of the screen
      if (currentLargest.isTouchingEdge()) {
        currentLargest.stopGrowing();

        // Freeze the rings inside the largest ring
        for (let j = 1; j < currentSet.length; j++) {
          if (currentSet[j].isInside(currentLargest)) {
            currentSet[j].stopGrowing();
          }
        }
      }

      for (let j = 0; j < currentSet.length; j++) {
        let ring = currentSet[j];
        ring.grow();
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
              stopGrowingRingsInSet(currentSet);
              stopGrowingRingsInSet(otherSet);
            }
          }
        }
      }
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
    let frameThickness = 12;
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
  let clearButton = select('#clearButton');
  let buttonX = clearButton.elt.offsetLeft;
  let buttonY = clearButton.elt.offsetTop;
  let buttonWidth = clearButton.elt.offsetWidth;
  let buttonHeight = clearButton.elt.offsetHeight;

  // Check if the mouse click is within the button's area
  if (
    mouseX >= buttonX &&
    mouseX <= buttonX + buttonWidth &&
    mouseY >= buttonY &&
    mouseY <= buttonY + buttonHeight
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
  let outerMargin = 1;
  let innerMargin = 10;
  let cornerRadius = 10;

  fill('#F4F3EE'); 
  stroke('#9A9F55');
  rect(outerMargin, outerMargin, width - 2 * outerMargin, height - 2 * outerMargin, cornerRadius);

  fill('#FFF8DD');
  stroke('#9A9F55');
  rect(outerMargin + innerMargin, outerMargin + innerMargin, width - 2 * (outerMargin + innerMargin), height - 2 * (outerMargin + innerMargin), cornerRadius);
}
