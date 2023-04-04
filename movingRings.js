// at http://127.0.0.1:5500/

let mic;
let threshold = 0.005;
let swarms = [];
let rings = [];
let currentColor;
let center;
let ringSets = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.mousePressed(userStartAudio);
  mic = new p5.AudioIn();
  mic.start();
  getAudioContext().resume();

  let clearButton = select('#clearButton');
  clearButton.mousePressed(clearRingSets);
}

function draw() {
  background('#fae');
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