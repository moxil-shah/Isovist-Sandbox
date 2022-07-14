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
  if (guardDragged !== -1) {
    guardDragged = -1;
    return;
  } else if (shapeDragged === -1 && pointDragged === -1) {
    guardDragged = checkIfClickSecurityGuard();
    if (guardDragged !== -1) return;
  }
  if (pointDragged !== -1) {
    pointDragged = shapesPointDragged = -1;
    superImposedShapes.clear();
    superImposedShapeChildren.clear();
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


    for (let each of superImposedShapes) {
      allShapes.delete(each);
    }
    for (let each of superImposedShapeChildren) {
      allShapes.add(each);
    }
    superImposedShapes.clear();
    superImposedShapeChildren.clear();

    pointDragged.setX(mouseX);
    pointDragged.setY(mouseY);

    checkIfConvexHullIntersects(shapesPointDragged);

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
    shapesPointDragged.setConvexHull();
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
    shapeDragged.setConvexHull();
  }
}
