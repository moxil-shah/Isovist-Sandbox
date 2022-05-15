let shapeArray = []; // global array of all shapes currently made
let pointClicked = false;
let shapeClicked = false;
let shape_i_for_shape_clicked;
let shape_i;
let point_j;

function setup() {
  createCanvas(720, 400);
}

function draw() {
  background(102);
  renderAllShapes();
  checkIfClickAVertex();
  checkIfClickInsideShape();
  dragPoint();
  dragShape();
}

// from the HTML form
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
  newShape.setLineArray();
  shapeArray.push(newShape);
}

function renderAllShapes() {
  for (let i = 0; i < shapeArray.length; i += 1) {
    beginShape();
    for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
      vertex(shapeArray[i].vertexArray[j][0], shapeArray[i].vertexArray[j][1]);
    }
    endShape(CLOSE);

    // make the vertices bold
    push();
    strokeWeight(10);
    for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
      point(shapeArray[i].vertexArray[j][0], shapeArray[i].vertexArray[j][1]);
    }
    pop();
  }
}

function checkIfClickAVertex() {
  if (
    shapeArray.length === 0 ||
    mouseIsPressed === false ||
    pointClicked === true ||
    shapeClicked === true
  ) {
    return null;
  }

  for (let i = 0; i < shapeArray.length; i += 1) {
    for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
      if (
        between(
          mouseX,
          shapeArray[i].vertexArray[j][0] - 10,
          shapeArray[i].vertexArray[j][0] + 10
        ) &&
        between(
          mouseY,
          shapeArray[i].vertexArray[j][1] - 10,
          shapeArray[i].vertexArray[j][1] + 10
        )
      ) {
        pointClicked = true;
        point_j = j;
        shape_i = i;
      }
    }
  }
}

function checkIfClickInsideShape() {
  if (
    shapeArray.length === 0 ||
    mouseIsPressed === false ||
    shapeClicked === true ||
    pointClicked === true
  ) {
    return null;
  }

  for (let i = 0; i < shapeArray.length; i += 1) {
    let lineSegmentCrossesCounter = 0; // for ray trace algorithm
    for (let j = 0; j < shapeArray[i].lineArray.length; j += 1) {
      let xCoordOfInterceptWithHorizontal =
        (-mouseY - shapeArray[i].lineArray[j].getYIntercept()) /
        shapeArray[i].lineArray[j].getSlope();
      if (
        between(
          mouseY,
          Math.min(
            shapeArray[i].lineArray[j].y_1,
            shapeArray[i].lineArray[j].y_2
          ),
          Math.max(
            shapeArray[i].lineArray[j].y_1,
            shapeArray[i].lineArray[j].y_2
          )
        ) &&
        xCoordOfInterceptWithHorizontal >= mouseX
      ) {
        lineSegmentCrossesCounter += 1;
      }
    }
    // console.log(lineSegmentCrossesCounter);
    // ray tracing algorithm says if line segment crosses === odd num, then click is inside the shape
    if (lineSegmentCrossesCounter % 2 === 1) {
      shape_i_for_shape_clicked = i;
      shapeClicked = true;
      updateVertexArrayDistancetoMousePress(i);
    }
  }
}

function updateVertexArrayDistancetoMousePress(i) {
  shapeArray[i].vertexArrayDistancetoMousePress = [];
  for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
    deltaX = mouseX - shapeArray[i].vertexArray[j][0];
    deltaY = mouseY - shapeArray[i].vertexArray[j][1];
    shapeArray[i].vertexArrayDistancetoMousePress.push([deltaX, deltaY]);
  }
}

function dragPoint() {
  if (pointClicked === true && mouseIsPressed === true) {
    shapeArray[shape_i].vertexArray[point_j][0] = mouseX;
    shapeArray[shape_i].vertexArray[point_j][1] = mouseY;
  } else if (pointClicked === true) {
    shapeArray[shape_i].setLineArray();
    updateVertexArrayDistancetoMousePress(shape_i);
    pointClicked = false;
  }
}

function dragShape() {
  if (shapeClicked === true && mouseIsPressed === true) {
    for (
      let j = 0;
      j < shapeArray[shape_i_for_shape_clicked].vertexArray.length;
      j += 1
    ) {
      deltaXCurrent =
        mouseX - shapeArray[shape_i_for_shape_clicked].vertexArray[j][0];
      deltaYCurrent =
        mouseY - shapeArray[shape_i_for_shape_clicked].vertexArray[j][1];
      deltaX =
        shapeArray[shape_i_for_shape_clicked].vertexArrayDistancetoMousePress[
          j
        ][0];
      deltaY =
        shapeArray[shape_i_for_shape_clicked].vertexArrayDistancetoMousePress[
          j
        ][1];
      shapeArray[shape_i_for_shape_clicked].vertexArray[j][0] +=
        deltaXCurrent - deltaX;
      shapeArray[shape_i_for_shape_clicked].vertexArray[j][1] +=
        deltaYCurrent - deltaY;
    }
  } else if (shapeClicked === true) {
    shapeArray[shape_i_for_shape_clicked].setLineArray();
    shapeClicked = false;
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
    this.vertexArrayDistancetoMousePress = [];
    this.lineArray = [];
  }

  setLineArray() {
    this.lineArray = [];
    for (let i = 0; i < this.vertexArray.length - 1; i++) {
      let aLine = new Line(
        this.vertexArray[i][0],
        this.vertexArray[i][1],
        this.vertexArray[i + 1][0],
        this.vertexArray[i + 1][1]
      );
      this.lineArray.push(aLine);
    }

    let aLine = new Line(
      this.vertexArray[this.vertexArray.length - 1][0],
      this.vertexArray[this.vertexArray.length - 1][1],
      this.vertexArray[0][0],
      this.vertexArray[0][1]
    );
    this.lineArray.push(aLine);
  }
}

class Line {
  constructor(x_1, y_1, x_2, y_2) {
    this.x_1 = x_1;
    this.y_1 = y_1;
    this.x_2 = x_2;
    this.y_2 = y_2;
    this.m = -(this.y_2 - this.y_1) / (this.x_2 - this.x_1);
    this.b = -this.y_1 - this.m * this.x_1;
  }

  getSlope() {
    return this.m;
  }

  getYIntercept() {
    return this.b;
  }
}