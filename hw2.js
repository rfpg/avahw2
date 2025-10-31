let sideMargin = 40; // Global Variables 
let rgb; 

let ballSize = 30; // for the falling balls 
let balls = []; // list to hold all the falling balls         
let lastSpawnTime = 0;   
let nextSpawnDelay;  
let counter = 0;
let fiveCount = 0;
let positions = []; 
 
let shape; // for the finger shape 
let points = 0; // for the points counter 

let sound; // for the sound
let wasHovering = false;

function preload() {
  // Load sound file - make sure 'coinsound.mp3' is in the same directory
  soundFormats('mp3');
  sound = loadSound('coinsound.mp3');
}

function setup() {
  createCanvas(800, 700);
  balls = [];
  shape = new FingerShape(width/2, height/2, 90);
  setNextSpawnDelay();
  frameRate(60);
}

function draw() {
  background(255); 
  
  shape.update();
  shape.display();
  
  // Text on screen 
  fill(150);          
  textSize(20);     
  textAlign(LEFT); 
  text("Click and drag your mouse to move the spinner.", 30, 50);   
  text("Collect balls that correspond to the matching color on the spinner.", 30, 75); 
  fill(0);
  text("Points: " + points, 30, 100);
    
  // Move shape to mouse position if pressed
  if (mouseIsPressed) {
    shape.x = mouseX;
    shape.y = mouseY;
  }

  shape.update();
  shape.display();
  
  // Spawn balls at random intervals
  if (millis() - lastSpawnTime >= nextSpawnDelay) {
    spawnBall();
    lastSpawnTime = millis();
    setNextSpawnDelay();
  }
  
  for (let i = balls.length - 1; i >= 0; i--) {
    let b = balls[i]; // draw and update each ball
    b.update();  
    b.display();
  
    // Collision detection
    for (let j = 0; j < 3; j++) { // loop through three times 
      let a = radians(j * 120); // p5.js uses radians
      let x2 = shape.x + cos(a) * shape.length;
      let y2 = shape.y + sin(a) * shape.length;
      let d = dist(b.x, b.y, x2, y2);

      if (d < ballSize/2 + 10) { // hit detection radius
        if (b.rgb === shape.getBallColor(j)) { // if colors match
          points++; // add point
          balls.splice(i, 1);
          if (sound.isLoaded()) {
            sound.play();
          }
          break; // Exit the loop after removing the ball
        }
      }
    }

    // Remove ball if off-screen
    if (i < balls.length && balls[i].y > height) {
      balls.splice(i, 1);
    }
  }
}

function mousePressed() { // when mouse is pressed
  positions.push(mouseX); // adds new value at the end of array
  positions.sort((a, b) => a - b); // sort the array 
}

// Spawn a new ball with random color and position
function spawnBall() {
  let x = random(sideMargin, width - sideMargin);
  
  // Pick random color: red, yellow, or blue
  let r = int(random(3));
  if (r === 0) rgb = color(255, 0, 0); // red
  else if (r === 1) rgb = color(255, 255, 0); // yellow
  else rgb = color(0, 0, 255); // blue
  
  balls.push(new Ball(x, rgb));
}

// Random spawn interval
function setNextSpawnDelay() {
  nextSpawnDelay = int(random(1000, 5000)); // milliseconds!
}

class Ball {
  constructor(x, rgb) {
    this.x = x;
    this.y = ballSize/2;
    this.rgb = rgb;
    this.speed = random(3, 10);
  }
  
  update() {  
    this.y += this.speed;
  }
  
  display() { // what the balls will look like 
    fill(this.rgb);
    stroke(0);       
    strokeWeight(2);
    ellipse(this.x, this.y, ballSize, ballSize);
  }
}

class FingerShape {
  constructor(x, y, length) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.angle = 0;
    this.rotationSpeed = 0.02; // milliseconds
    this.switchDi;
    this.pickSwitchDi();
  }

  pickSwitchDi() {
    this.switchDi = frameCount + int(random(2, 7) * 60);
  }

  update() {
    this.angle += this.rotationSpeed;

    if (frameCount >= this.switchDi) {
      this.rotationSpeed *= -1; // reverse direction
      this.pickSwitchDi(); // get new flip time 
    }
  }

  display() {
    push();
    translate(this.x, this.y); // moves the center point to the center of the shape 
    rotate(this.angle); // works with translate to rotate coordinate system

    for (let i = 0; i < 3; i++) {
      let a = radians(i * 120);
      let x2 = cos(a) * this.length;
      let y2 = sin(a) * this.length;

      // Line
      stroke(0);
      line(0, 0, x2, y2);

      // Balls (different colors)
      noStroke();
      if (i === 0) fill(255, 0, 0); // red
      if (i === 1) fill(255, 255, 0); // yellow
      if (i === 2) fill(0, 0, 255); // blue

      ellipse(x2, y2, 20, 20);
    }
    
    pop(); // "Pops" the current transformation matrix off the matrix stack 
  }
  
  getBallColor(index) {
    if (index === 0) return color(255, 0, 0); // red
    if (index === 1) return color(255, 255, 0); // yellow
    return color(0, 0, 255); // blue
  }
}