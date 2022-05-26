let shapeArray = []; // global array of all shapes made
let guardArray = []; // global array of all security guards made
let allVertices = []; // global array of all the vertices on the map
const SecurityGuardNames = [
  "red",
  "blue",
  "green",
  "purple",
  "pink",
  "brown",
  "orange",
  "yellow",
];
let pointClicked = false;
let shapeClicked = false;
let securityGuardClicked = false;
let shape_i_for_shape_clicked;
let shape_i;
let point_j;
let guard_i;

function setup() {
  createCanvas(720, 400);
  frameRate(30);
}

function draw() {
  background(102);

  checkIfClickAVertex();
  checkIfClickInsideShape();
  checkIfClickSecurityGuard();
  dragPoint();
  dragShape();
  dragSecurityGuard();
  renderAllSecurityGuards();
  renderAllShapes();
}

// from the HTML form
function sidesInput() {
  let nPoints = document.getElementById("name").value;
  polygon(100, 100, 45, nPoints);
}

// from the HTML form
function SecurityGuardInput() {
  if (SecurityGuardNames.length !== 0) {
    guard = new SecurityGuard(400, 200, SecurityGuardNames.pop());
    for (let i = 0; i < allVertices.length; i += 1) {
      allVertices[i].setSecurityGuardAngle(guard);
    }
    guard.addAllVertices();
    guard.sortVertices();
    guardArray.push(guard);
    guard.initalIntersect();
  } else {
    console.log("No more security guards available!");
  }
}

// gets parameters ready to make the new polygon
function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let vertexes = []; // temp vertexes array to be passed into Shape constructor
  newShape = new Shape(x, y, npoints);

  // gets the vertexes ready and puts them into temp array
  for (let i = 0; i < TWO_PI; i += angle) {
    let sx = x + cos(i) * radius;
    let sy = y + sin(i) * radius;
    aPoint = new Point(sx, sy, newShape);
    console.log("orignal point", sx, sy, i);
    allVertices.push(aPoint);
    vertexes.push(aPoint);
  }

  newShape.setVertexArray(vertexes);
  newShape.setLineArray();
  shapeArray.push(newShape);

  for (let i = 0; i < guardArray.length; i += 1) {
    for (let j = 0; j < allVertices.length; j += 1) {
      allVertices[j].setSecurityGuardAngle(guardArray[i]);
    }
    guardArray[i].addAllVertices();
    guardArray[i].sortVertices();
    guardArray[i].initalIntersect();
  }
}

function renderAllSecurityGuards() {
  for (let i = 0; i < guardArray.length; i += 1) {
    guardArray[i].drawSecurityGuard();
    push();
    guardArray[i].closestAngleVertex(i);
    guardArray[i].visibleVertices(i);
    guardArray[i].drawLine();
    pop();
  }
}

function renderAllShapes() {
  for (let i = 0; i < shapeArray.length; i += 1) {
    beginShape();
    for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
      vertex(
        shapeArray[i].vertexArray[j].getX(),
        shapeArray[i].vertexArray[j].getY()
      );
    }
    endShape(CLOSE);

    // make the vertices bold
    // push();
    // strokeWeight(10);
    // for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
    //   point(
    //     shapeArray[i].vertexArray[j].getX(),
    //     shapeArray[i].vertexArray[j].getY()
    //   );
    // }
    // pop();
  }
}

function checkIfClickAVertex() {
  if (
    shapeArray.length === 0 ||
    mouseIsPressed === false ||
    pointClicked === true ||
    shapeClicked === true ||
    securityGuardClicked === true
  ) {
    return null;
  }

  for (let i = 0; i < shapeArray.length; i += 1) {
    for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
      if (
        between(
          mouseX,
          shapeArray[i].vertexArray[j].getX() - 10,
          shapeArray[i].vertexArray[j].getX() + 10
        ) &&
        between(
          mouseY,
          shapeArray[i].vertexArray[j].getY() - 10,
          shapeArray[i].vertexArray[j].getY() + 10
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
    pointClicked === true ||
    securityGuardClicked === true
  ) {
    return null;
  }

  for (let i = 0; i < shapeArray.length; i += 1) {
    let lineSegmentCrossesCounter = 0; // for ray trace algorithm
    for (let j = 0; j < shapeArray[i].lineArray.length; j += 1) {
      if (
        checkIfIntersect(
          new Point(mouseX, mouseY, null),
          new Point(width, mouseY, null),
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

function checkIfClickSecurityGuard() {
  if (
    guardArray.length === 0 ||
    mouseIsPressed === false ||
    pointClicked === true ||
    shapeClicked === true ||
    securityGuardClicked === true
  ) {
    return null;
  }

  for (let i = 0; i < guardArray.length; i += 1) {
    if (
      between(mouseX, guardArray[i].getX() - 10, guardArray[i].getX() + 10) &&
      between(mouseY, guardArray[i].getY() - 10, guardArray[i].getY() + 10)
    ) {
      securityGuardClicked = true;
      guard_i = i;
    }
  }
}

function updateVertexArrayDistancetoMousePress(i) {
  shapeArray[i].vertexArrayDistancetoMousePress = [];
  for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
    deltaX = mouseX - shapeArray[i].vertexArray[j].getX();
    deltaY = mouseY - shapeArray[i].vertexArray[j].getY();
    shapeArray[i].vertexArrayDistancetoMousePress.push([deltaX, deltaY]);
  }
}

function dragPoint() {
  if (pointClicked === true && mouseIsPressed === true) {
    shapeArray[shape_i].vertexArray[point_j].setX(mouseX);
    shapeArray[shape_i].vertexArray[point_j].setY(mouseY);
  } else if (pointClicked === true) {
    shapeArray[shape_i].setLineArray();
    updateVertexArrayDistancetoMousePress(shape_i);
    pointClicked = false;

    for (let i = 0; i < allVertices.length; i += 1) {
      if (allVertices[i] === shapeArray[shape_i].vertexArray[point_j]) {
        for (let j = 0; j < guardArray.length; j += 1) {
          allVertices[i].setSecurityGuardAngle(guardArray[j]);
        }
        break;
      }
    }
    for (let j = 0; j < guardArray.length; j += 1) {
      guardArray[j].sortVertices();
      guardArray[j].initalIntersect();
    }
  }
}

function dragSecurityGuard() {
  if (securityGuardClicked === true && mouseIsPressed === true) {
    guardArray[guard_i].setX(mouseX);
    guardArray[guard_i].setY(mouseY);
  } else if (securityGuardClicked === true) {
    securityGuardClicked = false;

    for (let i = 0; i < allVertices.length; i += 1) {
      allVertices[i].setSecurityGuardAngle(guardArray[guard_i]);
    }
    guardArray[guard_i].sortVertices();
    guardArray[guard_i].initalIntersect();
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
        mouseX - shapeArray[shape_i_for_shape_clicked].vertexArray[j].getX();
      deltaYCurrent =
        mouseY - shapeArray[shape_i_for_shape_clicked].vertexArray[j].getY();
      deltaX =
        shapeArray[shape_i_for_shape_clicked].vertexArrayDistancetoMousePress[
          j
        ][0];
      deltaY =
        shapeArray[shape_i_for_shape_clicked].vertexArrayDistancetoMousePress[
          j
        ][1];
      shapeArray[shape_i_for_shape_clicked].vertexArray[j].setX(
        shapeArray[shape_i_for_shape_clicked].vertexArray[j].getX() +
          deltaXCurrent -
          deltaX
      );

      shapeArray[shape_i_for_shape_clicked].vertexArray[j].setY(
        shapeArray[shape_i_for_shape_clicked].vertexArray[j].getY() +
          deltaYCurrent -
          deltaY
      );
    }
  } else if (shapeClicked === true) {
    shapeArray[shape_i_for_shape_clicked].setLineArray();
    shapeClicked = false;

    for (let i = 0; i < allVertices.length; i += 1) {
      for (let j = 0; j < guardArray.length; j += 1) {
        allVertices[i].setSecurityGuardAngle(guardArray[j]);
      }
    }

    for (let j = 0; j < guardArray.length; j += 1) {
      guardArray[j].sortVertices();
      guardArray[j].initalIntersect();
    }
  }
}

function findIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  let px =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
    ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  let py =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
    ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  return [px, py];
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
  constructor(x, y, nPoints) {
    this.id = Date.now();
    this.x = x;
    this.y = y;
    this.nPoints = nPoints;
    this.vertexArray = null;
    this.vertexArrayDistancetoMousePress = [];
    this.lineArray = [];
  }

  setVertexArray(array) {
    this.vertexArray = array;

    this.vertexArray[0].setPointPrev(
      this.vertexArray[this.vertexArray.length - 1]
    );
    this.vertexArray[0].setPointNext(this.vertexArray[1]);

    this.vertexArray[this.vertexArray.length - 1].setPointPrev(
      this.vertexArray[this.vertexArray.length - 2]
    );
    this.vertexArray[this.vertexArray.length - 1].setPointNext(
      this.vertexArray[0]
    );

    for (let i = 1; i < this.vertexArray.length - 1; i += 1) {
      this.vertexArray[i].setPointPrev(this.vertexArray[i - 1]);
      this.vertexArray[i].setPointNext(this.vertexArray[i + 1]);
    }
  }

  setLineArray() {
    this.lineArray = [];
    for (let i = 0; i < this.vertexArray.length - 1; i++) {
      let aLine = new Line(
        this.vertexArray[i].getX(),
        this.vertexArray[i].getY(),
        this.vertexArray[i + 1].getX(),
        this.vertexArray[i + 1].getY()
      );
      this.lineArray.push(aLine);
    }

    let aLine = new Line(
      this.vertexArray[this.vertexArray.length - 1].getX(),
      this.vertexArray[this.vertexArray.length - 1].getY(),
      this.vertexArray[0].getX(),
      this.vertexArray[0].getY()
    );
    this.lineArray.push(aLine);
  }

  getName() {
    return this.id;
  }

  getLineArray() {
    return this.lineArray;
  }

  getVertexArray() {
    return this.vertexArray;
  }
}

class Line {
  constructor(x_1, y_1, x_2, y_2) {
    this.x_1 = x_1;
    this.y_1 = y_1;
    this.x_2 = x_2;
    this.y_2 = y_2;
    this.Point1 = new Point(this.x_1, this.y_1, null);
    this.Point2 = new Point(this.x_2, this.y_2, null);
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

  closestAngleVertex(sortedVertices, i) {
    if (sortedVertices.length > 0) {
      this.x_1 = guardArray[i].getX();
      this.y_1 = guardArray[i].getY();
      this.x_2 = sortedVertices[0].getX();
      this.y_2 = sortedVertices[0].getY();
    }
  }
}

class Point {
  constructor(x, y, parentShape) {
    this.x = x;
    this.y = y;
    this.pointPrev = null;
    this.pointNext = null;
    this.parentShape = parentShape;
    this.secuirtyGuardMap = new Map();
  }

  setSecurityGuardAngle(guard) {
    let a = this.x - guard.getX();
    let o = -this.y + guard.getY();
    let angle = Math.atan2(o, a);

    if (angle < 0) {
      angle += TWO_PI;
    }

    this.secuirtyGuardMap.set(guard.getName(), angle);
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getParentShape() {
    return this.parentShape;
  }

  setPointPrev(point) {
    this.pointPrev = point;
  }

  setPointNext(point) {
    this.pointNext = point;
  }

  getPointPrev() {
    return this.pointPrev;
  }

  getPointNext() {
    return this.pointNext;
  }

  getSecurityGuardMap() {
    return this.secuirtyGuardMap;
  }

  getAngleForSecurityGuard(guard) {
    return this.secuirtyGuardMap.get(guard);
  }
}

class SecurityGuard {
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.size = 13;
    this.line = new Line(0, 0, 0, 0);
    this.lineAngle = 0;
    this.sortedVertices = [];
    this.treeOfEdges = [];
    this.sorted = false;
    this.isovistVertices = new Set();
  }

  visibleVertices() {
    this.isovistVertices = new Set();
    for (let i = 0; i < allVertices.length; i += 1) {
      this.visible(allVertices[i]);
    }
  }

  visible(w_i) {
    let visibleToSecurityGuard = true;
    for (let j = 0; j < w_i.getParentShape().getLineArray().length; j += 1) {
      if (
        checkIfIntersect(
          new Point(this.x, this.y, null),
          new Point(w_i.getX(), w_i.getY(), null),
          w_i.getParentShape().getLineArray()[j].getPoint1(),
          w_i.getParentShape().getLineArray()[j].getPoint2()
        )
      ) {
        visibleToSecurityGuard = false;
        let IntersectionPoint = findIntersection(
          this.x,
          this.y,
          w_i.getX(),
          w_i.getY(),
          w_i.getParentShape().getLineArray()[j].getPoint1().getX(),
          w_i.getParentShape().getLineArray()[j].getPoint1().getY(),
          w_i.getParentShape().getLineArray()[j].getPoint2().getX(),
          w_i.getParentShape().getLineArray()[j].getPoint2().getY()
        );
        for (
          let k = 0;
          k < w_i.getParentShape().getVertexArray().length;
          k += 1
        ) {
          if (
            Math.round(w_i.getParentShape().getVertexArray()[k].getX() * 100) /
              100 ===
              Math.round(IntersectionPoint[0] * 100) / 100 &&
            Math.round(w_i.getParentShape().getVertexArray()[k].getY() * 100) /
              100 ===
              Math.round(IntersectionPoint[1] * 100) / 100
          ) {
            visibleToSecurityGuard = true;
            break;
          }
        }
      }

      if (visibleToSecurityGuard === false) {
        break;
      }
    }

    if (visibleToSecurityGuard === true) {
      this.isovistVertices.add(w_i);

      push();
      stroke("black");
      strokeWeight(15);
      point(w_i.getX(), w_i.getY());
      pop();
    }
  }

  addAllVertices() {
    this.sortedVertices = [];
    for (let i = 0; i < allVertices.length; i += 1) {
      this.sortedVertices.push(allVertices[i]);
    }
    this.sorted = false;
  }

  sortVertices() {
    let name = this.name;
    this.sortedVertices.sort(function (a, b) {
      return (
        a.getAngleForSecurityGuard(name) - b.getAngleForSecurityGuard(name)
      );
    });
    this.sorted = true;
  }

  sortTreeOfEdgesByDistance() {
    this.treeOfEdges.sort(function (a, b) {
      return a[1] - b[1];
    });
  }

  drawSecurityGuard() {
    push();
    strokeWeight(this.size);
    stroke(this.name);
    point(this.x, this.y);
    pop();
    let temp = ["red", "blue", "green", "purple", "yellow", "pink"];

    // for (let i = 0; i < this.treeOfEdges.length; i += 1) {
    //   push();
    //   stroke(temp[i]);
    //   strokeWeight(10);
    //   line(
    //     this.treeOfEdges[i][0].getPoint1().getX(),
    //     this.treeOfEdges[i][0].getPoint1().getY(),
    //     this.treeOfEdges[i][0].getPoint2().getX(),
    //     this.treeOfEdges[i][0].getPoint2().getY()
    //   );

    //   pop();
    // }
  }

  drawLine() {
    this.line.drawLine();
  }

  closestAngleVertex(i) {
    this.line.closestAngleVertex(this.sortedVertices, i);
  }

  initalIntersect() {
    this.treeOfEdges = [];
    for (let i = 0; i < shapeArray.length; i += 1) {
      for (let j = 0; j < shapeArray[i].getLineArray().length; j += 1) {
        if (
          checkIfIntersect(
            new Point(this.x, this.y, null),
            new Point(width, this.y, null),
            shapeArray[i].getLineArray()[j].getPoint1(),
            shapeArray[i].getLineArray()[j].getPoint2()
          )
        ) {
          let IntersectionPoint = findIntersection(
            this.x,
            this.y,
            width,
            this.y,
            shapeArray[i].getLineArray()[j].getPoint1().getX(),
            shapeArray[i].getLineArray()[j].getPoint1().getY(),
            shapeArray[i].getLineArray()[j].getPoint2().getX(),
            shapeArray[i].getLineArray()[j].getPoint2().getY()
          );

          let distanceFromIntersectiontoGuard = Math.sqrt(
            (this.x - IntersectionPoint[0]) ** 2 +
              (this.y - IntersectionPoint[1]) ** 2
          );

          this.treeOfEdges.push([
            shapeArray[i].getLineArray()[j],
            distanceFromIntersectiontoGuard,
          ]);
        }
      }
    }
    this.sortTreeOfEdgesByDistance();
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  setLineAngle(angle) {
    this.lineAngle = angle;
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
    return this.name;
  }

  getLine() {
    return this.line;
  }

  getLineAngle() {
    return this.lineAngle;
  }

  getName() {
    return this.name;
  }
}
