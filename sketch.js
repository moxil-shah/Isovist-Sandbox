let shapeArray = []; // global array of all shapes made
let guardArray = []; // global array of all security guards made
let pointClicked = false;
let shapeClicked = false;
let shape_i_for_shape_clicked;
let shape_i;
let point_j;
let angle = 0;

function setup() {
  createCanvas(720, 400);
}

function draw() {
  background(102);
  renderAllShapes();
  renderAllSecurityGuards();
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

// from the HTML form
function SecurityGuardInput() {
  guardArray.push(new SecurityGuard(400, 200, "purple"));
}

function renderAllSecurityGuards() {
  for (let i = 0; i < guardArray.length; i += 1) {
    guardArray[i].drawSecurityGuard();
    push();

    stroke("red");
    strokeWeight(10);
   

    guardArray[i].updateLinePostionAfterRotate(angle, i);
    guardArray[i].drawLine();

    if (angle <= PI / 2) {
      angle += 0.005;
    }

    pop();
    if (angle > PI / 4) {
      push();
      noStroke();
      fill(color(255, 204, 0));
      arc(guardArray[i].getX(), guardArray[i].getY(), 100, 100, 0, PI/4);
      arc(guardArray[i].getX(), guardArray[i].getY(), 200, 200, PI/4, angle);
      pop();
    }
    else{
      arc(guardArray[i].getX(), guardArray[i].getY(), 100, 100, 0, angle);
    }
  }
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
      if (
        checkIfIntersect(
          new Point(mouseX, mouseY),
          new Point(width, mouseY),
          shapeArray[i].lineArray[j].getPoint1(),
          shapeArray[i].lineArray[j].getPoint2()
        )
      ) {
        lineSegmentCrossesCounter += 1;
      }
    }

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

function onSegment(p, q, r) {
  if (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  )
    return true;

  return false;
}

function orientOrder(p, q, r) {
  let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

  if (val == 0) return 0;

  return val > 0 ? 1 : 2;
}

function checkIfIntersect(p1, q1, p2, q2) {
  let o1 = orientOrder(p1, q1, p2);
  let o2 = orientOrder(p1, q1, q2);
  let o3 = orientOrder(p2, q2, p1);
  let o4 = orientOrder(p2, q2, q1);

  if (o1 != o2 && o3 != o4) return true;

  if (o1 == 0 && onSegment(p1, p2, q1)) return true;

  if (o2 == 0 && onSegment(p1, q2, q1)) return true;

  if (o3 == 0 && onSegment(p2, p1, q2)) return true;

  if (o4 == 0 && onSegment(p2, q1, q2)) return true;

  return false;
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
    this.test = 0;
    this.Point1 = new Point(this.x_1, this.y_1);
    this.Point2 = new Point(this.x_2, this.y_2);
    this.length = Math.sqrt(
      (this.x_2 - this.x_1) * (this.x_2 - this.x_1) +
        (this.y_2 - this.y_1) * (this.y_2 - this.y_1)
    );
  }

  getPoint1() {
    return this.Point1;
  }

  getPoint2() {
    return this.Point2;
  }

  drawLine() {
    line(this.x_1, this.y_1, this.x_2, this.y_2);
  }

  updateLinePostionAfterRotate(angle, i) {
    this.x_1 = guardArray[i].getX();
    this.y_1 = guardArray[i].getY();
    this.x_2 = cos(angle) * this.length + guardArray[i].getX();
    this.y_2 = sin(angle) * this.length + guardArray[i].getY();
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class SecurityGuard {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = 13;
    this.line = new Line(0, 0, 100, 0);
  }

  drawSecurityGuard() {
    push();
    strokeWeight(this.size);
    stroke(this.color);
    point(this.x, this.y);
    pop();
  }

  drawLine() {
    this.line.drawLine();
  }

  updateLinePostionAfterRotate(angle, i) {
    this.line.updateLinePostionAfterRotate(angle, i);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getSize() {
    return this.size;
  }

  getColor() {
    return this.color;
  }

  getLine() {
    return this.line;
  }
}
