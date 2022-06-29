class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
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

  getPoint() {
    return this;
  }
}

class ShapePoint extends Point {
  constructor(x, y, parentShape) {
    super(x, y);
    this.pointPrev = null;
    this.pointNext = null;
    this.parentShape = parentShape;
    this.lineToPointPrev;
    this.lineToPointNext;
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
}

class SecurityGuard extends Point {
  constructor(x, y, name) {
    super(x, y);
    this.name = name;
    this.size = 15;
    this.sortedVertices = [];
    this.constructedPoints = [];
    this.root;
    this.sweepLine;
    this.lineToRightWall = new Line(this.getPoint(), new Point(width, this.y));
    this.isovist = new Isovist();
  }
  initialIntersect() {
    // Add all edges intersecting lineToRightWall to the AVL Tree in order
    // of intersection, first being closest edge to security guard. Intersection
    // does not mean colinear edges with the lineToRightWall. Intersection does
    // not count endpoints, except when the edge goes below the lineToRightWall.
    // If it goes above then does not count.
    let initialIntersectEdges = [];
    this.root = null;
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
          let distanceFromIntersectiontoGuard = distanceBetweenTwoPointsRounded(
            this.getPoint(),
            intersectionPoint,
            ROUND_FACTOR
          );
          edge.setPositionPrior(distanceFromIntersectiontoGuard);
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
    return initialIntersectEdges;
  }

  visibleVertices() {
    this.sweepLine = new Line(
      new Point(this.x, this.y),
      new Point(width, this.y)
    );
    let leftPrev;
    let leftNew;
    this.constructedPoints = [];
    this.isovist = new Isovist();
    let toRemove = [];
    let toAdd = [];
    let currentlyOnSelfIntersectionPoint = false;

    this.initialIntersect();

    for (let i = 0; i < this.sortedVertices.length; i += 1) {
      // console.log(i);
      // preOrder(this.root);
      // console.log("done");
      this.sweepLine = new Line(
        new Point(this.x, this.y),
        new Point(this.sortedVertices[i].getX(), this.sortedVertices[i].getY())
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

      if (this.sortedVertices[i].getNotSelfIntersect() === false) {
        if (toAdd.length + toRemove.length !== 4) continue;
        else currentlyOnSelfIntersectionPoint = true;
      }

      if (toRemove.length === 2) {
        leftPrev = getLeftmostLeaf(this.root).theKey;
        let temp = this.sortedVertices[
          i
        ].getEdgePairOrderedByAngleToSecurityGuardPointerless(
          this,
          toRemove[0],
          toRemove[1],
          "toRemove"
        );

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
        if (
          leftPrev !== leftNew &&
          currentlyOnSelfIntersectionPoint === false
        ) {
          this.constructVisibilityEdge(
            leftNew,
            this.sortedVertices[i],
            "remove2"
          );
        } else if (
          leftPrev !== leftNew &&
          currentlyOnSelfIntersectionPoint === true
        )
          this.constructedPoints.push(
            new IsovistPoint(
              this.sortedVertices[i].getX(),
              this.sortedVertices[i].getY(),
              this.sortedVertices[i].getParentShape(),
              this.sortedVertices[i].getAngleForSecurityGuard(this.name)
            )
          );
      }
      if (toAdd.length === 2) {
        leftPrev = getLeftmostLeaf(this.root).theKey;
        let temp = this.sortedVertices[
          i
        ].getEdgePairOrderedByAngleToSecurityGuardPointerless(
          this,
          toAdd[0],
          toAdd[1],
          "toAdd"
        );

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
        if (
          leftPrev !== leftNew &&
          currentlyOnSelfIntersectionPoint === false
        ) {
          this.constructVisibilityEdge(
            leftPrev,
            this.sortedVertices[i],
            "add2"
          );
        } else if (
          leftPrev !== leftNew &&
          currentlyOnSelfIntersectionPoint === true
        )
          this.constructedPoints.push(
            new IsovistPoint(
              this.sortedVertices[i].getX(),
              this.sortedVertices[i].getY(),
              this.sortedVertices[i].getParentShape(),
              this.sortedVertices[i].getAngleForSecurityGuard(this.name)
            )
          );
      }
      if (toAdd.length === 1 && toRemove.length === 1) {
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
          this.constructedPoints.push(
            new IsovistPoint(
              this.sortedVertices[i].getX(),
              this.sortedVertices[i].getY(),
              this.sortedVertices[i].getParentShape(),
              this.sortedVertices[i].getAngleForSecurityGuard(this.name)
            )
          );
        }
      }
      if (toAdd.length === 1 && toRemove.length === 0) {
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
      }
      if (toRemove.length === 1 && toAdd.length === 0) {
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

      toRemove = [];
      toAdd = [];
      if (currentlyOnSelfIntersectionPoint === true) {
        currentlyOnSelfIntersectionPoint = false;
      }
    }

    this.isovist.setVerticesLinkedList(this.constructedPoints);
    this.isovist.setEdges();
  }

  lineSideToInsert(v_i, edge, other, edgeToInsert) {
    if (edge === null) return "DNE";
    let guardtov_i = new Line(new Point(this.x, this.y), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) {
      if (other.includes(edge)) {
        if (other.indexOf(edge) < other.indexOf(edgeToInsert)) return "away";
        else if (other.indexOf(edge) > other.indexOf(edgeToInsert))
          return "toward";
      } else return "away";
    }
    return "toward";
  }

  lineSideToDelete(v_i, edge, other, edgeToDelete) {
    if (edge === edgeToDelete) {
      return "found";
    }
    let guardtov_i = new Line(new Point(this.x, this.y), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) {
      if (other.includes(edge)) {
        if (other.indexOf(edge) < other.indexOf(edgeToDelete)) return "away";
        else if (other.indexOf(edge) > other.indexOf(edgeToDelete))
          return "toward";
      } else return "away";
    }
    return "toward";
  }

  lineSideToSearch(v_i, edge) {
    let guardtov_i = new Line(new Point(this.x, this.y), v_i);
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
          new Point(theGuard.getX(), theGuard.getY()),
          a
        ) -
          distanceBetweenTwoPoints(
            new Point(theGuard.getX(), theGuard.getY()),
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
      new Point(this.x, this.y),
      new Point(
        v_i.getX() + vectorTov_iNormalized.x * maxDistance,
        v_i.getY() - vectorTov_iNormalized.y * maxDistance
      )
    );

    if (checkIfIntersect(lineFromSecurityGuardTov_iAndMore, edge) === true) {
      let intersectionPoint = findIntersection(
        lineFromSecurityGuardTov_iAndMore,
        edge
      );
      if (add2OrRemove2 === "add2")
        this.constructedPoints.push(
          new IsovistPoint(
            intersectionPoint.getX(),
            intersectionPoint.getY(),
            null,
            v_i.getAngleForSecurityGuard(this.name)
          ),
          new IsovistPoint(
            v_i.getX(),
            v_i.getY(),
            v_i.getParentShape(),
            v_i.getAngleForSecurityGuard(this.name)
          )
        );
      else if (add2OrRemove2 === "remove2")
        this.constructedPoints.push(
          new IsovistPoint(
            v_i.getX(),
            v_i.getY(),
            v_i.getParentShape(),
            v_i.getAngleForSecurityGuard(this.name)
          ),
          new IsovistPoint(
            intersectionPoint.getX(),
            intersectionPoint.getY(),
            null,
            v_i.getAngleForSecurityGuard(this.name)
          )
        );
    }
  }

  setY(y) {
    this.y = y;
    // since this must be updated, the parent class's method is overidden
    this.lineToRightWall.getPoint2().setY(y);
  }

  getConstructedPoints() {
    return this.constructedPoints;
  }

  getName() {
    return this.name;
  }

  getIsovist() {
    return this.isovist;
  }
}

class ObstaclePoint extends ShapePoint {
  constructor(x, y, parentShape) {
    super(x, y, parentShape);
    this.secuirtyGuardMap = new Map();
    this.notSelfIntersect = true;
  }

  setNotSelfIntersect(yesOrNo) {
    this.notSelfIntersect = yesOrNo;
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

  getAngleForSecurityGuard(guard) {
    return this.secuirtyGuardMap.get(guard);
  }

  getEdgePairOrderedByAngleToSecurityGuardPointerless(
    guard,
    edge1,
    edge2,
    state
  ) {
    let vmain = createVector(
      this.getX() - guard.getX(),
      -(this.getY() - guard.getY()),
      0
    );

    let v1 = createVector(
      edge1.getPoint1().getX() - edge1.getPoint2().getX(),
      -(edge1.getPoint1().getY() - edge1.getPoint2().getY()),
      0
    );

    let v2 = createVector(
      edge2.getPoint1().getX() - edge2.getPoint2().getX(),
      -(edge2.getPoint1().getY() - edge2.getPoint2().getY()),
      0
    );

    let angleBetween1 = vmain.angleBetween(v1);
    let angleBetween2 = vmain.angleBetween(v2);

    if (state === "toAdd") {
      if (angleBetween1 > 0) angleBetween1 -= PI;
      if (angleBetween2 > 0) angleBetween2 -= PI;
    }

    if (state === "toRemove") {
      if (angleBetween1 < 0) angleBetween1 += PI;
      if (angleBetween2 < 0) angleBetween2 += PI;
    }

    angleBetween1 = PI - Math.abs(angleBetween1);
    angleBetween2 = PI - Math.abs(angleBetween2);
    if (angleBetween1 > angleBetween2) return [edge1, edge2];
    else return [edge2, edge1];
  }

  getNotSelfIntersect() {
    return this.notSelfIntersect;
  }
}

class IsovistPoint extends ShapePoint {
  constructor(x, y, parentShape, angle) {
    super(x, y, parentShape);
    this.secuirtyGuardMap = new Map();
    this.angle = angle;
  }

  getAngle() {
    return this.angle;
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

  getLength() {
    return distanceBetweenTwoPoints(this.point1, this.point2);
  }
}

class Shape {
  constructor(color) {
    this.vertexHead;
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

  getEdges() {
    return this.edges;
  }

  getColor() {
    return this.color;
  }

  getVertexHead() {
    return this.vertexHead;
  }
}

class Obstacle extends Shape {
  constructor(color) {
    super(color);
    this.verticesDistancetoMousePress = new Map();
  }

  setVerticesDistancetoMousePress(theVertex, coordinate) {
    this.verticesDistancetoMousePress.set(theVertex, coordinate);
  }

  getVerticesDistancetoMousePress(theVertex) {
    return this.verticesDistancetoMousePress.get(theVertex);
  }
}

class Isovist extends Shape {
  constructor() {
    super();
  }

  drawIsovist(guard) {
    push();
    fill(guard.getName()[0], guard.getName()[1], guard.getName()[2], 100);
    beginShape();
    let aVertex = this.vertexHead;
    do {
      vertex(aVertex.getX(), aVertex.getY());
      aVertex = aVertex.getPointNext();
    } while (aVertex !== this.vertexHead);
    endShape(CLOSE);
    pop();
  }
}

class AsanoVisualization {
  constructor(guard) {
    this.visualizngGuard = guard;
    this.state = "not started";
    this.initLineP2 = new Point(guard.getX(), guard.getY());
    this.initLine = new Line(guard.getPoint(), this.initLineP2);
    this.sweepLine;
    this.initlineAnimationHelper = true;
    this.sweepAnimationHelper = false;
    this.speed = 3;
    this.initialIntersectEdges = this.visualizngGuard.initialIntersect();
    this.lineThickness = 7;
    this.flicks = 0;
    this.visualizngGuard.visibleVertices();
    this.isovist = guard.getIsovist();
    this.angle = this.isovist.getVertexHead().getAngle();
    console.log(this.angle);
  }

  animateMasterMethod() {
    if (this.state === "drawing") {
      this.initLineAnimation();
      this.sweepAnimation();
    }
  }

  initLineAnimation() {
    if (this.initlineAnimationHelper === false) return;

    if (
      this.initLine.getLength() <
      this.initialIntersectEdges[0].getPositionPrior()
    ) {
      drawLine(this.initLine, "white", 2);
      this.initLineP2.setX(this.initLineP2.getX() + this.speed);
    } else {
      drawLine(
        this.initialIntersectEdges[0],
        this.visualizngGuard.getName(),
        zigZag(this.flicks, 0.5) * this.lineThickness
      );
      this.initLineP2.setX(
        this.visualizngGuard.getX() +
          this.initialIntersectEdges[0].getPositionPrior()
      );
      drawLine(this.initLine, "white", 2);
      this.flicks += 0.05;
      if (this.flicks >= 4) {
        this.initlineAnimationHelper = false;
        this.sweepAnimationHelper = true;
        this.sweepLine = new Line(
          this.visualizngGuard.getPoint(),
          new Point(this.initLineP2.getX(), this.initLineP2.getY())
        );
      }
    }
  }

  sweepAnimation() {
    if (this.sweepAnimationHelper === false) return;
    this.angle += 0.005;
    this.sweepLine
      .getPoint2()
      .setX(
        this.visualizngGuard.getX() +
          cos(this.angle) * this.initLine.getLength()
      );
    this.sweepLine
      .getPoint2()
      .setY(
        this.visualizngGuard.getY() -
          sin(this.angle) * this.initLine.getLength()
      );
    drawLine(this.sweepLine, "white", 2);
  }

  resetAll() {
    this.state = "not started";
    this.initLineP2 = new Point(
      this.visualizngGuard.getX(),
      this.visualizngGuard.getY()
    );
    this.initLine = new Line(this.visualizngGuard.getPoint(), this.initLineP2);
    this.sweepLine;
    this.initlineAnimationHelper = true;
    this.sweepAnimationHelper = false;
    this.speed = 3;
    this.initialIntersectEdges = this.visualizngGuard.initialIntersect();
    this.lineThickness = 7;
    this.flicks = 0;
    this.visualizngGuard.visibleVertices();
    this.isovist = guard.getIsovist();
    this.angle = this.isovist.getVertexHead().getAngle();
  }

  setState(state) {
    this.state = state;
  }

  getSecurityGuard() {
    return this.visualizngGuard;
  }
}
