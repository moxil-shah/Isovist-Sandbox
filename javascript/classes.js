/* title: Isovist Sandbox
 * author: Moxil Shah
 * Date Created: May 1, 2022
 */

////// file contains all the user-defined classes I use //////

// Represent a point
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

  getArrayForm() {
    return [this.x, this.y];
  }

  getArrayFormRounded() {
    return [
      Math.round(this.x * ROUND_FACTOR) / ROUND_FACTOR,
      Math.round(this.y * ROUND_FACTOR) / ROUND_FACTOR,
    ];
  }
}

// Represent a point that belongs to a shape
class ShapePoint extends Point {
  constructor(x, y, parentShape) {
    super(x, y);
    this.pointPrev = null;
    this.pointNext = null;
    this.parentShape = parentShape;
    this.lineToPointPrev;
    this.lineToPointNext;
  }

  setParentShape(shape) {
    this.parentShape = shape;
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

  getParentShape() {
    return this.parentShape;
  }
}

// Represent a point that is a security guard
class SecurityGuard extends Point {
  constructor(x, y, name) {
    super(x, y);
    this.name = name;
    this.size = 15;
    this.sortedVertices = [];
    this.constructedPoints = [];
    this.root;
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
          edge.setDistanceFromIntersectToGuard(distanceFromIntersectiontoGuard);
          if (
            checkIfPointIsOutsideGameShape(
              edge.getPoint1().getArrayFormRounded()
            ) === true &&
            checkIfPointIsOutsideGameShape(
              edge.getPoint2().getArrayFormRounded()
            ) === true
          )
            continue;
          initialIntersectEdges.push(edge);
        }
      }
    }
    // sort edges closest intersection to farthest intersection. If tie, use angle to figure
    // out which edge is intersected first
    let guard = this;
    initialIntersectEdges.sort(function (a, b) {
      return (
        a.getDistanceFromIntersectToGuard() -
          b.getDistanceFromIntersectToGuard() ||
        guard.getAngleFromLinetoRightWall(b) -
          guard.getAngleFromLinetoRightWall(a)
      );
    });

    // edges that belong the gameShape are inserted last.
    for (let i = 0; i < initialIntersectEdges.length - 1; i += 1) {
      if (
        Math.round(
          guard.getAngleFromLinetoRightWall(initialIntersectEdges[i]) *
            ROUND_FACTOR
        ) /
          ROUND_FACTOR ===
          Math.round(
            guard.getAngleFromLinetoRightWall(initialIntersectEdges[i + 1]) *
              ROUND_FACTOR
          ) /
            ROUND_FACTOR &&
        initialIntersectEdges[i].getParentShape() === gameShape
      ) {
        let temp = initialIntersectEdges[i];
        initialIntersectEdges[i] = initialIntersectEdges[i + 1];
        initialIntersectEdges[i + 1] = temp;
      }
    }

    // insert the inital intersect edges into the AVL tree based on order of intersection
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
    let leftPrev;
    let leftNew;
    this.constructedPoints = [];
    this.isovist = new Isovist();
    let toRemove = [];
    let toAdd = [];
    let currentlyOnSelfIntersectionPoint = false;
    this.initialIntersect();
    let goNextHowManyTimes = 0;
    let crossProductZero = new Set();

    // console.log(this.sortedVertices.length);
    for (let i = 0; i < this.sortedVertices.length; i += 1) {
      // skip points that are outside the gameShape
      if (
        this.sortedVertices[i].getParentShape() !== gameShape &&
        checkIfPointIsOutsideGameShape(
          this.sortedVertices[i].getArrayFormRounded()
        )
      ) {
        continue;
      }

      // console.log(i);
      // InOrder(this.root);
      // console.log("done");

      // every point has 2 edges it connects.
      // add the edge to the counter-clockwise side of the sweepline and
      // remove that edge that lies to the clockwise side of the sweepline.
      // I do this using cross products
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
      else if (crossProduct1 === 0) {
        if (crossProductZero.has(this.sortedVertices[i].getLinePrev())) {
          crossProductZero.delete(this.sortedVertices[i].getLinePrev());
          toRemove.push(this.sortedVertices[i].getLinePrev());
        } else {
          crossProductZero.add(this.sortedVertices[i].getLinePrev());
          toAdd.push(this.sortedVertices[i].getLinePrev());
        }
      }

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
      else if (crossProduct2 === 0) {
        if (crossProductZero.has(this.sortedVertices[i].getLineNext())) {
          crossProductZero.delete(this.sortedVertices[i].getLineNext());
          toRemove.push(this.sortedVertices[i].getLineNext());
        } else {
          crossProductZero.add(this.sortedVertices[i].getLineNext());
          toAdd.push(this.sortedVertices[i].getLineNext());
        }
      }
    //  this deals with overlapping points
      if (
        i !== this.sortedVertices.length - 1 &&
        checkIfTwoPointsOverlap(
          this.sortedVertices[i],
          this.sortedVertices[i + 1]
        )
      ) {
        goNextHowManyTimes += 1;
      }

      if (toAdd.length + toRemove.length !== (goNextHowManyTimes + 1) * 2) {
        continue;
      } else if (toAdd.length + toRemove.length > 2) {
        currentlyOnSelfIntersectionPoint = true;
      }

      // add one edge and remove another. so search for edge to delete and replace 
      // it with the edge to add
      if (toAdd.length === 1 && toRemove.length === 1) {
        leftPrev = getLeftmostLeaf(this.root).theKey;
        // console.log("updating", toRemove[0]);
        let toUpdate = searchAVLForNode(
          this.root,
          toRemove[0],
          this.sortedVertices[i],
          this
        );

        if (toUpdate === null) {
          // console.log(i);
          // InOrder(this.root);
          ////// I AM NOT SMART ENOUGH TO FIGURE OUT THIS BUG ////////////
          ////// IF IT HAPPENS (IT MIGHT) SO I JUST DON'T DRAW ISOVIST ////////////
          return;
        } else toUpdate.theKey = toAdd[0];

        leftNew = getLeftmostLeaf(this.root).theKey;
        if (leftPrev !== leftNew) {
          if (toRemove[0] !== leftPrev) {
            // console.log("Big error 1!");
            ////// I AM NOT SMART ENOUGH TO FIGURE OUT THIS BUG ////////////
            ////// IF IT HAPPENS (I NEVER SAW IT PERSONALLY) SO I JUST DON'T DRAW ISOVIST ////////////
            return;
          }
          this.constructedPoints.push(
            new IsovistPoint(
              this.sortedVertices[i].getX(),
              this.sortedVertices[i].getY(),
              this.sortedVertices[i].getParentShape(),
              this.sortedVertices[i].getAngleForSecurityGuard(this.name),
              null
            )
          );
        }
      } else {

        // delete more than 1 edge. could be 2 to 4 to delete
        // delete by order of angle to the sweep line
        if (toRemove.length >= 1) {
          if (this.root === null) leftPrev = null;
          else leftPrev = getLeftmostLeaf(this.root).theKey;
          let toRemoveOrdered = this.sortedVertices[
            i
          ].getEdgePairOrderedByAngleToSecurityGuardPointerless(
            this,
            toRemove,
            "toRemove"
          );
          for (let j = 0; j < toRemoveOrdered.length; j += 1) {
            toRemove[j] = toRemoveOrdered[j];
            // console.log("removing", toRemove[j]);

            this.root = deleteNode(
              this.root,
              toRemoveOrdered[j],
              this.sortedVertices[i],
              this,
              toRemoveOrdered
            );
          }
          if (this.root === null) leftNew = null;
          else leftNew = getLeftmostLeaf(this.root).theKey;
          if (
            (leftPrev !== leftNew &&
              currentlyOnSelfIntersectionPoint === false) ||
            (leftPrev !== leftNew &&
              currentlyOnSelfIntersectionPoint === true &&
              this.constructedPoints.length > 0 &&
              checkIfTwoPointsOverlap(
                this.constructedPoints[this.constructedPoints.length - 1],
                this.sortedVertices[i]
              ) === false &&
              toRemove.length === (goNextHowManyTimes + 1) * 2) ||
            (leftPrev !== leftNew &&
              currentlyOnSelfIntersectionPoint === true &&
              this.constructedPoints.length === 0 &&
              toRemove.length === (goNextHowManyTimes + 1) * 2)
          ) {
            this.constructVisibilityEdge(
              leftNew,
              this.sortedVertices[i],
              "remove2"
            );
          } else if (
            (leftPrev !== leftNew &&
              currentlyOnSelfIntersectionPoint === true &&
              this.constructedPoints.length > 0 &&
              checkIfTwoPointsOverlap(
                this.constructedPoints[this.constructedPoints.length - 1],
                this.sortedVertices[i]
              ) === false &&
              toRemove.length < (goNextHowManyTimes + 1) * 2) ||
            (leftPrev !== leftNew &&
              currentlyOnSelfIntersectionPoint === true &&
              this.constructedPoints.length === 0 &&
              toRemove.length < (goNextHowManyTimes + 1) * 2)
          ) {
            this.constructedPoints.push(
              new IsovistPoint(
                this.sortedVertices[i].getX(),
                this.sortedVertices[i].getY(),
                this.sortedVertices[i].getParentShape(),
                this.sortedVertices[i].getAngleForSecurityGuard(this.name),
                null
              )
            );
          }
        }
        // add more than 1 edge. could be 2 to 4 to delete
        // add by order of angle to the sweep line
        if (toAdd.length >= 1) {
          if (this.root === null) leftPrev = null;
          else leftPrev = getLeftmostLeaf(this.root).theKey;
          let toAddOrdered = this.sortedVertices[
            i
          ].getEdgePairOrderedByAngleToSecurityGuardPointerless(
            this,
            toAdd,
            "toAdd"
          );

          for (let j = 0; j < toAddOrdered.length; j += 1) {
            toAdd[j] = toAddOrdered[j];

            // console.log("adding", toAdd[j]);

            this.root = insertNode(
              this.root,
              toAddOrdered[j],
              this.sortedVertices[i],
              this,
              toAddOrdered
            );
          }

          if (this.root === null) leftNew = null;
          else leftNew = getLeftmostLeaf(this.root).theKey;

          if (
            (leftPrev !== leftNew &&
              currentlyOnSelfIntersectionPoint === false) ||
            (leftPrev !== leftNew &&
              currentlyOnSelfIntersectionPoint === true &&
              this.constructedPoints.length > 0 &&
              checkIfTwoPointsOverlap(
                this.constructedPoints[this.constructedPoints.length - 1],
                this.sortedVertices[i]
              ) === false &&
              toAdd.length === (goNextHowManyTimes + 1) * 2) ||
            (leftPrev !== leftNew &&
              currentlyOnSelfIntersectionPoint === true &&
              this.constructedPoints.length === 0 &&
              toAdd.length === (goNextHowManyTimes + 1) * 2)
          ) {
            this.constructVisibilityEdge(
              leftPrev,
              this.sortedVertices[i],
              "add2"
            );
          } else if (
            (leftPrev !== leftNew &&
              currentlyOnSelfIntersectionPoint === true &&
              this.constructedPoints.length > 0 &&
              checkIfTwoPointsOverlap(
                this.constructedPoints[this.constructedPoints.length - 1],
                this.sortedVertices[i]
              ) === false &&
              toAdd.length < (goNextHowManyTimes + 1) * 2) ||
            (leftPrev !== leftNew &&
              currentlyOnSelfIntersectionPoint === true &&
              this.constructedPoints.length === 0 &&
              toAdd.length < (goNextHowManyTimes + 1) * 2)
          ) {
            this.constructedPoints.push(
              new IsovistPoint(
                this.sortedVertices[i].getX(),
                this.sortedVertices[i].getY(),
                this.sortedVertices[i].getParentShape(),
                this.sortedVertices[i].getAngleForSecurityGuard(this.name),
                null
              )
            );
          }
        }
      }
      toRemove = [];
      toAdd = [];
      if (currentlyOnSelfIntersectionPoint === true) {
        currentlyOnSelfIntersectionPoint = false;
        goNextHowManyTimes = 0;
      }
    }

    // set the isovist shape so easy to draw later
    this.isovist.setVerticesLinkedList(this.constructedPoints);
  }

  // lineSideToInsert(v_i, edge, other, edgeToInsert) {
  //   if (edge === null) return "DNE";
  //   let guardtov_i = new Line(new Point(this.x, this.y), v_i);
  //   if (checkIfIntersect(guardtov_i, edge) === true) {
  //     if (other.includes(edge)) {
  //       if (other.indexOf(edge) < other.indexOf(edgeToInsert)) return "away";
  //       else if (other.indexOf(edge) > other.indexOf(edgeToInsert))
  //         return "toward";
  //     } else return "away";
  //   }
  //   return "toward";
  // }

  // lineSideToDelete(v_i, edge, other, edgeToDelete) {
  //   if (edge === edgeToDelete) {
  //     return "found";
  //   }
  //   let guardtov_i = new Line(new Point(this.x, this.y), v_i);
  //   if (checkIfIntersect(guardtov_i, edge) === true) {
  //     if (other.includes(edge)) {
  //       if (other.indexOf(edge) < other.indexOf(edgeToDelete)) return "away";
  //       else if (other.indexOf(edge) > other.indexOf(edgeToDelete))
  //         return "toward";
  //     } else return "away";
  //   }
  //   return "toward";
  // }

  // lineSideToSearch(v_i, edge, edgeToFind) {
  //   let guardtov_i = new Line(new Point(this.x, this.y), v_i);
  //   if (checkIfIntersect(guardtov_i, edge) === true) {
  //     return "away";
  //   }
  //   return "toward";
  // }

  lineSideToInsert(v_i, edge, other, edgeToInsert) {
    if (edge === null) return "DNE";
    if (edgeToInsert.getParentShape() === gameShape) return "away";
    let guardtov_i = new Line(new Point(this.x, this.y), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) {
      if (other.includes(edge)) {
        if (other.indexOf(edge) < other.indexOf(edgeToInsert)) return "away";
        else if (other.indexOf(edge) > other.indexOf(edgeToInsert))
          return "toward";
      } else if (edge.getParentShape() === gameShape) {
        let v0 = createVector(
          edge.getPoint2().getX() - edge.getPoint1().getX(),
          -(edge.getPoint2().getY() - edge.getPoint1().getY()),
          0
        );
        let v1 = createVector(
          edgeToInsert.getPoint2().getX() - edgeToInsert.getPoint1().getX(),
          -(edgeToInsert.getPoint2().getY() - edgeToInsert.getPoint1().getY()),
          0
        );
        if (v0.angleBetween(v1) === 0 || v0.angleBetween(v1) === PI) {
          return "toward";
        }
      } else return "away";
    }
    return "toward";
  }

  lineSideToDelete(v_i, edge, other, edgeToDelete) {
    if (edge === edgeToDelete) {
      return "found";
    }
    if (edgeToDelete.getParentShape() === gameShape) return "away";
    let guardtov_i = new Line(new Point(this.x, this.y), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) {
      if (other.includes(edge)) {
        if (other.indexOf(edge) < other.indexOf(edgeToDelete)) return "away";
        else if (other.indexOf(edge) > other.indexOf(edgeToDelete))
          return "toward";
      } else if (edge.getParentShape() === gameShape) {
        let v0 = createVector(
          edge.getPoint2().getX() - edge.getPoint1().getX(),
          -(edge.getPoint2().getY() - edge.getPoint1().getY()),
          0
        );
        let v1 = createVector(
          edgeToDelete.getPoint2().getX() - edgeToDelete.getPoint1().getX(),
          -(edgeToDelete.getPoint2().getY() - edgeToDelete.getPoint1().getY()),
          0
        );
        if (v0.angleBetween(v1) === 0 || v0.angleBetween(v1) === PI) {
          return "toward";
        }
      } else return "away";
    }
    return "toward";
  }

  lineSideToSearch(v_i, edge, edgeToFind) {
    if (edgeToFind.getParentShape() === gameShape) return "away";
    let guardtov_i = new Line(new Point(this.x, this.y), v_i);
    if (checkIfIntersect(guardtov_i, edge) === true) {
      if (edge.getParentShape() === gameShape) {
        let v0 = createVector(
          edge.getPoint2().getX() - edge.getPoint1().getX(),
          -(edge.getPoint2().getY() - edge.getPoint1().getY()),
          0
        );
        let v1 = createVector(
          edgeToFind.getPoint2().getX() - edgeToFind.getPoint1().getX(),
          -(edgeToFind.getPoint2().getY() - edgeToFind.getPoint1().getY()),
          0
        );
        if (v0.angleBetween(v1) === 0 || v0.angleBetween(v1) === PI) {
          return "toward";
        }
      } else return "away";
    }
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
    let color = "white";
    if (this === guardDragged) color = "grey"; // if guard is dragged guard

    push();
    stroke(color);
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
    let canvasWidth = $(window).width();
    let canvasHeight = $(window).height();
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
            v_i.getAngleForSecurityGuard(this.name),
            "shrink into next"
          ),
          new IsovistPoint(
            v_i.getX(),
            v_i.getY(),
            v_i.getParentShape(),
            v_i.getAngleForSecurityGuard(this.name),
            null
          )
        );
      else if (add2OrRemove2 === "remove2")
        this.constructedPoints.push(
          new IsovistPoint(
            v_i.getX(),
            v_i.getY(),
            v_i.getParentShape(),
            v_i.getAngleForSecurityGuard(this.name),
            "grow into next"
          ),
          new IsovistPoint(
            intersectionPoint.getX(),
            intersectionPoint.getY(),
            null,
            v_i.getAngleForSecurityGuard(this.name),
            null
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

  getSize() {
    return this.size;
  }

  outsideGameShape() {
    return (
      this.x >= Math.round((width - 50) * ROUND_FACTOR) / ROUND_FACTOR ||
      this.x <= 50 ||
      this.y >= Math.round((height - 50) * ROUND_FACTOR) / ROUND_FACTOR ||
      this.y <= 50
    );
  }
}

// Represent a point that belongs to a shape that is an obstacle
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

  getEdgePairOrderedByAngleToSecurityGuardPointerless(guard, edges, state) {
    let vmain = createVector(
      this.getX() - guard.getX(),
      -(this.getY() - guard.getY()),
      0
    );
    let edgeAngleMap = new Map();

    for (let each of edges) {
      edgeAngleMap.set(
        each,
        vmain.angleBetween(
          createVector(
            each.getPoint1().getX() - each.getPoint2().getX(),
            -(each.getPoint1().getY() - each.getPoint2().getY()),
            0
          )
        )
      );
    }

    for (const eachKey of edgeAngleMap.keys()) {
      if (edgeAngleMap.get(eachKey) > 0 && state === "toAdd")
        edgeAngleMap.set(eachKey, edgeAngleMap.get(eachKey) - PI);
      else if (edgeAngleMap.get(eachKey) < 0 && state === "toRemove")
        edgeAngleMap.set(eachKey, edgeAngleMap.get(eachKey) + PI);
      edgeAngleMap.set(eachKey, PI - Math.abs(edgeAngleMap.get(eachKey)));
    }

    let edgesSorted = [];
    for (const eachEntry of edgeAngleMap.entries()) {
      edgesSorted.push(eachEntry);
    }
    edgesSorted.sort(function (a, b) {
      return b[1] - a[1];
    });

    for (let i = 0; i < edgesSorted.length - 1; i += 1) {
      if (
        Math.round(edgesSorted[i][1] * ROUND_FACTOR) / ROUND_FACTOR ===
          Math.round(edgesSorted[i + 1][1] * ROUND_FACTOR) / ROUND_FACTOR &&
        edgesSorted[i][0].getParentShape() === gameShape
      ) {
        let temp = edgesSorted[i];
        edgesSorted[i] = edgesSorted[i + 1];
        edgesSorted[i + 1] = temp;
      }
    }

    for (let i = 0; i < edgesSorted.length; i += 1)
      edgesSorted[i] = edgesSorted[i][0];

    return edgesSorted;
  }

  getNotSelfIntersect() {
    return this.notSelfIntersect;
  }
}

// Represent a point that belongs to a shape that is an isovist
class IsovistPoint extends ShapePoint {
  constructor(x, y, parentShape, angle, specialCase) {
    super(x, y, parentShape);
    this.secuirtyGuardMap = new Map();
    this.angle = angle;
    this.specialCase = specialCase;
  }

  getAngle() {
    return this.angle;
  }
}

// Represent a line
class Line {
  constructor(p1, p2) {
    this.point1 = p1;
    this.point2 = p2;
    this.position = null;
    this.distanceFromIntersectToGuard = null;
    this.parentShape = null;
  }

  setPosition(position) {
    this.position = position;
  }

  setDistanceFromIntersectToGuard(distanceFromIntersectToGuard) {
    this.distanceFromIntersectToGuard = distanceFromIntersectToGuard;
  }

  setPoint1(p1) {
    this.point1 = p1;
  }

  setPoint2(p2) {
    this.point2 = p2;
  }

  setParentShape(shape) {
    this.parentShape = shape;
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

  getDistanceFromIntersectToGuard() {
    return this.distanceFromIntersectToGuard;
  }

  getLength() {
    return distanceBetweenTwoPoints(this.point1, this.point2);
  }

  getParentShape() {
    return this.parentShape;
  }
}

// Represent a Shape
class Shape {
  constructor(color) {
    this.vertexHead;
    this.edges = new Set();
    this.color = color;
    this.pointsBackup;
  }

  setVerticesLinkedList(vertexArray) {
    if (vertexArray.length < 3) {
      // console.log("Big error 3");
      return;
    }
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
    this.setEdges();
  }

  setEdges() {
    this.edges = new Set();

    let currentVertex = this.vertexHead;

    do {
      let aLine = new Line(currentVertex, currentVertex.getPointNext());
      if (allShapes.size === 0) aLine.setParentShape(gameShape);
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

  setVertexHead(head) {
    this.vertexHead = head;
  }

  getVertexHead() {
    return this.vertexHead;
  }

  getPointsArray(brackets) {
    let pointsArray = [];
    let currentVertex = this.vertexHead;
    do {
      pointsArray.push([currentVertex.getX(), currentVertex.getY()]);
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== this.vertexHead);
    if (brackets) return [pointsArray];
    else return pointsArray;
  }

  drawShape(opacity, colorOveride) {
    push();
    if (colorOveride === false)
      fill(this.color[0], this.color[1], this.color[2], opacity);
    else fill(colorOveride[0], colorOveride[1], colorOveride[2], opacity);
    beginShape();
    let aVertex = this.vertexHead;
    do {
      vertex(aVertex.getX(), aVertex.getY());
      aVertex = aVertex.getPointNext();
    } while (aVertex !== this.vertexHead);
    endShape(CLOSE);
    pop();
  }

  setPointsBackup() {
    this.pointsBackup = this.getPointsArray(false);
  }

  getPointsBackup() {
    return this.pointsBackup;
  }
}

// Represent a Obstacle
class Obstacle extends Shape {
  constructor(color) {
    super(color);
    this.verticesDistancetoMousePress = new Map();
    this.onTop = new Set();
    this.onTopTemp = new Set();
    this.sharesGameShapeBorder = false;
  }

  setVerticesDistancetoMousePress(theVertex, coordinate) {
    this.verticesDistancetoMousePress.set(theVertex, coordinate);
  }

  getVerticesDistancetoMousePress(theVertex) {
    return this.verticesDistancetoMousePress.get(theVertex);
  }

  resetVerticesDistancetoMousePress() {
    this.verticesDistancetoMousePress = new Map();
  }

  setSharesGameShapeBorder(value) {
    this.sharesGameShapeBorder = value;
  }

  getSharesGameShapeBorder() {
    return this.sharesGameShapeBorder;
  }

  addOnTop(shape) {
    this.onTop.add(shape);
  }

  getOnTop() {
    return this.onTop;
  }

  clearOnTop() {
    this.onTop.clear();
  }

  deleteFromOnTop(shape) {
    this.onTop.delete(shape);
  }

  addOnTopTemp(shape) {
    this.onTopTemp.add(shape);
  }

  getOnTopTemp() {
    return this.onTopTemp;
  }

  clearOnTopTemp() {
    this.onTopTemp.clear();
  }

  deleteFromOnTopTemp(shape) {
    this.onTopTemp.delete(shape);
  }

  deleteOnTopTempFromOnTop() {
    for (let eachShape of this.onTopTemp) this.onTop.delete(eachShape);
  }
}

// Represent a Isovist. Each guard has one Isovist object.
class Isovist extends Shape {
  constructor() {
    super();
  }

  drawIsovist(guard, opacity, borderThickness) {
    if (this.vertexHead === undefined) return;
    push();
    if (borderThickness !== 0) {
      stroke(guard.getName()[0], guard.getName()[1], guard.getName()[2]);
      strokeWeight(borderThickness);
    } else noStroke();
    fill(guard.getName()[0], guard.getName()[1], guard.getName()[2], opacity);
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

// controls guardControlPanel
class AsanoVisualization {
  constructor(guard) {
    this.guard = guard;
    this.scrollBar = document.getElementById("customRange");
    this.sliderValue = document.getElementById("sliderValueGuardControlPanel");
    this.scrollBar.style.display = "block";
    this.sliderValue.style.display = "block";
    this.resetAll();
  }

  animateMasterMethod() {
    if (this.state === "drawing") {
      this.initLineAnimation();
      this.sweepAnimation();
      this.endAnimation();
    }
    if (this.state === "done") {
      this.guard.getIsovist().drawIsovist(this.guard, 100, this.lineThickness);
    }
    if (this.state === "slider") {
      this.scrollBarAnimation();
    }
  }

  initLineAnimation() {
    if (!this.initLineAnimationGo) return;

    if (
      this.initLine.getLength() <
        this.initialIntersectEdges[0].getDistanceFromIntersectToGuard() &&
      !this.initPointFlicksRoundingError
    ) {
      drawLine(this.initLine, "white", this.lineThickness);
      this.initLine
        .getPoint2()
        .setX(this.initLine.getPoint2().getX() + this.speed * deltaTime);
    } else {
      this.initPointFlicksRoundingError = true;
      this.initLine
        .getPoint2()
        .setX(
          this.guard.getX() +
            this.initialIntersectEdges[0].getDistanceFromIntersectToGuard()
        );
      drawLine(this.initLine, "white", this.lineThickness);

      push();
      strokeWeight(
        zigZag((this.initPointFlicks += deltaTime * 0.0025), 1) *
          this.guard.getSize()
      );
      stroke(
        this.guard.getName()[0],
        this.guard.getName()[1],
        this.guard.getName()[2]
      );
      point(
        this.isovist.getVertexHead().getX(),
        this.isovist.getVertexHead().getY()
      );
      pop();
      if (this.initPointFlicks >= this.initPointFlicksMax) {
        this.initLineAnimationGo = false;
        this.sweepLineAnimationGo = true;
        this.initPointFlicks = 1;
      }
    }
  }

  sweepAnimation() {
    if (!this.sweepLineAnimationGo) return;

    if (
      this.current.getPointNext().getAngle() < this.angle &&
      this.current.getPointNext() !== this.isovist.getVertexHead() &&
      this.current.specialCase === null
    ) {
      this.current = this.current.getPointNext();
      this.isovistDrawingPoints.pop();
      this.isovistDrawingPoints.push(this.current);
    }

    if (
      this.current.specialCase === "grow into next" &&
      this.sweepLine.getLength() <
        distanceBetweenTwoPoints(
          this.guard.getPoint(),
          this.current.getPointNext()
        )
    ) {
      this.angle = this.current.getAngle();
      let a = this.sweepLine.getLength() + this.speed * deltaTime;
      this.sweepLine.getPoint2().setX(this.guard.getX() + cos(this.angle) * a);
      this.sweepLine.getPoint2().setY(this.guard.getY() - sin(this.angle) * a);
      this.drawPartialIsovist();
      drawLine(this.sweepLine, "white", this.lineThickness);
      return;
    } else if (
      this.current.specialCase === "shrink into next" &&
      this.sweepLine.getLength() >
        distanceBetweenTwoPoints(
          this.guard.getPoint(),
          this.current.getPointNext()
        )
    ) {
      this.angle = this.current.getAngle();
      let a = this.sweepLine.getLength() - this.speed * deltaTime;
      this.sweepLine.getPoint2().setX(this.guard.getX() + cos(this.angle) * a);
      this.sweepLine.getPoint2().setY(this.guard.getY() - sin(this.angle) * a);
      this.drawPartialIsovist();
      drawLine(this.sweepLine, "white", this.lineThickness);
      return;
    } else if (this.current.specialCase !== null) {
      this.current = this.current.getPointNext();
      this.isovistDrawingPoints.push(this.current);
    }

    let A = this.angleBetweenEdge1Edge2(
      new Line(this.guard.getPoint(), this.current),
      new Line(this.current, this.current.getPointNext())
    );
    let B = this.angle - this.current.getAngle();
    let C = PI - A - B;
    let c = distanceBetweenTwoPoints(this.guard.getPoint(), this.current);

    let a = (sin(A) * c) / sin(C);
    if (this.guard.getY() - sin(this.angle) * a < 0 || a < 0) {
      a = this.sweepLine.getLength() + this.speed * deltaTime;
    }

    this.sweepLine.getPoint2().setX(this.guard.getX() + cos(this.angle) * a);
    this.sweepLine.getPoint2().setY(this.guard.getY() - sin(this.angle) * a);

    if (
      this.isovistDrawingPoints[this.isovistDrawingPoints.length - 1] !==
      this.sweepLine.getPoint2()
    ) {
      this.isovistDrawingPoints.push(this.sweepLine.getPoint2());
    }

    let velocity = this.speed * deltaTime;
    this.angle +=
      velocity /
      distanceBetweenTwoPoints(
        this.guard.getPoint(),
        this.isovistDrawingPoints[this.isovistDrawingPoints.length - 1]
      );

    if (this.angle > TWO_PI) {
      this.sweepLineAnimationGo = false;
      this.endAnimationGo = true;
    } else {
      this.drawPartialIsovist();
      drawLine(this.sweepLine, "white", this.lineThickness);
    }
  }

  endAnimation() {
    if (!this.endAnimationGo) return;
    if (this.initLine.getPoint2().getX() > this.guard.getPoint().getX()) {
      this.guard.getIsovist().drawIsovist(this.guard, 100, this.lineThickness);
      drawLine(this.initLine, "white", this.lineThickness);
      this.initLine
        .getPoint2()
        .setX(this.initLine.getPoint2().getX() - this.speed * deltaTime);
    } else if (this.isovistFlicks < this.isovistFlicksMax) {
      this.guard
        .getIsovist()
        .drawIsovist(
          this.guard,
          zigZag((this.isovistFlicks += deltaTime * 0.001), 1) * 100,
          this.lineThickness
        );
    } else {
      this.state = "done";
      this.scrollBar.value = 360;
      this.scrollBar.style.display = "block";
      this.sliderValue.style.display = "block";
    }
  }

  scrollBarAnimation() {
    this.sliderValue.innerHTML = visualizeGuard.scrollBar.value + "&#176";

    this.angle = (this.scrollBar.value * PI) / 180;
    this.current = this.isovist.getVertexHead();
    this.isovistDrawingPoints = [this.guard.getPoint(), this.current];
    if (this.angle !== TWO_PI) {
      while (
        this.current.getPointNext().getAngle() <= this.angle &&
        this.current.getPointNext().getAngle() !== 0
      ) {
        this.current = this.current.getPointNext();
        this.isovistDrawingPoints.push(
          new Point(this.current.getX(), this.current.getY())
        );
      }

      let A = this.angleBetweenEdge1Edge2(
        new Line(this.guard.getPoint(), this.current),
        new Line(this.current, this.current.getPointNext())
      );
      let B = this.angle - this.current.getAngle();
      let C = PI - A - B;
      let c = distanceBetweenTwoPoints(this.guard.getPoint(), this.current);
      let a = (sin(A) * c) / sin(C);

      this.isovistDrawingPoints.push(
        new Point(
          this.guard.getX() + cos(this.angle) * a,
          this.guard.getY() - sin(this.angle) * a
        )
      );

      this.drawPartialIsovist();
    } else {
      this.guard.getIsovist().drawIsovist(this.guard, 100, this.lineThickness);
    }
  }

  sweepAnimationPrelude() {
    if (this.isovist.getVertexHead().getAngle() === 0) return;
    let newIsovistPoint = new IsovistPoint(
      this.guard.getX() +
        this.initialIntersectEdges[0].getDistanceFromIntersectToGuard(),
      this.guard.getY(),
      null,
      0,
      null
    );

    newIsovistPoint.setPointNext(this.isovist.getVertexHead());
    newIsovistPoint.setPointPrev(this.isovist.getVertexHead().getPointPrev());
    this.isovist.getVertexHead().getPointPrev().setPointNext(newIsovistPoint);
    this.isovist.getVertexHead().setPointPrev(newIsovistPoint);

    this.isovist.setVertexHead(newIsovistPoint);
    this.isovist.setEdges(); // only place where I write setEdges() outside of setVertexLinkedList()
  }

  resetAll() {
    this.state = "not started";
    this.initLine = new Line(
      this.guard.getPoint(),
      new Point(this.guard.getX(), this.guard.getY())
    );
    this.sweepLine = new Line(this.guard.getPoint(), new Point(0, 0));
    this.initLineAnimationGo = true;
    this.sweepLineAnimationGo = false;
    this.speed = 3;
    this.lineThickness = 3;
    this.angle = 0;
    this.initialIntersectEdges = this.guard.initialIntersect();
    this.guard.visibleVertices();
    this.isovist = this.guard.getIsovist();
    this.sweepAnimationPrelude();
    this.current = this.isovist.getVertexHead(); // make sure this is after this.sweepAnimationPrelude()
    this.initPointFlicksRoundingError = false;
    this.isovistDrawingPoints = [this.guard.getPoint(), this.current];
    this.endAnimationGo = false;
    this.isovistFlicks = 0;
    this.initPointFlicks = 1;
    this.speeds = new Map([
      ["btnradio1", [0.1, 15, 16]],
      ["btnradio2", [0.2, 11, 12]],
      ["btnradio3", [0.4, 5, 6]],
    ]);
    this.initPointFlicksMax;
    this.isovistFlicksMax;
  }

  angleBetweenEdge1Edge2(edge1, edge2) {
    let vEdge1 = createVector(
      edge1.getPoint2().getX() - edge1.getPoint1().getX(),
      -(edge1.getPoint2().getY() - edge1.getPoint1().getY()),
      0
    );

    let vEdge2 = createVector(
      edge2.getPoint2().getX() - edge2.getPoint1().getX(),
      -(edge2.getPoint2().getY() - edge2.getPoint1().getY()),
      0
    );
    return PI - vEdge1.angleBetween(vEdge2);
  }

  setState(state) {
    this.state = state;
  }

  setSpeed(speed) {
    this.speed = this.speeds.get(speed)[0];
    this.initPointFlicksMax = this.speeds.get(speed)[1];
    this.isovistFlicksMax = this.speeds.get(speed)[2];
  }

  getSecurityGuard() {
    return this.guard;
  }

  drawPartialIsovist() {
    push();
    stroke(
      this.guard.getName()[0],
      this.guard.getName()[1],
      this.guard.getName()[2]
    );

    strokeWeight(this.lineThickness);
    fill(
      this.guard.getName()[0],
      this.guard.getName()[1],
      this.guard.getName()[2],
      100
    );
    beginShape();
    for (let eachPoint of this.isovistDrawingPoints)
      vertex(eachPoint.getX(), eachPoint.getY());
    endShape(CLOSE);
    pop();
  }

  getGuard() {
    return this.guard;
  }

  getScrollBar() {
    return this.scrollBar;
  }

  getSliderValue() {
    return this.sliderValue;
  }
}

// controls shapeControlPanel
class ShapeVisualization {
  constructor(shape) {
    this.shape = shape;
    this.shape.setPointsBackup();
    this.scrollBarSize = document.getElementById("shapeRangeSize");
    this.scrollBarRotate = document.getElementById("shapeRangeRotate");
    this.scrollBarRotate.value = 0;
    this.scrollBarSize.value = 1;
    this.rotateBtn = document.getElementById("shapebtnradio1");
    this.sizeBtn = document.getElementById("shapebtnradio2");
    this.sliderValue = document.getElementById("sliderValueShapeControlPanel");
    this.pointClicked = new Point(mouseX, mouseY);
  }

  masterMethod(end) {
    for (let each of cutShapes) allShapes.delete(each);
    for (let each of uncutShapes) allShapes.add(each);
    for (let each of superImposedShapes) allShapes.delete(each);
    for (let each of superImposedShapeChildren) allShapes.add(each);

    if (this.rotateBtn.checked) this.rotateShape(end);
    else if (this.sizeBtn.checked) this.growOrShrinkShape(end);
  }

  rotateShape(end) {
    this.scrollBarRotate.style.display = "block";
    this.scrollBarSize.style.display = "none";
    this.sliderValue.style.display = "block";
    this.sliderValue.innerHTML = this.scrollBarRotate.value + "&#176";

    let currentVertex = this.shape.getVertexHead();
    let angle = (this.scrollBarRotate.value * PI) / 180;
    for (let eachCoord of this.shape.getPointsBackup()) {
      currentVertex.setX(
        Math.cos(angle) * (eachCoord[0] - this.pointClicked.x) -
          Math.sin(angle) * (eachCoord[1] - this.pointClicked.y) +
          this.pointClicked.x
      );
      currentVertex.setY(
        Math.sin(angle) * (eachCoord[0] - this.pointClicked.x) +
          Math.cos(angle) * (eachCoord[1] - this.pointClicked.y) +
          this.pointClicked.y
      );
      currentVertex = currentVertex.getPointNext();
    }

    dealWithShapeIntersectionWithArugment(this.shape, end);
    dealWithGameShapeIntersection();

    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        for (let guard of allGuards) {
          currentVertex.setSecurityGuardAngle(guard);
        }
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }

    for (let guard of allGuards) {
      guard.addAllVertices();
      guard.sortVertices();
    }
  }

  growOrShrinkShape(end) {
    this.scrollBarRotate.style.display = "none";
    this.scrollBarSize.style.display = "block";
    this.sliderValue.style.display = "block";
    this.sliderValue.innerHTML = this.scrollBarSize.value + "x";

    let currentVertex = this.shape.getVertexHead();
    do {
      currentVertex.setX(
        this.pointClicked.getX() -
          this.shape.getVerticesDistancetoMousePress(currentVertex)[0] *
            this.scrollBarSize.value
      );
      currentVertex.setY(
        this.pointClicked.getY() -
          this.shape.getVerticesDistancetoMousePress(currentVertex)[1] *
            this.scrollBarSize.value
      );
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== this.shape.getVertexHead());

    dealWithShapeIntersectionWithArugment(this.shape, end);
    dealWithGameShapeIntersection();

    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        for (let guard of allGuards) {
          currentVertex.setSecurityGuardAngle(guard);
        }
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }

    for (let guard of allGuards) {
      guard.addAllVertices();
      guard.sortVertices();
    }
  }

  getShape() {
    return this.shape;
  }

  getPointClicked() {
    return this.pointClicked;
  }
}
