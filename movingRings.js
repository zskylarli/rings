// at http://127.0.0.1:5500/

let mic;
let threshold = 0.01;
let swarms = [];
let rings = [];
let currentColor;
let center;
let i = 0;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.mousePressed(userStartAudio);
  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  background(220);
  console.log(rings);
  let vol = mic.getLevel();

  if (vol > threshold && center) {
    let r = map(vol, 0, 1, 10, 200);
    rings.push(new Ring(center.x, center.y, r, currentColor));
  }

  for (let i = rings.length - 1; i >= 0; i--) {
    let ring = rings[i];
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
