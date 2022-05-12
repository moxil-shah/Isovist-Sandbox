let shapeArray = []; // global array of all shapes currently made
let pointClicked = false;
let point_j;

function sidesInput() {
  let nPoints = document.getElementById("name").value;
  polygon(100, 100, 45, nPoints);
}

// gets parameters ready to make the new polygon
function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let vertexes = []; // temp vertexes array to be passed into Shape constructor

  // gets the vertexes ready and puts them into temp array
  for (let i = 0; i < TWO_PI; i += angle) {
    let sx = x + cos(i) * radius;
    let sy = y + sin(i) * radius;
    vertexes.push([sx, sy]);
  }

  newShape = new Shape(x, y, npoints, vertexes);
  shapeArray.push(newShape);
}

function setup() {
  createCanvas(720, 400);
}

function draw() {
  background(102); // make bg gray
  renderAllShapes();
  checkIfClickAVertex();
  dragPoint();
}

function renderAllShapes() {
  for (let i = 0; i < shapeArray.length; i += 1) {
    beginShape();
    for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
      vertex(shapeArray[i].vertexArray[j][0], shapeArray[i].vertexArray[j][1]);
    }
    endShape(CLOSE);

    push();
    strokeWeight(10);
    for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
      point(shapeArray[i].vertexArray[j][0], shapeArray[i].vertexArray[j][1]);
    }
    pop();
  }
}

function checkIfClickAVertex() {
  if (shapeArray.length === 0 && pointClicked === false) {
    return false;
  }
  let preparingShape = shapeArray[0];
  for (let j = 0; j < preparingShape.vertexArray.length; j += 1) {
    if (
      between(
        mouseX,
        preparingShape.vertexArray[j][0] - 10,
        preparingShape.vertexArray[j][0] + 10
      ) &&
      between(
        mouseY,
        preparingShape.vertexArray[j][1] - 10,
        preparingShape.vertexArray[j][1] + 10
      ) &&
      mouseIsPressed === true
    ) {
      pointClicked = true;
      point_j = j;
    }
  }
}

function dragPoint() {
  let preparingShape = shapeArray[0];
  if (pointClicked === true && mouseIsPressed === true) {
    preparingShape.vertexArray[point_j][0] = mouseX;
    preparingShape.vertexArray[point_j][1] = mouseY;
  } else {
    pointClicked = false;
  }
}

function between(theThing, min, max) {
  return theThing >= min && theThing <= max;
}

class Shape {
  constructor(x, y, nPoints, vertexArray) {
    this.x = x;
    this.y = y;
    this.nPoints = nPoints;
    this.vertexArray = vertexArray;
  }
}
