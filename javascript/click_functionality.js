/* title: Isovist Sandbox
 * author: Moxil Shah
 * Date Created: May 1, 2022
 */

////// file contains all clicking/dragging related functions //////

/*
 * Function description: Bring up shapeControlPanel or guardControlPanel.
 */
function doubleClicked() {
  if (madeRoomDoubleClick === true) {
    madeRoomDoubleClick = false;
    return;
  }
  guardDragged = checkIfClickSecurityGuard();
  shapeDragged = checkIfClickInsideShape(allShapes);
  if (visualizeGuard !== -1 || shapeToHandle !== -1) return;
  if (guardDragged !== -1 && guardDragged.outsideGameShape() === false) {
    visualizeGuard = new AsanoVisualization(guardDragged);
    guardControlPanel.style.display = "block";
    document.getElementById("mainMenuNavBar").style.display = "none";
    window.scrollTo(0, 0);
  } else if (shapeDragged !== -1) {
    shapeToHandle = new ShapeVisualization(shapeDragged);
    shapeControlPanel.style.display = "block";
    document.getElementById("mainMenuNavBar").style.display = "none";
    window.scrollTo(0, 0);
  }
}

/*
 * Function description: Handles clicking shapes, guards, and points.
 */
function mouseClicked() {
  // to prevent accidentally clicking a shape below a template option
  if (madeRoom === true) {
    madeRoom = false;
    madeRoomDoubleClick = true;
    return;
  } else madeRoomDoubleClick = false;

  if (mouseY < 0) return;
  if (guardDragged !== -1) {
    guardDragged = -1;
    $("#navbarSupportedContent :input").attr("disabled", false);
    document.getElementById("dropDownTemplates").style.visibility = "visible";

    if (securityGuardNames.length === 0) {
      document.getElementById("addBtn").disabled = true;
    }
    return;
  } else if (
    shapeDragged === -1 &&
    pointDragged === -1 &&
    visualizeGuard === -1 &&
    shapeToHandle === -1
  ) {
    guardDragged = checkIfClickSecurityGuard();
    if (guardDragged !== -1) {
      return;
    }
  }
  if (pointDragged !== -1) {
    dragPoint(true);
    pointDragged = shapesPointDragged = -1;
    superImposedShapes.clear();
    superImposedShapeChildren.clear();
    cutShapes.clear();
    uncutShapes.clear();
    for (let eachShape of allShapes) eachShape.clearOnTopTemp();
    $("#navbarSupportedContent :input").attr("disabled", false);
    document.getElementById("dropDownTemplates").style.visibility = "visible";

    if (securityGuardNames.length === 0) {
      document.getElementById("addBtn").disabled = true;
    }
    return;
  } else if (
    shapeDragged === -1 &&
    guardDragged === -1 &&
    visualizeGuard === -1 &&
    shapeToHandle === -1
  ) {
    [pointDragged, shapesPointDragged] = checkIfClickAVertex();
    if (pointDragged !== -1 && shapesPointDragged !== -1) return;
  }
  if (shapeDragged !== -1) {
    dragShape(true);
    shapeDragged = -1;
    superImposedShapes.clear();
    superImposedShapeChildren.clear();
    cutShapes.clear();
    uncutShapes.clear();
    for (let eachShape of allShapes) eachShape.clearOnTopTemp();
    $("#navbarSupportedContent :input").attr("disabled", false);
    document.getElementById("dropDownTemplates").style.visibility = "visible";

    if (securityGuardNames.length === 0) {
      document.getElementById("addBtn").disabled = true;
    }
    return;
  } else if (
    guardDragged === -1 &&
    pointDragged === -1 &&
    visualizeGuard === -1 &&
    shapeToHandle === -1
  ) {
    shapeDragged = checkIfClickInsideShape(allShapes);
    if (shapeDragged !== -1) return;
  }
}

/*
 * Function description: In the name.
 */
function checkIfClickInsideShape(shapesSet) {
  for (let shape of shapesSet) {
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
      if (checkIfClickInsideShape(shape.getOnTop()) === -1) {
        updateVertexArrayDistancetoMousePress(shape, new Point(mouseX, mouseY));
        return shape;
      }
    }
  }
  return -1;
}

/*
 * Function description: In the name.
 */
function checkIfClickSecurityGuard() {
  for (let guard of allGuards) {
    // +- 10 enables inexact clicking
    if (
      between(mouseX, guard.getX() - 10, guard.getX() + 10) &&
      between(mouseY, guard.getY() - 10, guard.getY() + 10)
    ) {
      return guard;
    }
  }
  return -1;
}

/*
 * Function description: In the name.
 */
function checkIfClickAVertex() {
  for (let eachShape of allShapes) {
    if (eachShape === gameShape) continue;

    let currentVertex = eachShape.getVertexHead();
    do {
      // +- 10 enables inexact clicking
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

/*
 * Function description: In the name.
 */
function dragPoint(end) {
  if (visualizeGuard !== -1 || shapeToHandle !== -1) {
    pointDragged = -1;
    return;
  }
  if (pointDragged !== -1) {
    $("#navbarSupportedContent :input").attr("disabled", true);
    document.getElementById("dropDownTemplates").style.visibility = "hidden";

    for (let each of cutShapes) allShapes.delete(each);
    for (let each of uncutShapes) allShapes.add(each);
    for (let each of superImposedShapes) allShapes.delete(each);
    for (let each of superImposedShapeChildren) allShapes.add(each);

    pointDragged.setX(mouseX);
    pointDragged.setY(mouseY);

    dealWithShapeIntersectionWithArugment(shapesPointDragged, end);
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

/*
 * Function description: In the name.
 */
function dragSecurityGuard() {
  if (visualizeGuard !== -1 || shapeToHandle !== -1) {
    guardDragged = -1;
    return;
  }
  if (guardDragged !== -1) {
    $("#navbarSupportedContent :input").attr("disabled", true);
    document.getElementById("dropDownTemplates").style.visibility = "hidden";
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

/*
 * Function description: In the name.
 */
function dragShape(end) {
  if (visualizeGuard !== -1 || shapeToHandle !== -1) {
    shapeDragged = -1;
    return;
  }
  if (shapeDragged !== -1) {
    $("#navbarSupportedContent :input").attr("disabled", true);
    document.getElementById("dropDownTemplates").style.visibility = "hidden";
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

    dealWithShapeIntersectionWithArugment(shapeDragged, end);
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
