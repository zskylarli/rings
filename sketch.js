let circleSize = 1;
let bg = 220;
let mic;
let timer = 0;
let interval = 2000 // 2 seconds

let bgRed = 0;
let bgGreen = 0;
let bgBlue = 255;

function setup() {
  let cnv = createCanvas(400, 400);

  cnv.mousePressed(userStartAudio);
  textAlign(CENTER);
  mic = new p5.AudioIn();
  mic.start();

}

function draw() {
  background(bg);
  fill(bgRed, bgGreen, bgBlue);
  noStroke();

  micLevel = mic.getLevel();

  let s = millis();

  if (s - timer > interval) {
    console.log(`at ${s}: ${micLevel}`);
    timer = millis();
  }

  ellipse(200, 200, circleSize);
  if (micLevel > 0.02) {
    circleSize = circleSize + 1;
    bgBlue = bgBlue - 1;
    bgGreen = bgGreen + 1;
  }

}


  // circleSize = height - micLevel * height;
