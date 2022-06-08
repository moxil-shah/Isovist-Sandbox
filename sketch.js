// I shortened the visible algo (got rid of checking if intecepts with parent shape)
// fix the sclar to be more exact

let allShapes = new Set(); // global array of all shapes made
let allguards = new Set(); // global array of all security guards made
const SecurityGuardNames = [
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 0],
];
let pointClicked = false;
let shapeClicked = false;
let securityGuardClicked = false;
let doubleClick = false;

let HEXAGON_ROUNDING_ERROR = 1e-15;
let shapeDragged = -1;
let shapesPointDragged;
let pointDragged = -1;
let guardDragged = -1;
let gameShape;
let intersectionPointsGlobal = new Map();
let fornow = true;

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
  renderVertexClicked();

  // for (const [key, value] of intersectionPointsGlobal) {
  //   push();
  //   strokeWeight(15);
  //   stroke("green");
  //   for (eachValue of value) {
  //     point(eachValue.getX(), eachValue.getY());
  //   }
  //   pop();
  // }
  deletetheselfintersect();
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
    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        currentVertex.setSecurityGuardAngle(guard);
        currentVertex.setExtendedFrom(guard, null);
        currentVertex.setExtendo(guard);
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }
    guard.addAllVertices();
    guard.sortVertices();
    allguards.add(guard);
  }
}

// gets parameters ready to make the new polygon
function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let vertexes = []; // temp vertexes array to be passed into Shape constructor
  let newShape = null;
  // gets the vertexes ready and puts them into temp array

  if (allShapes.size === 0) {
    newShape = new Shape(npoints, "black");
    gameShape = newShape;
    let stage = [
      new Point(0, 0, newShape),
      new Point(width, 0, newShape),
      new Point(width, height, newShape),
      new Point(0, height, newShape),
    ];
    for (let i = 0; i < stage.length; i += 1) {
      vertexes.push(stage[i]);
    }
  } else {
    newShape = new Shape(npoints, "white");
    for (let i = 0; i < TWO_PI - HEXAGON_ROUNDING_ERROR; i += angle) {
      let sx = x + cos(i) * radius;
      let sy = y + sin(i) * radius;
      aPoint = new Point(sx, sy, newShape);
      vertexes.push(aPoint);
    }
  }

  newShape.setVerticesLinkedList(vertexes);
  newShape.setEdges();
  allShapes.add(newShape);

  for (let eachShape of allShapes) {
    let currentVertex = eachShape.getVertexHead();
    do {
      for (let guard of allguards) {
        currentVertex.setSecurityGuardAngle(guard);
        currentVertex.setExtendedFrom(guard, null);
        currentVertex.setExtendo(guard);
      }
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== eachShape.getVertexHead());
  }

  for (let guard of allguards) {
    guard.addAllVertices();
    guard.sortVertices();
  }
}

function renderAllSecurityGuards() {
  for (let guard of allguards) {
    guard.drawSecurityGuard();
  }

  for (let guard of allguards) {
    if (guardDragged !== -1) guard = guardDragged;

    guard.closestAngleVertex(guard);
    guard.visibleVertices();
    guard.clearOrderedIsovistVertices();
    for (let key of guard.getIsovistVertices()) {
      guard.getOrderedIsovistVertices().push(key);
    }
    guard.sortIsovistVertices();

    push();

    fill(guard.getName()[0], guard.getName()[1], guard.getName()[2], 100);

    beginShape();
    for (let k = 0; k < guard.getOrderedIsovistVertices().length; k += 1) {
      if (
        guard
          .getOrderedIsovistVertices()
          [k].getExtendFromForSecurityGuard(guard) === null
      ) {
        vertex(
          guard.getOrderedIsovistVertices()[k].getX(),
          guard.getOrderedIsovistVertices()[k].getY()
        );
      } else if (
        guard
          .getOrderedIsovistVertices()
          [k].getExtendFromForSecurityGuard(guard)
          .getExtendoForSecurityGuard(guard) === "left"
      ) {
        vertex(
          guard.getOrderedIsovistVertices()[k].getX(),
          guard.getOrderedIsovistVertices()[k].getY()
        );
        vertex(
          guard
            .getOrderedIsovistVertices()
            [k].getExtendFromForSecurityGuard(guard)
            .getX(),
          guard
            .getOrderedIsovistVertices()
            [k].getExtendFromForSecurityGuard(guard)
            .getY()
        );
      } else if (
        guard
          .getOrderedIsovistVertices()
          [k].getExtendFromForSecurityGuard(guard)
          .getExtendoForSecurityGuard(guard) === "right"
      ) {
        vertex(
          guard
            .getOrderedIsovistVertices()
            [k].getExtendFromForSecurityGuard(guard)
            .getX(),
          guard
            .getOrderedIsovistVertices()
            [k].getExtendFromForSecurityGuard(guard)
            .getY()
        );

        vertex(
          guard.getOrderedIsovistVertices()[k].getX(),
          guard.getOrderedIsovistVertices()[k].getY()
        );
      }
    }
    endShape(CLOSE);
    pop();

    if (guardDragged !== -1) break;
  }
}

function renderVertexClicked() {
  if (pointDragged != -1) {
    push();
    strokeWeight(15);
    stroke([255, 233, 0]);
    point(pointDragged.getX(), pointDragged.getY());
    pop();
  }
}

function renderAllShapes() {
  for (let shape of allShapes) {
    push();
    if (shapeDragged === shape) {
      fill([255, 233, 0]);
    } else fill(shape.getColor());
    beginShape();

    let aVertex = shape.getVertexHead();
    let counter = 0;
    do {
      push();
      strokeWeight(15);
      stroke("purple");
      point(aVertex.getX(), aVertex.getY());
      if (aVertex.getIncludeInRender() === true)
        vertex(aVertex.getX(), aVertex.getY());
      pop();

      aVertex = aVertex.getPointNext();
      counter += 1;
    } while (aVertex !== shape.vertexHead);

    console.log(counter);

    endShape(CLOSE);
    pop();
  }
}

function deletetheselfintersect() {
  for (let shape of allShapes) {
    let aVertex = shape.getVertexHead();
    do {
      if (aVertex.getIncludeInRender() === false) {
        aVertex.getPointPrev().setPointNext(aVertex.getPointNext());
        aVertex.getPointNext().setPointPrev(aVertex.getPointPrev());
        aVertex = aVertex.getPointPrev();
      }
      aVertex = aVertex.getPointNext();
    } while (aVertex !== shape.vertexHead);

    shape.setEdges();
  }
}

function checkIfClickAVertex() {
  if (pointClicked === true) return false;

  for (let eachShape of allShapes) {
    if (eachShape === gameShape) continue;

    let currentVertex = eachShape.getVertexHead();
    do {
      if (
        between(mouseX, currentVertex.getX() - 10, currentVertex.getX() + 10) &&
        between(mouseY, currentVertex.getY() - 10, currentVertex.getY() + 10)
      ) {
        pointDragged = currentVertex;
        shapesPointDragged = eachShape;
        return true;
      }
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== eachShape.getVertexHead());
  }
  return false;
}

function doubleClicked() {
  doubleClick = true;
  console.log("double clicked!");
}

function mouseClicked() {
  if (doubleClick) {
    doubleClick = shapeClicked = securityGuardClicked = false;
    console.log("double clicked exit!");
    return;
  }

  if (securityGuardClicked) {
    securityGuardClicked = false;
    guardDragged = -1;
  } else if (checkIfClickSecurityGuard()) securityGuardClicked = true;
  else if (pointClicked) {
    pointClicked = false;
    pointDragged = -1;

  } else if (checkIfClickAVertex()) pointClicked = true;
  else if (shapeClicked) {
    shapeClicked = false;
    shapeDragged = -1;
  } else if (checkIfClickInsideShape()) shapeClicked = true;
}

function checkIfClickInsideShape() {
  if (shapeClicked === true) return false;

  for (let shape of allShapes) {
    if (shape === gameShape) continue;
    let lineSegmentCrossesCounter = 0; // for ray trace algorithm
    for (let edge of shape.getEdges()) {
      if (
        checkIfIntersect(
          new Line(
            new Point(mouseX, mouseY, null),
            new Point(width, mouseY, null)
          ),
          edge
        )
      ) {
        lineSegmentCrossesCounter += 1;
      }
    }

    // ray tracing algorithm says if line segment crosses === odd num, then click is inside the shape
    if (lineSegmentCrossesCounter % 2 === 1) {
      shapeDragged = shape;

      updateVertexArrayDistancetoMousePress(shape);
      return true;
    }
  }
}

function checkIfClickSecurityGuard() {
  if (securityGuardClicked === true) return false;

  for (let guard of allguards) {
    if (
      between(mouseX, guard.getX() - 10, guard.getX() + 10) &&
      between(mouseY, guard.getY() - 10, guard.getY() + 10)
    ) {
      guardDragged = guard;
      return true;
    }
  }
}

function updateVertexArrayDistancetoMousePress(shape) {
  shape.verticesDistancetoMousePress = new Map();

  let currentVertex = shape.getVertexHead();
  do {
    // the meat
    deltaX = mouseX - currentVertex.getX();
    deltaY = mouseY - currentVertex.getY();
    shape.setVerticesDistancetoMousePress(currentVertex, [deltaX, deltaY]);
    currentVertex = currentVertex.getPointNext();
  } while (currentVertex !== shape.getVertexHead());
}

function dragPoint() {
  if (doubleClick === true || pointDragged === -1) {
    pointDragged = -1;
    return;
  }
  if (pointClicked === true) {
    pointDragged.setX(mouseX);
    pointDragged.setY(mouseY);

    let thething = checkIfSelfIntersectingPolygon(
      shapesPointDragged,
      pointDragged
    );

    intersectionPointsGlobal = thething;

    for (const [key, value] of thething) {
      let referencePoint;
      let nextPoint;
      if (key.getPoint1().getPointNext() === key.getPoint2()) {
        referencePoint = key.getPoint1();
        nextPoint = key.getPoint2();
      } else if (key.getPoint2().getPointNext() === key.getPoint1()) {
        referencePoint = key.getPoint2();
        nextPoint = key.getPoint1();
      } else {
        console.log("Big Error 1!");
      }

      for (let i = 0; i < value.length; i += 1) {
        value[i] = [
          value[i],
          Math.sqrt(
            (referencePoint.getX() - value[i].getX()) ** 2 +
              (referencePoint.getY() - value[i].getY()) ** 2
          ),
        ];
      }

      value.sort(function (a, b) {
        return a[1] - b[1];
      });

      for (let i = 0; i < value.length; i += 1) {
        value[i] = value[i][0];

        value[i].setIncludeInRender(false);
      }
      if (value.length > 2) {
        console.log("not ready yet");
        for (let i = 1; i < value.length - 1; i += 1) {
          value[i].setPointPrev(value[i - 1]);
          value[i].setPointNext(value[i + 1]);
        }
      }

      if (value.length === 1) {
        referencePoint.setPointNext(value[0]);
        value[0].setPointNext(nextPoint);
        value[0].setPointPrev(referencePoint);
        nextPoint.setPointPrev(value[0]);
      }
    }

    shapesPointDragged.setEdges();
    updateVertexArrayDistancetoMousePress(shapesPointDragged);

    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        for (let guard of allguards) {
          currentVertex.setSecurityGuardAngle(guard);
          currentVertex.setExtendedFrom(guard, null);
          currentVertex.setExtendo(guard);
        }
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }

    for (let guard of allguards) {
      guard.addAllVertices();
      guard.sortVertices();
    }
  }
}

function checkIfSelfIntersectingPolygon(theShape, thePoint) {
  let intersectionPoints = new Map();

  for (let eachLine of theShape.getEdges()) {
    for (let shapeLine of theShape.getEdges()) {
      if (eachLine === shapeLine) continue;
      if (checkIfIntersect(eachLine, shapeLine) === true) {
        let intersectionPoint = findIntersection(eachLine, shapeLine);
        let indicator = true;

        let currentVertex = theShape.getVertexHead();
        do {
          if (
            checkIfTwoPointsOverlapRounded(currentVertex, intersectionPoint)
          ) {
            indicator = false;
            break;
          }
          currentVertex = currentVertex.getPointNext();
        } while (currentVertex !== theShape.getVertexHead());

        if (indicator === true) {
          if (intersectionPoints.get(eachLine) !== undefined)
            intersectionPoints.get(eachLine).push(intersectionPoint);
          else {
            intersectionPoints.set(eachLine, [intersectionPoint]);
          }
        }
      }
    }
  }
  return intersectionPoints;
}

function dragSecurityGuard() {
  if (doubleClick === true || guardDragged === -1) {
    guardDragged = -1;
    return;
  }
  if (securityGuardClicked === true) {
    guardDragged.setX(mouseX);
    guardDragged.setY(mouseY);

    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        currentVertex.setSecurityGuardAngle(guardDragged);
        currentVertex.setExtendedFrom(guardDragged, null);
        currentVertex.setExtendo(guardDragged);
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }
    guardDragged.sortVertices();
  }
}

function dragShape() {
  if (doubleClick === true || shapeDragged === -1) {
    shapeDragged = -1;
    return;
  }
  if (shapeClicked === true) {
    let currentVertex = shapeDragged.getVertexHead();
    do {
      deltaXCurrent = mouseX - currentVertex.getX();
      deltaYCurrent = mouseY - currentVertex.getY();
      deltaX = shapeDragged.getVerticesDistancetoMousePress(currentVertex)[0];
      deltaY = shapeDragged.getVerticesDistancetoMousePress(currentVertex)[1];
      currentVertex.setX(currentVertex.getX() + deltaXCurrent - deltaX);

      currentVertex.setY(currentVertex.getY() + deltaYCurrent - deltaY);
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== shapeDragged.getVertexHead());

    shapeDragged.setEdges();

    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        for (let guard of allguards) {
          currentVertex.setSecurityGuardAngle(guard);
          currentVertex.setExtendedFrom(guard, null);
          currentVertex.setExtendo(guard);
        }
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }

    for (let guard of allguards) {
      guard.sortVertices();
    }
  }
}

function findIntersection(line1, line2) {
  let px =
    ((line1.getPoint1().getX() * line1.getPoint2().getY() -
      line1.getPoint1().getY() * line1.getPoint2().getX()) *
      (line2.getPoint1().getX() - line2.getPoint2().getX()) -
      (line1.getPoint1().getX() - line1.getPoint2().getX()) *
        (line2.getPoint1().getX() * line2.getPoint2().getY() -
          line2.getPoint1().getY() * line2.getPoint2().getX())) /
    ((line1.getPoint1().getX() - line1.getPoint2().getX()) *
      (line2.getPoint1().getY() - line2.getPoint2().getY()) -
      (line1.getPoint1().getY() - line1.getPoint2().getY()) *
        (line2.getPoint1().getX() - line2.getPoint2().getX()));
  let py =
    ((line1.getPoint1().getX() * line1.getPoint2().getY() -
      line1.getPoint1().getY() * line1.getPoint2().getX()) *
      (line2.getPoint1().getY() - line2.getPoint2().getY()) -
      (line1.getPoint1().getY() - line1.getPoint2().getY()) *
        (line2.getPoint1().getX() * line2.getPoint2().getY() -
          line2.getPoint1().getY() * line2.getPoint2().getX())) /
    ((line1.getPoint1().getX() - line1.getPoint2().getX()) *
      (line2.getPoint1().getY() - line2.getPoint2().getY()) -
      (line1.getPoint1().getY() - line1.getPoint2().getY()) *
        (line2.getPoint1().getX() - line2.getPoint2().getX()));
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

function checkIfTwoLinesIntersectOnEndPointsRounded(line1, line2) {
  return (
    checkIfTwoPointsOverlapRounded(line1.getPoint1(), line2.getPoint1()) ||
    checkIfTwoPointsOverlapRounded(line1.getPoint2(), line2.getPoint2()) ||
    checkIfTwoPointsOverlapRounded(line1.getPoint1(), line2.getPoint2())
  );
}

class Shape {
  constructor(nPoints, color) {
    this.nPoints = nPoints;
    this.vertexHead;
    this.verticesDistancetoMousePress = new Map();
    this.edges = new Set();
    this.color = color;
  }

  setVerticesLinkedList(vertexArray) {
    vertexArray[0].setPointPrev(vertexArray[vertexArray.length - 1]);
    vertexArray[0].setPointNext(vertexArray[1]);
    this.vertexHead = vertexArray[0];

    vertexArray[vertexArray.length - 1].setPointPrev(
      vertexArray[vertexArray.length - 2]
    );
    vertexArray[vertexArray.length - 1].setPointNext(vertexArray[0]);

    for (let i = 1; i < vertexArray.length - 1; i += 1) {
      vertexArray[i].setPointPrev(vertexArray[i - 1]);
      vertexArray[i].setPointNext(vertexArray[i + 1]);
    }
  }

  setEdges() {
    this.edges = new Set();

    let currentVertex = this.vertexHead;
    do {
      let aLine = new Line(currentVertex, currentVertex.getPointNext());
      this.edges.add(aLine);
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== this.vertexHead);
  }

  setVerticesDistancetoMousePress(theVertex, coordinate) {
    this.verticesDistancetoMousePress.set(theVertex, coordinate);
  }

  getEdges() {
    return this.edges;
  }

  getVerticesDistancetoMousePress(theVertex) {
    return this.verticesDistancetoMousePress.get(theVertex);
  }

  getColor() {
    return this.color;
  }

  getVertexHead() {
    return this.vertexHead;
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
      this.Point1.setX(i.getX());
      this.Point1.setY(i.getY());
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
    this.includeInRender = true;
  }

  setIncludeInRender(yesOrNo) {
    this.includeInRender = yesOrNo;
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
    if (this.includeInRender === false) {
      this.extendo.set(guard.getName(), "nope");
      return;
    }
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

  getIncludeInRender() {
    return this.includeInRender;
  }
}

class SecurityGuard {
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.size = 15;
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
    console.log("guard", this.sortedVertices.length);
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

      // if (i === 3) {
      //   for (let k = 0; k < this.treeOfEdges.length; k += 1) {
      //     push();
      //     stroke("red");
      //     strokeWeight(15);

      //     line(
      //       this.treeOfEdges[k].getPoint1().getX(),
      //       this.treeOfEdges[k].getPoint1().getY(),
      //       this.treeOfEdges[k].getPoint2().getX(),
      //       this.treeOfEdges[k].getPoint2().getY()
      //     );
      //     stroke("green");
      //     point(
      //       this.sortedVertices[i].getX() - 23,
      //       this.sortedVertices[i].getY() + 23
      //     );
      //     pop();
      //   }

      //   console.log(i, this.visible(this.sortedVertices[i], i));
      // }

      if (this.visible(this.sortedVertices[i]) === true) {
        this.isovistVertices.add(this.sortedVertices[i]);
        let hasOrNot = false;
        let currentVertex = gameShape.getVertexHead();
        do {
          if (currentVertex === this.sortedVertices[i]) {
            hasOrNot = true;
            break;
          }
          currentVertex = currentVertex.getPointNext();
        } while (currentVertex !== gameShape.getVertexHead());

        if (
          hasOrNot === false &&
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
          new Line(new Point(this.x, this.y, null), p2),
          sortedTreeOfEdges[i]
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
    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        this.sortedVertices.push(currentVertex);
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
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
    for (let shape of allShapes) {
      for (let edge of shape.getEdges()) {
        if (
          checkIfIntersect(
            new Line(
              new Point(this.x, this.y, null),
              new Point(width, this.y, null)
            ),
            edge
          )
        ) {
          this.treeOfEdges.push(edge);
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
