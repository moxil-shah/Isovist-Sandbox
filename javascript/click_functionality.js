function doubleClicked() {
  guardDragged = checkIfClickSecurityGuard();
  shapeDragged = checkIfClickInsideShape();
  if (guardDragged !== -1) {
    window.scrollTo(0, 0);
    visualizeGuard = new AsanoVisualization(guardDragged);
    guardControlPanel.style.display = "block";
  } else if (shapeDragged !== -1) {
    window.scrollTo(0, 0);

    shapeToHandle = new ShapeVisualization(shapeDragged);
    shapeControlPanel.style.display = "block";
  } else {
    return;
  }
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
    cutShapes.clear();
    uncutShapes.clear();
    return;
  } else if (shapeDragged === -1 && guardDragged === -1) {
    [pointDragged, shapesPointDragged] = checkIfClickAVertex();
    if (pointDragged !== -1 && shapesPointDragged !== -1) return;
  }
  if (shapeDragged !== -1) {
    shapeDragged = -1;
    superImposedShapes.clear();
    superImposedShapeChildren.clear();
    cutShapes.clear();
    uncutShapes.clear();
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
  if (visualizeGuard !== -1 || shapeToHandle !== -1 || pointDragged === -1) {
    pointDragged = -1;
    return;
  }
  if (pointDragged !== -1) {
    for (let each of cutShapes) allShapes.delete(each);

    for (let each of uncutShapes) allShapes.add(each);

    for (let each of superImposedShapes) allShapes.delete(each);

    for (let each of superImposedShapeChildren) allShapes.add(each);

    pointDragged.setX(mouseX);
    pointDragged.setY(mouseY);

    dealWithShapeIntersection();
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
}

function dragSecurityGuard() {
  if (visualizeGuard !== -1 || shapeToHandle !== -1 || guardDragged === -1) {
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
  if (visualizeGuard !== -1 || shapeToHandle !== -1 || shapeDragged === -1) {
    shapeDragged = -1;
    return;
  }
  if (shapeDragged !== -1) {
    for (let each of cutShapes) allShapes.delete(each);
    for (let each of uncutShapes) allShapes.add(each);
    for (let each of superImposedShapes) allShapes.delete(each);
    for (let each of superImposedShapeChildren) allShapes.add(each);

    let currentVertex = shapeDragged.getVertexHead();
    do {
      currentVertex.setX(
        mouseX - shapeDragged.getVerticesDistancetoMousePress(currentVertex)[0]
      );
      currentVertex.setY(
        mouseY - shapeDragged.getVerticesDistancetoMousePress(currentVertex)[1]
      );
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== shapeDragged.getVertexHead());

    dealWithShapeIntersection();
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
}
