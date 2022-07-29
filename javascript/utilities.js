function clearAll() {
  allShapes.clear();
  polygon(null, null, null, 4);
  for (let guard of allGuards) securityGuardNames.push(guard.getName());
  allGuards.clear();
}

function clearGuards() {
  for (let guard of allGuards) securityGuardNames.push(guard.getName());
  allGuards.clear();
  document.getElementById("addBtn").disabled = false;
  document.getElementById("addBtn").innerText = "Add Guard";
}

function clearShapes() {
  allShapes.clear();
  polygon(null, null, null, 4);
}

function visualizeAsanoPrelude() {
  visualizeGuard.resetAll();
  visualizeGuard.setState("drawing");
  visualizeGuard.setSpeed(
    $("input[type='radio'][class='btn-check']:checked").attr("id")
  );
  window.scrollTo(0, windowHeight);
  visualizeGuard.scrollBar.style.display = "none";
}

function drawLine(theLine, color, weight) {
  push();
  if (typeof color === "string") stroke(color);
  else stroke(color[0], color[1], color[2]);
  strokeWeight(weight);
  line(
    theLine.getPoint1().getX(),
    theLine.getPoint1().getY(),
    theLine.getPoint2().getX(),
    theLine.getPoint2().getY()
  );
  pop();
}

function visualizeAsanoSlider() {
  visualizeGuard.setState("slider");
}

// from the HTML form
function sidesInput() {
  let nPoints = document.getElementById("sideNumInput").value;
  if (nPoints > 30) nPoints = 30;
  if (nPoints < 3) nPoints = 3;
  polygon(100, 100, 45, parseInt(nPoints));
}

// from the HTML form
function SecurityGuardInput() {
  if (securityGuardNames.length !== 0) {
    guard = new SecurityGuard(180, 350, securityGuardNames.pop());
    for (let eachShape of allShapes) {
      let currentVertex = eachShape.getVertexHead();
      do {
        currentVertex.setSecurityGuardAngle(guard);

        currentVertex = currentVertex.getPointNext();
      } while (currentVertex !== eachShape.getVertexHead());
    }
    guard.addAllVertices();
    guard.sortVertices();
    allGuards.add(guard);
  }
  if (securityGuardNames.length === 0) {
    document.getElementById("addBtn").disabled = true;
    document.getElementById("addBtn").innerText = "Add Guard (Disabled)";
  }
}

function exitGuardControlPanel() {
  visualizeGuard.scrollBar.style.display = "none";
  visualizeGuard = -1;
  guardControlPanel.style.display = "none";
  document.getElementById("mainMenuNavBar").style.display = "block";
  window.scrollTo(0, 0);
}

function exitShapeControlPanel() {
  shapeToHandle = -1;
  superImposedShapes.clear();
  superImposedShapeChildren.clear();
  cutShapes.clear();
  uncutShapes.clear();
  for (let eachShape of allShapes) eachShape.clearOnTopTemp();
  shapeControlPanel.style.display = "none";
  document.getElementById("mainMenuNavBar").style.display = "block";
  window.scrollTo(0, 0);
}

function removeGuard() {
  allGuards.delete(visualizeGuard.getGuard());
  securityGuardNames.push(visualizeGuard.getGuard().getName());
  document.getElementById("addBtn").disabled = false;
  document.getElementById("addBtn").innerText = "Add Guard";
  exitGuardControlPanel();
}

function removeShape() {
  for (let each of cutShapes) allShapes.delete(each);
  for (let each of uncutShapes) allShapes.add(each);
  for (let each of superImposedShapes) allShapes.delete(each);
  for (let each of superImposedShapeChildren) allShapes.add(each);
  allShapes.delete(shapeToHandle.getShape());

  for (let guard of allGuards) {
    guard.addAllVertices();
    guard.sortVertices();
  }
  exitShapeControlPanel();
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
  return new Point(px, py);
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

function zigZag(x, frequency) {
  return (
    (frequency * x - Math.floor(frequency * x)) *
      (-1 + 2 * (Math.floor(frequency * x) % 2)) -
    (Math.floor(frequency * x) % 2) +
    1
  );
}

function distanceBetweenTwoPoints(p1, p2) {
  return Math.sqrt((p1.getX() - p2.getX()) ** 2 + (p1.getY() - p2.getY()) ** 2);
}

function distanceBetweenTwoPointsRounded(p1, p2, roundFactor) {
  return (
    Math.round(
      Math.sqrt((p1.getX() - p2.getX()) ** 2 + (p1.getY() - p2.getY()) ** 2) *
        roundFactor
    ) / roundFactor
  );
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

function checkIfTwoPointsOverlapRounded(p1, p2, roundFactor) {
  return (
    Math.round(p1.getX() * roundFactor) / roundFactor ===
      Math.round(p2.getX() * roundFactor) / roundFactor &&
    Math.round(p1.getY() * roundFactor) / roundFactor ===
      Math.round(p2.getY() * roundFactor) / roundFactor
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
    checkIfTwoPointsOverlap(line1.getPoint1(), line2.getPoint2()) ||
    checkIfTwoPointsOverlap(line1.getPoint2(), line2.getPoint1())
  );
}

function checkIfTwoLinesIntersectOnEndPointsRounded(line1, line2) {
  return (
    checkIfTwoPointsOverlapRounded(line1.getPoint1(), line2.getPoint1()) ||
    checkIfTwoPointsOverlapRounded(line1.getPoint2(), line2.getPoint2()) ||
    checkIfTwoPointsOverlapRounded(line1.getPoint1(), line2.getPoint2()) ||
    checkIfTwoPointsOverlapRounded(line1.getPoint2(), line2.getPoint1())
  );
}

function shapeToHandleHelper() {
  updateVertexArrayDistancetoMousePress(
    shapeToHandle.getShape(),
    shapeToHandle.getPointClicked()
  );
  shapeToHandle.getShape().setPointsBackup();
  document.getElementById("shapeRangeSize").value = 1;
  document.getElementById("shapeRangeRotate").value = 0;
}

function makeGrid() {
  let gridPoints = [];
  let counter_x = 0;
  let y = 50;
  while (counter_x <= 20) {
    let x = 50;
    let column = [];
    let counter_y = 0;
    while (counter_y <= 20) {
      column.push([x, y]);
      push();
      strokeWeight(10);
      stroke("white");
      point(x, y);
      pop();
      x += (width - 100) / 20;
      counter_y += 1;
    }
    y += (height - 100) / 20;
    counter_x += 1;
    gridPoints.push(column);
  }

  return gridPoints;
}

function makeRoom1() {
  let gridPoints = makeGrid();
  let newObstacle = new Obstacle([209, 209, 209]);
  let vertexes = [];

  for (let row = 0; row < gridPoints.length; row += 1) {
    for (let col = 0; col < gridPoints[row].length; col += 1) {
      gridPoints[row][col] = new ObstaclePoint(
        gridPoints[row][col][0],
        gridPoints[row][col][1],
        newObstacle
      );
    }
  }

  vertexes.push(
    gridPoints[1][1],
    gridPoints[1][6],
    gridPoints[5][6],
    gridPoints[5][10],
    gridPoints[1][10],
    gridPoints[1][14],
    gridPoints[2][14],
    gridPoints[2][12],
    gridPoints[5][12],
    gridPoints[5][15],
    gridPoints[1][15],
    gridPoints[1][19],
    gridPoints[9][19],
    gridPoints[9][15],
    gridPoints[7][15],
    gridPoints[7][11],
    gridPoints[12][11],
    gridPoints[12][13],
    gridPoints[9][13],
    gridPoints[9][14],
    gridPoints[11][14],
    gridPoints[11][19],
    gridPoints[18][19],
    gridPoints[18][15],
    gridPoints[14][15],
    gridPoints[14][10],
    gridPoints[16][10],
    gridPoints[16][14],
    gridPoints[19][14],
    gridPoints[19][4],
    gridPoints[17][1],
    gridPoints[16][4],
    gridPoints[14][4],
    gridPoints[14][1],
    gridPoints[11][1],
    gridPoints[11][2],
    gridPoints[9][2],
    gridPoints[9][5],
    gridPoints[11][5],
    gridPoints[11][6],
    gridPoints[7][6],
    gridPoints[7][1]
  );
  newObstacle.setVerticesLinkedList(vertexes);
  allShapes.add(newObstacle);
  dealWithShapeIntersection();
  superImposedShapeChildren.clear();
  superImposedShapes.clear();

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

function makeRoom2() {
  let gridPoints = makeGrid();

  for (let row = 12; row <= 18; row += 2) {
    let newObstacle = new Obstacle([209, 209, 209]);
    let vertexes = [];
    vertexes.push(
      new ObstaclePoint(
        gridPoints[row][1][0],
        gridPoints[row][1][1],
        newObstacle
      ),
      new ObstaclePoint(
        gridPoints[row][5][0],
        gridPoints[row][5][1],
        newObstacle
      ),
      new ObstaclePoint(
        gridPoints[row + 1][5][0],
        gridPoints[row + 1][5][1],
        newObstacle
      ),
      new ObstaclePoint(
        gridPoints[row + 1][1][0],
        gridPoints[row + 1][1][1],
        newObstacle
      )
    );

    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
  }
  for (let row = 12; row <= 18; row += 2) {
    let newObstacle = new Obstacle([209, 209, 209]);
    let vertexes = [];
    vertexes.push(
      new ObstaclePoint(
        gridPoints[row][6][0],
        gridPoints[row][6][1],
        newObstacle
      ),
      new ObstaclePoint(
        gridPoints[row][14][0],
        gridPoints[row][14][1],
        newObstacle
      ),
      new ObstaclePoint(
        gridPoints[row + 1][14][0],
        gridPoints[row + 1][14][1],
        newObstacle
      ),
      new ObstaclePoint(
        gridPoints[row + 1][6][0],
        gridPoints[row + 1][6][1],
        newObstacle
      )
    );

    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
  }
  for (let row = 12; row <= 18; row += 2) {
    let newObstacle = new Obstacle([209, 209, 209]);
    let vertexes = [];
    vertexes.push(
      new ObstaclePoint(
        gridPoints[row][15][0],
        gridPoints[row][15][1],
        newObstacle
      ),
      new ObstaclePoint(
        gridPoints[row][19][0],
        gridPoints[row][19][1],
        newObstacle
      ),
      new ObstaclePoint(
        gridPoints[row + 1][19][0],
        gridPoints[row + 1][19][1],
        newObstacle
      ),
      new ObstaclePoint(
        gridPoints[row + 1][15][0],
        gridPoints[row + 1][15][1],
        newObstacle
      )
    );

    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
  }
  let alternate = false;
  for (let row = 4; row <= 10; row += 2) {
    if (alternate) col = 2;
    else col = 1;

    while (col <= 18) {
      let newObstacle = new Obstacle([209, 209, 209]);
      let vertexes = [];
      vertexes.push(
        new ObstaclePoint(
          gridPoints[row][col][0],
          gridPoints[row][col][1],
          newObstacle
        ),
        new ObstaclePoint(
          gridPoints[row][col + 1][0],
          gridPoints[row][col + 1][1],
          newObstacle
        ),
        new ObstaclePoint(
          gridPoints[row + 1][col + 1][0],
          gridPoints[row + 1][col + 1][1],
          newObstacle
        ),
        new ObstaclePoint(
          gridPoints[row + 1][col][0],
          gridPoints[row + 1][col][1],
          newObstacle
        )
      );

      newObstacle.setVerticesLinkedList(vertexes);
      allShapes.add(newObstacle);
      col += 2;
    }
    alternate = !alternate;
  }
  let newObstacle = new Obstacle([209, 209, 209]);
  let vertexes = [];
  vertexes.push(
    new ObstaclePoint(gridPoints[1][1][0], gridPoints[1][1][1], newObstacle),
    new ObstaclePoint(gridPoints[1][19][0], gridPoints[1][19][1], newObstacle),
    new ObstaclePoint(gridPoints[2][19][0], gridPoints[2][19][1], newObstacle),
    new ObstaclePoint(gridPoints[2][1][0], gridPoints[2][1][1], newObstacle)
  );

  newObstacle.setVerticesLinkedList(vertexes);
  allShapes.add(newObstacle);

  dealWithShapeIntersection();
  superImposedShapeChildren.clear();
  superImposedShapes.clear();

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
