

let sides;
let shapeArray = [];

function sidesInput() {
    let name = document.getElementById('name').value;
    sides = name;
};


function setup() {
  createCanvas(720, 400);
}

function draw() {
  background(102);

  push();
  translate(width * 0.2, height * 0.5);

  polygon(156, 0, 45, sides);
  pop();
}

function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let vertexes = [];
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertexes.push((sx, sy));
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

class Shape {


    constructor(sides, vertexArray) {
        this.sides = sides;
        this.vertexArray = vertexArray;
        this.x = x;
        this.y = y;
    }

}