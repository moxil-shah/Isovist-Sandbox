function doubleClicked() {
  if (mouseY < 0) return;
  guardDragged = checkIfClickSecurityGuard();
  if (guardDragged === -1) {
    return;
  }
  window.scrollTo(0, 0);
  visualizeGuard = new AsanoVisualization(guardDragged);
  controlPanel.style.display = "block";
  const h6 = controlPanel.querySelector("h6");
  h6.innerText = "Guard Control Panel";
}

function mouseClicked() {
  if (mouseY < 0) return;
  controlPanel.style.display = "none";
  if (visualizeGuard !== -1) {
    window.scrollTo(0, 0);
    visualizeGuard = -1;
    return;
  }
  if (guardDragged !== -1) {
    guardDragged = -1;
    return;
  } else if (shapeDragged === -1 && pointDragged === -1) {
    guardDragged = checkIfClickSecurityGuard();
    if (guardDragged !== -1) return;
  }
  if (pointDragged !== -1) {
    pointDragged = shapesPointDragged = -1;
    return;
  } else if (shapeDragged === -1 && guardDragged === -1) {
    [pointDragged, shapesPointDragged] = checkIfClickAVertex();
    if (pointDragged !== -1 && shapesPointDragged !== -1) return;
  }
  if (shapeDragged !== -1) {
    shapeDragged = -1;
    return;
  } else if (pointDragged === -1 && guardDragged === -1) {
    shapeDragged = checkIfClickInsideShape();
    if (shapeDragged !== -1) return;
  }
}

function checkIfClickInsideShape() {
  for (let shape of allShapes) {
    if (shape === gameShape) continue;
    let lineSegmentCrossesCounter = 0; // for ray trace algorithm
    for (let edge of shape.getEdges()) {
      if (
        checkIfIntersect(
          new Line(new Point(mouseX, mouseY), new Point(width, mouseY)),
          edge
        )
      ) {
        lineSegmentCrossesCounter += 1;
      }
    }
    // ray tracing algorithm says if line segment crosses === odd num, then click is inside the shape
    if (lineSegmentCrossesCounter % 2 === 1) {
      updateVertexArrayDistancetoMousePress(shape);
      return shape;
    }
  }
  return -1;
}

function checkIfClickSecurityGuard() {
  for (let guard of allGuards) {
    if (
      between(mouseX, guard.getX() - 10, guard.getX() + 10) &&
      between(mouseY, guard.getY() - 10, guard.getY() + 10)
    ) {
      return guard;
    }
  }
  return -1;
}

function checkIfClickAVertex() {
  for (let eachShape of allShapes) {
    if (eachShape === gameShape) continue;

    let currentVertex = eachShape.getVertexHead();
    do {
      if (
        between(mouseX, currentVertex.getX() - 10, currentVertex.getX() + 10) &&
        between(mouseY, currentVertex.getY() - 10, currentVertex.getY() + 10) &&
        currentVertex.getNotSelfIntersect() === true
      ) {
        return [currentVertex, eachShape];
      }
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== eachShape.getVertexHead());
  }
  return [-1, -1];
}

function dragPoint() {
  if (visualizeGuard !== -1 || pointDragged === -1) {
    pointDragged = -1;
    return;
  }
  if (pointDragged !== -1) {
    deleteTheSelfIntersect(shapesPointDragged);
    pointDragged.setX(mouseX);
    pointDragged.setY(mouseY);
    let thething = checkIfSelfIntersectingPolygon(shapesPointDragged);

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

        value[i].setNotSelfIntersect(false);
      }

      if (value.length > 2) {
        for (let i = 1; i < value.length - 1; i += 1) {
          value[i].setPointPrev(value[i - 1]);
          value[i].setPointNext(value[i + 1]);
        }
      }
      if (value.length >= 2) {
        referencePoint.setPointNext(value[0]);
        value[0].setPointNext(value[1]);
        value[value.length - 1].setPointNext(nextPoint);
        value[0].setPointPrev(referencePoint);
        value[value.length - 1].setPointPrev(value[value.length - 2]);
        nextPoint.setPointPrev(value[value.length - 1]);
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
}

function dragSecurityGuard() {
  if (visualizeGuard !== -1 || guardDragged === -1) {
    guardDragged = -1;
    return;
  }
  if (guardDragged !== -1) {
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
  if (visualizeGuard !== -1 || shapeDragged === -1) {
    shapeDragged = -1;
    return;
  }
  if (shapeDragged !== -1) {
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
        for (let guard of allGuards) {
          currentVertex.setSecurityGuardAngle(guard);
        }
        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }

    for (let guard of allGuards) {
      guard.sortVertices();
    }
  }
}
