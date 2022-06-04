// I shortened the visible algo (got rid of checking if intecepts with parent shape)
// fix the sclar to be more exact

let shapeArray = []; // global array of all shapes made
let guardArray = []; // global array of all security guards made
let allVertices = []; // global array of all the vertices on the map
const SecurityGuardNames = [
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 0],
];
let pointClicked = false;
let shapeClicked = false;
let securityGuardClicked = false;
let HEXAGON_ROUNDING_ERROR = 1e-15;
let shape_i_for_shape_clicked;
let shape_i;
let point_j;
let guard_i = -1;

function getScrollBarWidth() {
  var $outer = $("<div>")
      .css({ visibility: "hidden", width: 100, overflow: "scroll" })
      .appendTo("body"),
    widthWithScroll = $("<div>")
      .css({ width: "100%" })
      .appendTo($outer)
      .outerWidth();
  $outer.remove();
  return 100 - widthWithScroll;
}

function setup() {
  createCanvas(
    document.documentElement.clientWidth - getScrollBarWidth(),
    document.documentElement.clientHeight
  );
  frameRate(120);
  polygon(null, null, null, 4);
}

function draw() {
  background(102);
  dragSecurityGuard();
  dragPoint();
  dragShape();
  renderAllShapes();
  renderAllSecurityGuards();
}

// from the HTML form
function sidesInput() {
  let nPoints = document.getElementById("name").value;
  if (nPoints > 30) nPoints = 30;
  polygon(100, 100, 45, nPoints);
}

// from the HTML form
function SecurityGuardInput() {
  if (SecurityGuardNames.length !== 0) {
    guard = new SecurityGuard(77.5, 200, SecurityGuardNames.pop());
    for (let i = 0; i < allVertices.length; i += 1) {
      allVertices[i].setSecurityGuardAngle(guard);
      allVertices[i].setExtendedFrom(guard, null);
      allVertices[i].setExtendo(guard);
    }
    guard.addAllVertices();
    guard.sortVertices();
    guardArray.push(guard);
  }
}

// gets parameters ready to make the new polygon
function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let vertexes = []; // temp vertexes array to be passed into Shape constructor
  let newShape = null;
  // gets the vertexes ready and puts them into temp array

  if (shapeArray.length === 0) {
    newShape = new Shape(npoints, "black");
    let stage = [
      new Point(0, 0, newShape),
      new Point(width, 0, newShape),
      new Point(width, height, newShape),
      new Point(0, height, newShape),
    ];
    for (let i = 0; i < stage.length; i += 1) {
      allVertices.push(stage[i]);
      vertexes.push(stage[i]);
    }
  } else {
    newShape = new Shape(npoints, "white");
    for (let i = 0; i < TWO_PI - HEXAGON_ROUNDING_ERROR; i += angle) {
      let sx = x + cos(i) * radius;
      let sy = y + sin(i) * radius;
      // console.log("original point", sx, sy);
      aPoint = new Point(sx, sy, newShape);
      allVertices.push(aPoint);
      vertexes.push(aPoint);
    }
  }

  newShape.setVertexArray(vertexes);
  newShape.setLineArray();
  shapeArray.push(newShape);

  for (let i = 0; i < allVertices.length; i += 1) {
    for (let j = 0; j < guardArray.length; j += 1) {
      allVertices[i].setSecurityGuardAngle(guardArray[j]);
      allVertices[i].setExtendedFrom(guardArray[j], null);
      allVertices[i].setExtendo(guardArray[j]);
    }
  }
  for (let j = 0; j < guardArray.length; j += 1) {
    guardArray[j].addAllVertices();
    guardArray[j].sortVertices();
  }
}

function renderAllSecurityGuards() {
  for (let i = 0; i < guardArray.length; i += 1) {
    guardArray[i].drawSecurityGuard();
  }

  for (let i = 0; i < guardArray.length; i += 1) {
    if (guard_i !== -1) i = guard_i;

    guardArray[i].closestAngleVertex(i);
    guardArray[i].visibleVertices();
    guardArray[i].clearOrderedIsovistVertices();
    for (let key of guardArray[i].getIsovistVertices()) {
      guardArray[i].getOrderedIsovistVertices().push(key);
    }
    guardArray[i].sortIsovistVertices();
    push();
    if (guard_i === i) {
      fill(255, 233, 0, 200);
    } else {
      fill(
        guardArray[i].getName()[0],
        guardArray[i].getName()[1],
        guardArray[i].getName()[2],
        100
      );
    }
    beginShape();
    for (
      let k = 0;
      k < guardArray[i].getOrderedIsovistVertices().length;
      k += 1
    ) {
      if (
        guardArray[i]
          .getOrderedIsovistVertices()
          [k].getExtendFromForSecurityGuard(guardArray[i]) === null
      ) {
        vertex(
          guardArray[i].getOrderedIsovistVertices()[k].getX(),
          guardArray[i].getOrderedIsovistVertices()[k].getY()
        );
      } else if (
        guardArray[i]
          .getOrderedIsovistVertices()
          [k].getExtendFromForSecurityGuard(guardArray[i])
          .getExtendoForSecurityGuard(guardArray[i]) === "left"
      ) {
        vertex(
          guardArray[i].getOrderedIsovistVertices()[k].getX(),
          guardArray[i].getOrderedIsovistVertices()[k].getY()
        );

        vertex(
          guardArray[i]
            .getOrderedIsovistVertices()
            [k].getExtendFromForSecurityGuard(guardArray[i])
            .getX(),
          guardArray[i]
            .getOrderedIsovistVertices()
            [k].getExtendFromForSecurityGuard(guardArray[i])
            .getY()
        );
      } else if (
        guardArray[i]
          .getOrderedIsovistVertices()
          [k].getExtendFromForSecurityGuard(guardArray[i])
          .getExtendoForSecurityGuard(guardArray[i]) === "right"
      ) {
        vertex(
          guardArray[i]
            .getOrderedIsovistVertices()
            [k].getExtendFromForSecurityGuard(guardArray[i])
            .getX(),
          guardArray[i]
            .getOrderedIsovistVertices()
            [k].getExtendFromForSecurityGuard(guardArray[i])
            .getY()
        );

        vertex(
          guardArray[i].getOrderedIsovistVertices()[k].getX(),
          guardArray[i].getOrderedIsovistVertices()[k].getY()
        );
      }
    }
    endShape(CLOSE);
    pop();
    if (guard_i !== -1) break;
  }
}

function renderAllShapes() {
  for (let i = 0; i < shapeArray.length; i += 1) {
    push();
    if (shape_i_for_shape_clicked === i) {
      fill([255, 233, 0]);
    } else fill(shapeArray[i].getColor());
    beginShape();
    for (let j = 0; j < shapeArray[i].vertexArray.length; j += 1) {
      vertex(
        shapeArray[i].vertexArray[j].getX(),
        shapeArray[i].vertexArray[j].getY()
      );
    }
    endShape(CLOSE);
    pop();
  }
}

function checkIfClickAVertex() {
  if (pointClicked === true) return false;

  for (let i = 1; i < shapeArray.length; i += 1) {
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
        point_j = j;
        shape_i = i;
        return true;
      }
    }
  }
}

function mouseClicked() {
  if (securityGuardClicked) {
    securityGuardClicked = false;
    guard_i = -1;
  } else if (checkIfClickSecurityGuard()) securityGuardClicked = true;
  else if (pointClicked) pointClicked = false;
  else if (checkIfClickAVertex()) pointClicked = true;
  else if (shapeClicked) {
    shapeClicked = false;
    shape_i_for_shape_clicked = -1;
  } else if (checkIfClickInsideShape()) shapeClicked = true;
}

function checkIfClickInsideShape() {
  if (shapeClicked === true) return false;

  for (let i = 1; i < shapeArray.length; i += 1) {
    let lineSegmentCrossesCounter = 0; // for ray trace algorithm
    for (let j = 0; j < shapeArray[i].lineArray.length; j += 1) {
      if (
        checkIfIntersect(
          new Line(
            new Point(mouseX, mouseY, null),
            new Point(width, mouseY, null)
          ),
          shapeArray[i].getLineArray()[j]
        )
      ) {
        lineSegmentCrossesCounter += 1;
      }
    }

    // ray tracing algorithm says if line segment crosses === odd num, then click is inside the shape
    if (lineSegmentCrossesCounter % 2 === 1) {
      shape_i_for_shape_clicked = i;
      updateVertexArrayDistancetoMousePress(i);
      return true;
    }
  }
}

function checkIfClickSecurityGuard() {
  if (securityGuardClicked === true) return false;

  for (let i = 0; i < guardArray.length; i += 1) {
    if (
      between(mouseX, guardArray[i].getX() - 10, guardArray[i].getX() + 10) &&
      between(mouseY, guardArray[i].getY() - 10, guardArray[i].getY() + 10)
    ) {
      guard_i = i;
      return true;
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
  if (pointClicked === true) {
    shapeArray[shape_i].vertexArray[point_j].setX(mouseX);
    shapeArray[shape_i].vertexArray[point_j].setY(mouseY);

    shapeArray[shape_i].setLineArray();
    updateVertexArrayDistancetoMousePress(shape_i);

    for (let i = 0; i < allVertices.length; i += 1) {
      if (allVertices[i] === shapeArray[shape_i].vertexArray[point_j]) {
        for (let j = 0; j < guardArray.length; j += 1) {
          for (let k = 0; k < allVertices.length; k += 1) {
            allVertices[k].setExtendo(guardArray[j]);
          }
          allVertices[i].setSecurityGuardAngle(guardArray[j]);
          allVertices[i].setExtendedFrom(guardArray[j], null);
          allVertices[j].setExtendo(guardArray[j]);
        }
        break;
      }
    }
    for (let j = 0; j < guardArray.length; j += 1) {
      guardArray[j].sortVertices();
    }
  }
}

function dragSecurityGuard() {
  if (securityGuardClicked === true) {
    guardArray[guard_i].setX(mouseX);
    guardArray[guard_i].setY(mouseY);

    for (let i = 0; i < allVertices.length; i += 1) {
      allVertices[i].setSecurityGuardAngle(guardArray[guard_i]);
      allVertices[i].setExtendedFrom(guardArray[guard_i], null);
      allVertices[i].setExtendo(guardArray[guard_i]);
    }
    guardArray[guard_i].sortVertices();
  }
}

function dragShape() {
  if (shapeClicked === true) {
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

    shapeArray[shape_i_for_shape_clicked].setLineArray();

    for (let i = 0; i < allVertices.length; i += 1) {
      for (let j = 0; j < guardArray.length; j += 1) {
        allVertices[i].setSecurityGuardAngle(guardArray[j]);
        allVertices[i].setExtendedFrom(guardArray[j], null);
        allVertices[i].setExtendo(guardArray[j]);
      }
    }

    for (let j = 0; j < guardArray.length; j += 1) {
      guardArray[j].sortVertices();
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
  return new Point(px, py, null);
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

function checkIfIntersect(line1, line2) {
  let p1 = line1.getPoint1();
  let q1 = line1.getPoint2();
  let p2 = line2.getPoint1();
  let q2 = line2.getPoint2();

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

function checkIfTwoPointsOverlap(p1, p2) {
  return p1.getX() === p2.getX() && p1.getY() === p2.getY();
}

function checkIfTwoPointsOverlapRounded(p1, p2) {
  return (
    Math.round(p1.getX() * 100) / 100 === Math.round(p2.getX() * 100) / 100 &&
    Math.round(p1.getY() * 100) / 100 === Math.round(p2.getY() * 100) / 100
  );
}

function checkIfVertexIsEndPointOfALine(aVertex, aLine) {
  return (
    checkIfTwoPointsOverlap(aVertex, aLine.getPoint1()) ||
    checkIfTwoPointsOverlap(aVertex, aLine.getPoint2())
  );
}

function checkIfTwoLinesIntersectOnEndPoints(line1, line2) {
  return (
    checkIfTwoPointsOverlap(line1.getPoint1(), line2.getPoint1()) ||
    checkIfTwoPointsOverlap(line1.getPoint2(), line2.getPoint2()) ||
    checkIfTwoPointsOverlap(line1.getPoint1(), line2.getPoint2())
  );
}

class Shape {
  constructor(nPoints, color) {
    this.id = Date.now();
    this.nPoints = nPoints;
    this.vertexArray = null;
    this.vertexArrayDistancetoMousePress = [];
    this.lineArray = [];
    this.color = color;
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
      let aLine = new Line(this.vertexArray[i], this.vertexArray[i + 1]);
      this.lineArray.push(aLine);
    }

    let aLine = new Line(
      this.vertexArray[this.vertexArray.length - 1],
      this.vertexArray[0]
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

  getColor() {
    return this.color;
  }
}

class Line {
  constructor(p1, p2) {
    this.Point1 = p1;
    this.Point2 = p2;
  }

  getPoint1() {
    return this.Point1;
  }

  getPoint2() {
    return this.Point2;
  }

  drawLine() {
    line(
      this.Point1.getX(),
      this.Point1.getY(),
      this.Point2.getX(),
      this.Point2.getY()
    );
  }

  closestAngleVertex(sortedVertices, i) {
    if (sortedVertices.length > 0) {
      this.Point1.setX(guardArray[i].getX());
      this.Point1.setY(guardArray[i].getY());
      this.Point2.setX(sortedVertices[0].getX());
      this.Point2.setY(sortedVertices[0].getY());
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
    this.extendo = new Map();
    this.extendedFrom = new Map();
  }

  setExtendedFrom(guard, aPoint) {
    this.extendedFrom.set(guard.getName(), aPoint);
  }

  setSecurityGuardAngle(guard) {
    let adj = 0;
    let a = this.x - guard.getX();
    let o = -this.y + guard.getY();
    let angle = Math.atan2(o, a);

    if (angle < 0) {
      angle += TWO_PI;
    }

    this.secuirtyGuardMap.set(guard.getName(), angle + adj);
  }

  setExtendo(guard) {
    let helperVector = createVector(1, 1, 1);

    let guardToPointV = createVector(
      this.getX() - guard.getX(),
      -(this.getY() - guard.getY()),
      0
    );

    let v1 = createVector(
      this.getPointPrev().getX() - this.getX(),
      -(this.getPointPrev().getY() - this.getY()),
      0
    );

    let v2 = createVector(
      this.getPointNext().getX() - this.getX(),
      -(this.getPointNext().getY() - this.getY()),
      0
    );

    let crossProduct1 = p5.Vector.cross(guardToPointV, v1).dot(helperVector);
    let crossProduct2 = p5.Vector.cross(guardToPointV, v2).dot(helperVector);

    if (crossProduct1 > 0 && crossProduct2 > 0) {
      this.extendo.set(guard.getName(), "left");
    } else if (crossProduct1 < 0 && crossProduct2 < 0) {
      this.extendo.set(guard.getName(), "right");
    } else {
      this.extendo.set(guard.getName(), "nope");
    }
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

  getExtendFromForSecurityGuard(guard) {
    return this.extendedFrom.get(guard.getName());
  }

  getAngleForSecurityGuard(guard) {
    return this.secuirtyGuardMap.get(guard);
  }

  getExtendo() {
    return this.extendo;
  }

  getExtendoForSecurityGuard(guard) {
    return this.extendo.get(guard.getName());
  }
}

class SecurityGuard {
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.size = 13;
    this.line = new Line(new Point(0, 0, null), new Point(0, 0, null));
    this.sortedVertices = [];
    this.treeOfEdges = [];
    this.orderedIsovistVertices = [];
    this.isovistVertices = new Set();
  }

  visibleVertices() {
    let helperVector = createVector(1, 1, 1);
    this.isovistVertices = new Set();
    this.treeOfEdges = [];

    // Pretend a straight line is drawn from security guard to right hand wall.
    // Insert all intercepting edges to this.treeOfEdges
    this.initalIntersect();

    // Go through all the vertices by radian in regards to
    // the straight line from security guard to right hand wall
    for (let i = 0; i < this.sortedVertices.length; i += 1) {
      let toRemove = [];

      // Delete edges that like on clockwise side of sweep
      for (let j = 0; j < this.treeOfEdges.length; j += 1) {
        if (
          this.treeOfEdges[j].getPoint1().getX() ===
            this.sortedVertices[i].getX() &&
          this.treeOfEdges[j].getPoint1().getY() ===
            this.sortedVertices[i].getY()
        ) {
          let crossProduct1 = p5.Vector.cross(
            createVector(
              this.sortedVertices[i].getX() - this.getX(),
              -(this.sortedVertices[i].getY() - this.getY()),
              0
            ),
            createVector(
              this.treeOfEdges[j].getPoint2().getX() -
                this.sortedVertices[i].getX(),
              -(
                this.treeOfEdges[j].getPoint2().getY() -
                this.sortedVertices[i].getY()
              ),
              0
            )
          ).dot(helperVector);
          if (crossProduct1 < 0) toRemove.push(this.treeOfEdges[j]);
        } else if (
          this.treeOfEdges[j].getPoint2().getX() ===
            this.sortedVertices[i].getX() &&
          this.treeOfEdges[j].getPoint2().getY() ===
            this.sortedVertices[i].getY()
        ) {
          let crossProduct2 = p5.Vector.cross(
            createVector(
              this.sortedVertices[i].getX() - this.getX(),
              -(this.sortedVertices[i].getY() - this.getY()),
              0
            ),
            createVector(
              this.treeOfEdges[j].getPoint1().getX() -
                this.sortedVertices[i].getX(),
              -(
                this.treeOfEdges[j].getPoint1().getY() -
                this.sortedVertices[i].getY()
              ),
              0
            )
          ).dot(helperVector);
          if (crossProduct2 < 0) toRemove.push(this.treeOfEdges[j]);
        }
      }
      // Remove the edges in toRemove array
      for (let a = 0; a < toRemove.length; a += 1) {
        for (let b = 0; b < this.treeOfEdges.length; b += 1) {
          if (this.treeOfEdges[b] === toRemove[a]) {
            toRemove[a] = this.treeOfEdges[b];
            break;
          }
        }
      }

      this.treeOfEdges = this.treeOfEdges.filter(
        (el) => !toRemove.includes(el)
      );

      // Insert edges that lie on counter-clockwise side of sweep.
      let crossProduct3 = p5.Vector.cross(
        createVector(
          this.sortedVertices[i].getX() - this.getX(),
          -(this.sortedVertices[i].getY() - this.getY()),
          0
        ),
        createVector(
          this.sortedVertices[i].getPointPrev().getX() -
            this.sortedVertices[i].getX(),
          -(
            this.sortedVertices[i].getPointPrev().getY() -
            this.sortedVertices[i].getY()
          ),
          0
        )
      ).dot(helperVector);

      if (crossProduct3 >= 0) {
        this.treeOfEdges.push(
          new Line(
            this.sortedVertices[i],
            this.sortedVertices[i].getPointPrev()
          )
        );
      }

      let crossProduct4 = p5.Vector.cross(
        createVector(
          this.sortedVertices[i].getX() - this.getX(),
          -(this.sortedVertices[i].getY() - this.getY()),
          0
        ),
        createVector(
          this.sortedVertices[i].getPointNext().getX() -
            this.sortedVertices[i].getX(),
          -(
            this.sortedVertices[i].getPointNext().getY() -
            this.sortedVertices[i].getY()
          ),
          0
        )
      ).dot(helperVector);

      if (crossProduct4 >= 0) {
        this.treeOfEdges.push(
          new Line(
            this.sortedVertices[i],
            this.sortedVertices[i].getPointNext()
          )
        );
      }

      if (this.visible(this.sortedVertices[i]) === true) {
        this.isovistVertices.add(this.sortedVertices[i]);

        if (
          shapeArray[0].getVertexArray().includes(this.sortedVertices[i]) ===
            false &&
          this.sortedVertices[i].getExtendoForSecurityGuard(this) !== "nope"
        ) {
          this.considerExtendoVertices(this.sortedVertices[i]);
        }
      }
    }
  }

  considerExtendoVertices(w_i) {
    let sclar = 9999;
    let possibleExtensions = [];
    let p2 = new Point(w_i.getX(), w_i.getY(), null);
    let sortedTreeOfEdges = this.treeOfEdges.slice();

    if (Math.abs(p2.getX() - this.x) !== 0) {
      let slope = (p2.getY() - this.y) / (p2.getX() - this.x);
      if (this.y < w_i.getY()) {
        p2.setY(w_i.getY() + Math.abs(slope) * sclar);
      } else {
        p2.setY(w_i.getY() - Math.abs(slope) * sclar);
      }
      if (this.x < w_i.getX()) {
        p2.setX(w_i.getX() + sclar);
      } else {
        p2.setX(w_i.getX() - sclar);
      }
    } else {
      p2.setX(this.getX());
      if (this.y < w_i.getY()) {
        p2.setY(height);
      } else {
        p2.setY(0);
      }
    }

    for (let i = 0; i < sortedTreeOfEdges.length; i += 1) {
      if (
        checkIfIntersect(
          new Line(new Point(this.x, this.y, null), p2),
          sortedTreeOfEdges[i]
        )
      ) {
        let intersectionPoint = findIntersection(
          this.x,
          this.y,
          p2.getX(),
          p2.getY(),
          sortedTreeOfEdges[i].getPoint1().getX(),
          sortedTreeOfEdges[i].getPoint1().getY(),
          sortedTreeOfEdges[i].getPoint2().getX(),
          sortedTreeOfEdges[i].getPoint2().getY()
        );

        if (checkIfTwoPointsOverlapRounded(w_i, intersectionPoint) === false) {
          possibleExtensions.push([
            sortedTreeOfEdges[i],
            Math.sqrt(
              (this.x - intersectionPoint.getX()) ** 2 +
                (this.y - intersectionPoint.getY()) ** 2
            ),
            new Point(intersectionPoint.getX(), intersectionPoint.getY(), null),
          ]);
        }
      }
    }

    possibleExtensions.sort(function (a, b) {
      return a[1] - b[1];
    });

    if (possibleExtensions.length !== 0) {
      possibleExtensions[0][2].setSecurityGuardAngle(this);
      possibleExtensions[0][2].setExtendedFrom(this, w_i);
      this.isovistVertices.add(possibleExtensions[0][2]);
      this.isovistVertices.delete(w_i);
    }
  }

  visible(w_i) {
    return this.cheapline3(w_i);
    // Check if the line to the vertex intersects the vertex's parent shape.
    // If so, return false. Otherwise, continue the algorithm.
    // My reference said implement what I said above but I think there is no need
  }

  cheapline3(w_i) {
    let mainline = new Line(new Point(this.getX(), this.getY(), null), w_i);
    for (let i = 0; i < this.treeOfEdges.length; i += 1) {
      if (
        checkIfIntersect(
          this.treeOfEdges[i],
          new Line(
            new Point(this.getX(), this.getY(), null),
            new Point(w_i.getX(), w_i.getY(), null)
          )
        ) === true &&
        checkIfTwoLinesIntersectOnEndPoints(this.treeOfEdges[i], mainline) ===
          false
      ) {
        return false;
      }
    }
    return true;
  }

  addAllVertices() {
    this.sortedVertices = [];
    for (let i = 0; i < allVertices.length; i += 1) {
      this.sortedVertices.push(allVertices[i]);
    }
  }

  sortVertices() {
    let name = this.name;
    this.sortedVertices.sort(function (a, b) {
      return (
        a.getAngleForSecurityGuard(name) - b.getAngleForSecurityGuard(name)
      );
    });
  }

  sortIsovistVertices() {
    let name = this.name;
    this.orderedIsovistVertices.sort(function (a, b) {
      return (
        a.getAngleForSecurityGuard(name) - b.getAngleForSecurityGuard(name)
      );
    });
  }

  drawSecurityGuard() {
    push();
    stroke("white");
    strokeWeight(this.size + 5);
    point(this.x, this.y);

    strokeWeight(this.size);
    stroke(this.name);
    point(this.x, this.y);
    pop();
  }

  drawLine() {
    this.line.drawLine();
  }

  closestAngleVertex(i) {
    this.line.closestAngleVertex(this.sortedVertices, i);
  }

  initalIntersect() {
    for (let i = 0; i < shapeArray.length; i += 1) {
      for (let j = 0; j < shapeArray[i].getLineArray().length; j += 1) {
        if (
          checkIfIntersect(
            new Line(
              new Point(this.x, this.y, null),
              new Point(width, this.y, null)
            ),
            shapeArray[i].getLineArray()[j]
          )
        ) {
          this.treeOfEdges.push(shapeArray[i].getLineArray()[j]);
        }
      }
    }
  }

  clearOrderedIsovistVertices() {
    this.orderedIsovistVertices = [];
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

  getName() {
    return this.name;
  }

  getOrderedIsovistVertices() {
    return this.orderedIsovistVertices;
  }

  getIsovistVertices() {
    return this.isovistVertices;
  }
}
