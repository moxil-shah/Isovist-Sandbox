function clearAll() {
  clearShapes();
  clearGuards();
}

function clearGuards() {
  for (let guard of allGuards) securityGuardNames.push(guard.getName());
  allGuards.clear();
  document.getElementById("addBtn").disabled = false;
}

function clearShapes() {
  allShapes.clear();
  superImposedShapes.clear();
  superImposedShapeChildren.clear();
  cutShapes.clear();
  uncutShapes.clear();
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
  polygon(mouseX, mouseY, 45, parseInt(nPoints));
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
    guardDragged = guard;
  }
  if (securityGuardNames.length === 0) {
    document.getElementById("addBtn").disabled = true;
  }
}

function SecurityGuardInputNoDrag(x, y) {
  if (securityGuardNames.length !== 0) {
    guard = new SecurityGuard(x, y, securityGuardNames.pop());
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
  shapeToHandle.masterMethod(true);
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
  exitGuardControlPanel();
}

function removeShape() {
  shapeToHandle.masterMethod(true);
  for (let each of allShapes) {
    for (let eachShape of superImposedShapes) {
      each.deleteFromOnTop(eachShape);
    }
  }
  for (let each of cutShapes) allShapes.delete(each);
  for (let each of uncutShapes) allShapes.add(each);
  for (let each of superImposedShapes) allShapes.delete(each);
  for (let each of superImposedShapeChildren) allShapes.add(each);

  allShapes.delete(shapeToHandle.getShape());

  for (let guard of allGuards) {
    guard.addAllVertices();
    guard.sortVertices();
  }

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

function checkIfPointIsOutsideGameShape(point) {
  return (
    point[0] < 50 ||
    point[0] > Math.round((width - 50) * ROUND_FACTOR) / ROUND_FACTOR ||
    point[1] < 50 ||
    point[1] > Math.round((height - 50) * ROUND_FACTOR) / ROUND_FACTOR
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

// min inclusive, max inclusive
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

function makeRoom1(withShapes) {
  clearAll();

  let gridPoints = makeGrid();
  let newObstacleMain = new Obstacle([209, 209, 209]);
  let vertexes = [];

  for (let row = 0; row < gridPoints.length; row += 1) {
    for (let col = 0; col < gridPoints[row].length; col += 1) {
      gridPoints[row][col] = new ObstaclePoint(
        gridPoints[row][col][0],
        gridPoints[row][col][1],
        newObstacleMain
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
  newObstacleMain.setVerticesLinkedList(vertexes);
  allShapes.add(newObstacleMain);

  if (withShapes === true) {
    let newObstacle = new Obstacle([209, 209, 209]);
    vertexes = [];

    vertexes.push(
      gridPoints[2][2],
      gridPoints[2][3],
      gridPoints[6][3],
      gridPoints[6][2]
    );
    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
    newObstacleMain.addOnTop(newObstacle);

    newObstacle = new Obstacle([209, 209, 209]);
    vertexes = [];

    vertexes.push(
      gridPoints[2][4],
      gridPoints[2][5],
      gridPoints[4][5],
      gridPoints[4][4]
    );
    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
    newObstacleMain.addOnTop(newObstacle);

    newObstacle = new Obstacle([209, 209, 209]);
    vertexes = [];

    vertexes.push(
      gridPoints[5][4],
      gridPoints[5][5],
      gridPoints[6][5],
      gridPoints[6][4]
    );
    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
    newObstacleMain.addOnTop(newObstacle);

    newObstacle = new Obstacle([209, 209, 209]);
    vertexes = [];

    vertexes.push(
      gridPoints[7][7],
      gridPoints[12][7],
      gridPoints[12][10],
      gridPoints[7][10],
      gridPoints[7][9],
      gridPoints[11][9],
      gridPoints[11][8],
      gridPoints[7][8]
    );
    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
    newObstacleMain.addOnTop(newObstacle);

    newObstacle = new Obstacle([209, 209, 209]);
    vertexes = [];

    vertexes.push(
      gridPoints[14][7],
      gridPoints[14][8],
      gridPoints[15][9],
      gridPoints[16][9],
      gridPoints[17][8],
      gridPoints[17][7],
      gridPoints[16][6],
      gridPoints[15][6]
    );
    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
    newObstacleMain.addOnTop(newObstacle);

    newObstacle = new Obstacle([209, 209, 209]);
    vertexes = [];

    vertexes.push(gridPoints[2][17], gridPoints[8][18], gridPoints[8][16]);
    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
    newObstacleMain.addOnTop(newObstacle);

    newObstacle = new Obstacle([209, 209, 209]);
    vertexes = [];

    vertexes.push(
      gridPoints[18][10],
      gridPoints[17][11],
      gridPoints[17][12],
      gridPoints[18][13]
    );
    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
    newObstacleMain.addOnTop(newObstacle);

    newObstacle = new Obstacle([209, 209, 209]);
    vertexes = [];

    vertexes.push(
      gridPoints[12][14],
      gridPoints[12][18],
      gridPoints[17][18],
      gridPoints[17][16],
      gridPoints[13][16],
      gridPoints[13][14]
    );
    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
    newObstacleMain.addOnTop(newObstacle);

    newObstacle = new Obstacle([209, 209, 209]);
    vertexes = [];

    vertexes.push(
      gridPoints[10][3],
      gridPoints[10][4],
      gridPoints[12][4],
      gridPoints[12][5],
      gridPoints[13][5],
      gridPoints[13][2],
      gridPoints[12][2],
      gridPoints[12][3]
    );
    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
    newObstacleMain.addOnTop(newObstacle);
  }
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

  madeRoom = true;
}

function makeRoom2() {
  clearAll();

  let gridPoints = makeGrid();
  let alternate = false;
  for (let row = 0; row < 20; row += 2) {
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

  madeRoom = true;
}

function makeRoom3() {
  clearAll();
  let numberOfShapes = getRndInteger(5, 25);
  for (let i = 0; i < numberOfShapes; i += 1) {
    polygonNoDrag(
      getRndInteger(50, width - 50),
      getRndInteger(50, height - 50),
      getRndInteger(20, 100),
      getRndInteger(3, 30)
    );
  }
  let numberOfGuards = securityGuardNames.length;

  for (let i = 0; i < numberOfGuards; i += 1) {
    SecurityGuardInputNoDrag(
      getRndInteger(51, width - 49),
      getRndInteger(51, height - 49)
    );
  }

  madeRoom = true;
}

function makeRoom4() {
  clearAll();
  let maxRadius;
  if (height > width) {
    maxRadius = width / 2 - 50;
  } else maxRadius = height / 2 - 50;

  let numberOfShapes = 8;
  let radius = maxRadius / numberOfShapes;
  for (let i = 1; i <= numberOfShapes; i += 1) {
    polygonNoDrag(width / 2, height / 2, radius * i, 3);
  }
  madeRoom = true;
}

function makeRoom5() {
  clearAll();
  let gridPoints = makeGrid();
  let newObstacleMain = new Obstacle([209, 209, 209]);
  let vertexes = [];

  for (let row = 0; row < gridPoints.length; row += 1) {
    for (let col = 0; col < gridPoints[row].length; col += 1) {
      gridPoints[row][col] = new ObstaclePoint(
        gridPoints[row][col][0],
        gridPoints[row][col][1],
        newObstacleMain
      );
    }
  }

  vertexes.push(
    gridPoints[1][1],
    gridPoints[19][1],
    gridPoints[19][19],
    gridPoints[1][19],
    gridPoints[1][3],
    gridPoints[17][3],
    gridPoints[17][17],
    gridPoints[3][17],
    gridPoints[3][5],
    gridPoints[15][5],
    gridPoints[15][15],
    gridPoints[5][15],
    gridPoints[5][7],
    gridPoints[13][7],
    gridPoints[13][13],
    gridPoints[7][13],
    gridPoints[7][9],
    gridPoints[11][9],
    gridPoints[11][11],
    gridPoints[11][10],
    gridPoints[11][11],
    gridPoints[10][11],
    gridPoints[10][10],
    gridPoints[8][10],
    gridPoints[8][12],
    gridPoints[12][12],
    gridPoints[12][8],
    gridPoints[6][8],
    gridPoints[6][14],
    gridPoints[14][14],
    gridPoints[14][6],
    gridPoints[4][6],
    gridPoints[4][16],
    gridPoints[16][16],
    gridPoints[16][4],
    gridPoints[2][4],
    gridPoints[2][18],
    gridPoints[18][18],
    gridPoints[18][2],
    gridPoints[1][2]
  );
  newObstacleMain.setVerticesLinkedList(vertexes);
  allShapes.add(newObstacleMain);

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

  madeRoom = true;
}
