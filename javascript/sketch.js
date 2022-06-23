// asano's algorithm is complete except gimpy edge cases like if the top edge
// of a rectangle is on the initial intersect line

// code starts //
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

const HEXAGON_ROUNDING_ERROR = 1e-15;
let shapeDragged = -1;
let shapesPointDragged;
let pointDragged = -1;
let guardDragged = -1;
let gameShape;

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
  frameRate(60);
  polygon(null, null, null, 4);
}

function draw() {
  background(102);
  dragSecurityGuard();
  dragPoint();
  dragShape();
  renderAllShapes();
  renderAllSecurityGuards();
  renderAllShapesPoints();
  renderVertexClicked();
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
    guard = new SecurityGuard(27.5, 100, SecurityGuardNames.pop());
    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        currentVertex.setSecurityGuardAngle(guard);

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
  let copyVertexes = [];
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
      vertexes.push(new Point(sx, sy, newShape));
      copyVertexes.push([sx, sy]);
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

    guard.visibleVertices();

    push();
    fill(guard.getName()[0], guard.getName()[1], guard.getName()[2], 100);
    beginShape();
    for (let eachPoint of guard.getConstructedPoints()) {
      vertex(eachPoint.getX(), eachPoint.getY());
      push();
      stroke("green");
      strokeWeight(15);
      point(eachPoint.getX(), eachPoint.getY());
      pop();
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
    do {
      push();
      if (aVertex.getIncludeInRender() === true)
        vertex(aVertex.getX(), aVertex.getY());
      pop();
      aVertex = aVertex.getPointNext();
    } while (aVertex !== shape.vertexHead);
    endShape(CLOSE);
    pop();
  }
}

function renderAllShapesPoints() {
  for (let shape of allShapes) {
    let currentVertex = shape.getVertexHead();
    do {
      if (currentVertex.getIncludeInRender() === true) {
        push();
        strokeWeight(10);
        stroke("white");
        point(currentVertex.getX(), currentVertex.getY());
        strokeWeight(5);
        stroke("black");
        point(currentVertex.getX(), currentVertex.getY());
        pop();
      }
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== shape.vertexHead);
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
        between(mouseY, currentVertex.getY() - 10, currentVertex.getY() + 10) &&
        currentVertex.getIncludeInRender() === true
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
}

function mouseClicked() {
  if (doubleClick) {
    doubleClick = shapeClicked = securityGuardClicked = false;

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
    updateVertexArrayDistancetoMousePress(shapesPointDragged);

    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        for (let guard of allguards) {
          currentVertex.setSecurityGuardAngle(guard);
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
    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        for (let guard of allguards) {
          currentVertex.setSecurityGuardAngle(guard);
        }
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }

    for (let guard of allguards) {
      guard.sortVertices();
    }
  }
}

class Shape {
  constructor(nPoints, color) {
    this.nPoints = nPoints;
    this.vertexHead;
    this.orignalVertexHead;
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
      currentVertex.setLineNext(aLine);
      currentVertex.getPointNext().setLinePrev(aLine);
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
    this.point1 = p1;
    this.point2 = p2;
    this.position = null;
    this.positionPrior = null;
  }

  setPosition(position) {
    this.position = position;
  }
  setPositionPrior(positionPrior) {
    this.positionPrior = positionPrior;
  }

  setPoint1(p1) {
    this.point1 = p1;
  }

  setPoint2(p2) {
    this.point2 = p2;
  }

  getPoint1() {
    return this.point1;
  }

  getPoint2() {
    return this.point2;
  }

  getPosition() {
    return this.position;
  }

  getPositionPrior() {
    return this.positionPrior;
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
    this.includeInRender = true;
    this.lineToPointPrev;
    this.lineToPointNext;
  }

  setIncludeInRender(yesOrNo) {
    this.includeInRender = yesOrNo;
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

  setLinePrev(aline) {
    this.lineToPointPrev = aline;
  }

  setLineNext(aline) {
    this.lineToPointNext = aline;
  }

  getPointPrev() {
    return this.pointPrev;
  }

  getPointNext() {
    return this.pointNext;
  }

  getLinePrev() {
    return this.lineToPointPrev;
  }

  getLineNext() {
    return this.lineToPointNext;
  }

  getAngleForSecurityGuard(guard) {
    return this.secuirtyGuardMap.get(guard);
  }

  getEdgePairOrderedByAngleToSecurityGuard(guard) {
    let vmain = createVector(
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

    let angleBetween1 = Math.abs(vmain.angleBetween(v1));
    let angleBetween2 = Math.abs(vmain.angleBetween(v2));
    if (angleBetween1 >= PI) angleBetween1 = angleBetween1 - PI;
    if (angleBetween2 >= PI) angleBetween2 = angleBetween2 - PI;

    if (angleBetween1 > angleBetween2)
      return [this.lineToPointPrev, this.lineToPointNext];
    else return [this.lineToPointNext, this.lineToPointPrev];
  }

  getIncludeInRender() {
    return this.includeInRender;
  }
}

class SecurityGuard {
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.SecurityGuardPoint = new Point(this.x, this.y, null);
    this.name = name;
    this.size = 15;
    this.sortedVertices = [];
    this.constructedPoints = [];
    this.root;
    this.lineToRightWall;
  }

  visibleVertices() {
    this.root = null;
    this.lineToRightWall = new Line(
      new Point(this.x, this.y, null),
      new Point(width, this.y, null)
    );
    let leftPrev;
    let leftNew;
    this.constructedPoints = [];

    this.initialIntersect();

    for (let i = 0; i < this.sortedVertices.length; i += 1) {
      // console.log(i);
      // preOrder(this.root);
      // console.log("done")
      let toRemove = [];
      let toAdd = [];
      this.lineToRightWall = new Line(
        new Point(this.x, this.y, null),
        new Point(
          this.sortedVertices[i].getX(),
          this.sortedVertices[i].getY(),
          null
        )
      );

      let crossProduct1 = p5.Vector.cross(
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
      ).dot(createVector(1, 1, 1));

      if (crossProduct1 > 0) toAdd.push(this.sortedVertices[i].getLinePrev());
      else if (crossProduct1 < 0)
        toRemove.push(this.sortedVertices[i].getLinePrev());

      let crossProduct2 = p5.Vector.cross(
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
      ).dot(createVector(1, 1, 1));

      if (crossProduct2 > 0) toAdd.push(this.sortedVertices[i].getLineNext());
      else if (crossProduct2 < 0)
        toRemove.push(this.sortedVertices[i].getLineNext());

      if (toAdd.length === 2) {
        leftPrev = getLeftmostLeaf(this.root).theKey;

        let temp =
          this.sortedVertices[i].getEdgePairOrderedByAngleToSecurityGuard(this);
        toAdd[0] = temp[0];
        toAdd[1] = temp[1];

        this.root = insertNode(
          this.root,
          toAdd[0],
          this.sortedVertices[i],
          this,
          toAdd
        );
        this.root = insertNode(
          this.root,
          toAdd[1],
          this.sortedVertices[i],
          this,
          toAdd
        );

        // console.log("adding", toAdd[0]);
        // console.log("adding", toAdd[1]);

        leftNew = getLeftmostLeaf(this.root).theKey;
        if (leftPrev !== leftNew) {
          this.constructVisibilityEdge(
            leftPrev,
            this.sortedVertices[i],
            "add2"
          );
        }
      } else if (toAdd.length === 1 && toRemove.length === 1) {
        leftPrev = getLeftmostLeaf(this.root).theKey;
        // console.log("updating", toRemove[0]);
        let toUpdate = searchAVLForNode(
          this.root,
          toRemove[0],
          false,
          this.sortedVertices[i],
          this
        );

        if (toUpdate === null) {
          console.log(i);
          console.alert();
        } else toUpdate.theKey = toAdd[0];

        leftNew = getLeftmostLeaf(this.root).theKey;
        if (leftPrev !== leftNew) {
          if (toRemove[0] !== leftPrev) {
            console.log("Big error 1!");
            console.alert();
          }
          this.constructedPoints.push(this.sortedVertices[i]);
        }
      } else if (toRemove.length === 2) {
        leftPrev = getLeftmostLeaf(this.root).theKey;

        let temp =
          this.sortedVertices[i].getEdgePairOrderedByAngleToSecurityGuard(this);
        toRemove[0] = temp[0];
        toRemove[1] = temp[1];

        this.root = deleteNode(
          this.root,
          toRemove[1],
          this.sortedVertices[i],
          this,
          toRemove
        );

        this.root = deleteNode(
          this.root,
          toRemove[0],
          this.sortedVertices[i],
          this,
          toRemove
        );

        // console.log("removing", toRemove[0]);
        // console.log("removing", toRemove[1]);

        leftNew = getLeftmostLeaf(this.root).theKey;
        if (leftPrev !== leftNew) {
          this.constructVisibilityEdge(
            leftNew,
            this.sortedVertices[i],
            "remove2"
          );
        }
      } else if (toAdd.length === 1) {
        leftPrev = getLeftmostLeaf(this.root).theKey;
        this.root = insertNode(
          this.root,
          toAdd[0],
          this.sortedVertices[i],
          this,
          [null, null]
        );

        // console.log("adding", toAdd[0]);

        leftNew = getLeftmostLeaf(this.root).theKey;
        if (leftPrev !== leftNew) {
        }
      } else if (toRemove.length === 1) {
        leftPrev = getLeftmostLeaf(this.root).theKey;

        this.root = deleteNode(
          this.root,
          toRemove[0],
          this.sortedVertices[i],
          this,
          [null, null]
        );

        leftNew = getLeftmostLeaf(this.root).theKey;
        // console.log("removing", toRemove[0]);

        if (leftPrev !== leftNew) {
        }
      }
    }
  }

  lineSideToInsert(v_i, edge, other) {
    if (edge === null) return "DNE";
    let guardtov_i = new Line(new Point(this.x, this.y, null), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) {
      if (edge === other[0]) return "away";
      else if (edge === other[1]) return "toward";
      else return "away";
    }
    return "toward";
  }

  lineSideToDelete(v_i, edge, other, edgeToDelete) {
    if (edge === edgeToDelete) {
      return "found";
    }
    let guardtov_i = new Line(new Point(this.x, this.y, null), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) {
      if (edge === other[0]) return "away";
      else if (edge === other[1]) return "toward";
      else return "away";
    }
    return "toward";
  }

  lineSideToSearch(v_i, edge) {
    let guardtov_i = new Line(new Point(this.x, this.y, null), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) return "away";
    return "toward";
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
    let theGuard = this;
    this.sortedVertices.sort(function (a, b) {
      return (
        a.getAngleForSecurityGuard(name) - b.getAngleForSecurityGuard(name) ||
        distanceBetweenTwoPoints(
          new Point(theGuard.getX(), theGuard.getY(), null),
          a
        ) -
          distanceBetweenTwoPoints(
            new Point(theGuard.getX(), theGuard.getY(), null),
            b
          )
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

  getAngleFromLinetoRightWall(edge) {
    if (edge.getPoint1().getX() === edge.getPoint2().getX()) return PI / 2;
    let angle = Math.atan(
      (edge.getPoint1().getY() - edge.getPoint2().getY()) /
        (edge.getPoint1().getX() - edge.getPoint2().getX())
    );
    if (angle < 0) angle = angle + PI;
    return angle;
  }

  initialIntersect() {
    // Add all edges intersecting lineToRightWall to the AVL Tree in order
    // of intersection, first being closest edge to security guard. Intersection
    // does not mean colinear edges with the lineToRightWall. Intersection does
    // not count endpoints, except when the edge goes below the lineToRightWall.
    // If it goes above then does not count.
    let initialIntersectEdges = [];
    for (let shape of allShapes) {
      for (let edge of shape.getEdges()) {
        if (checkIfIntersect(this.lineToRightWall, edge)) {
          if (edge.getPoint1().getAngleForSecurityGuard(this.name) === 0) {
            let crossProductPoint1 = p5.Vector.cross(
              createVector(
                edge.getPoint1().getX() - this.getX(),
                -(edge.getPoint1().getY() - this.getY()),
                0
              ),
              createVector(
                edge.getPoint2().getX() - edge.getPoint1().getX(),
                -(edge.getPoint2().getY() - edge.getPoint1().getY()),
                0
              )
            ).dot(createVector(1, 1, 1));

            if (crossProductPoint1 >= 0) continue;
          }
          if (edge.getPoint2().getAngleForSecurityGuard(this.name) === 0) {
            let crossProductPoint2 = p5.Vector.cross(
              createVector(
                edge.getPoint2().getX() - this.getX(),
                -(edge.getPoint2().getY() - this.getY()),
                0
              ),
              createVector(
                edge.getPoint1().getX() - edge.getPoint2().getX(),
                -(edge.getPoint1().getY() - edge.getPoint2().getY()),
                0
              )
            ).dot(createVector(1, 1, 1));

            if (crossProductPoint2 >= 0) continue;
          }
          let intersectionPoint = findIntersection(this.lineToRightWall, edge);
          let distanceFromIntersectiontoGuard = distanceBetweenTwoPoints(
            this.SecurityGuardPoint,
            intersectionPoint
          );
          edge.setPositionPrior(
            Math.round(distanceFromIntersectiontoGuard * 1000) / 1000
          );
          initialIntersectEdges.push(edge);
        }
      }
    }
    // sort edges closest intersection to farthest intersection. If tie, use angle to figure
    // out which edge is intersected first
    let guard = this;
    initialIntersectEdges.sort(function (a, b) {
      return (
        a.getPositionPrior() - b.getPositionPrior() ||
        guard.getAngleFromLinetoRightWall(b) -
          guard.getAngleFromLinetoRightWall(a)
      );
    });
    for (let i = 0; i < initialIntersectEdges.length; i += 1) {
      initialIntersectEdges[i].setPosition(i);
      this.root = insertNodeInitialIntersect(
        this.root,
        initialIntersectEdges[i]
      );
    }
  }

  constructVisibilityEdge(edge, v_i, add2OrRemove2) {
    let vectorTov_i = createVector(
      v_i.getX() - this.x,
      -(v_i.getY() - this.y),
      0
    );
    let vectorTov_iNormalized = p5.Vector.normalize(vectorTov_i);
    let canvasWidth =
      document.documentElement.clientWidth - getScrollBarWidth();
    let canvasHeight = document.documentElement.clientHeight;
    let maxDistance = ceil(Math.sqrt(canvasWidth ** 2 + canvasHeight ** 2));
    let lineFromSecurityGuardTov_iAndMore = new Line(
      new Point(this.x, this.y, null),
      new Point(
        v_i.getX() + vectorTov_iNormalized.x * maxDistance,
        v_i.getY() - vectorTov_iNormalized.y * maxDistance,
        null
      )
    );

    if (checkIfIntersect(lineFromSecurityGuardTov_iAndMore, edge) === true) {
      let intersectionPoint = findIntersection(
        lineFromSecurityGuardTov_iAndMore,
        edge
      );
      if (add2OrRemove2 === "add2")
        this.constructedPoints.push(intersectionPoint, v_i);
      else if (add2OrRemove2 === "remove2")
        this.constructedPoints.push(v_i, intersectionPoint);
    }
  }

  setX(x) {
    this.x = x;
    this.SecurityGuardPoint.setX(x);
  }

  setY(y) {
    this.y = y;
    this.SecurityGuardPoint.setY(y);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getConstructedPoints() {
    return this.constructedPoints;
  }

  getName() {
    return this.name;
  }
}
