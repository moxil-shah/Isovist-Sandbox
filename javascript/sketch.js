// asano's algorithm is complete except gimpy edge cases like if the top edge
// of a rectangle is on the initial intersect line
// self-intersect is done without testing test cases though becuase I am lazy

// code starts //
let allShapes = new Set(); // global array of all shapes made
let allGuards = new Set(); // global array of all security guards made
let superImposedShapes = new Set();
let superImposedShapeChildren = new Set();
let uncutShapes = new Set();
let cutShapes = new Set();
const securityGuardNames = [
  [255, 165, 0],
  [28, 197, 220],
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 0],
  [255, 255, 0],
];
const ROUND_FACTOR = 10000;
let shapeDragged = -1;
let shapesPointDragged = -1;
let pointDragged = -1;
let guardDragged = -1;
let visualizeGuard = -1;
let shapeToHandle = -1;
let gameShape;
let guardControlPanel;
let shapeControlPanel;
let gameShapeSmaller;

function setup() {
  let canvas = createCanvas(windowWidth - getScrollBarWidth(), windowHeight);
  canvas.parent("canvasDiv");
  canvas.style("margin-bottom", "-5px");
  frameRate(60);
  polygon(null, null, null, 4);
  guardControlPanel = document.getElementById("guardControlPanel");
  shapeControlPanel = document.getElementById("shapeControlPanel");
}

function windowResized() {
  clearAll();
  resizeCanvas(windowWidth - getScrollBarWidth(), windowHeight);
  let currentVertex = gameShape.getVertexHead().getPointNext();
  currentVertex.setX(width - 50);
  currentVertex = currentVertex.getPointNext();
  currentVertex.setX(width - 50);
  currentVertex.setY(height - 50);
  currentVertex = currentVertex.getPointNext();
  currentVertex.setY(height - 50);
}

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

function draw() {
  background(34, 40, 49);

  dragSecurityGuard();
  dragPoint();
  dragShape();
  if (shapeToHandle !== -1) shapeToHandle.masterMethod();
  if (shapeDragged !== -1) {
    console.log(shapeDragged.onTop);
  }
  renderAllShapes();
  if (visualizeGuard === -1) renderAllSecurityGuards();
  if (visualizeGuard !== -1) {
    visualizeGuard.animateMasterMethod();
    visualizeGuard.getSecurityGuard().drawSecurityGuard();
  } else renderAllShapesPoints();
}

function makeGameShapeSmaller() {
  let vertexes = [];
  let unknown = expander(gameShape.getPointsArray(false), 0.5);
  gameShapeSmaller = new Obstacle([255, 0, 0]);

  for (let each of unknown)
    vertexes.push(new ObstaclePoint(each[0], each[1], gameShapeSmaller));
  gameShapeSmaller.setVerticesLinkedList(vertexes);
}

// gets parameters ready to make the new polygon
function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let vertexes = []; // temp vertexes array to be passed into Shape constructor
  let copyVertexes = [];
  let newObstacle = null;
  // gets the vertexes ready and puts them into temp array

  if (allShapes.size === 0) {
    newObstacle = new Obstacle([0, 0, 0]);

    gameShape = newObstacle;
    let stage = [
      new ObstaclePoint(50, 50, newObstacle),
      new ObstaclePoint(width - 50, 50, newObstacle),
      new ObstaclePoint(width - 50, height - 50, newObstacle),
      new ObstaclePoint(0 + 50, height - 50, newObstacle),
    ];
    for (let i = 0; i < stage.length; i += 1) {
      vertexes.push(stage[i]);
    }
    newObstacle.setVerticesLinkedList(vertexes);

    allShapes.add(newObstacle);
    makeGameShapeSmaller();
  } else {
    newObstacle = new Obstacle([209, 209, 209]);

    let preventRoundingError = 0;
    for (let i = 0; i < TWO_PI; i += angle) {
      preventRoundingError += 1;
      if (preventRoundingError > npoints) break;

      let sx = x + cos(i) * radius;
      let sy = y + sin(i) * radius;
      vertexes.push(new ObstaclePoint(sx, sy, newObstacle));
      copyVertexes.push([sx, sy]);
    }
    newObstacle.setVerticesLinkedList(vertexes);
    allShapes.add(newObstacle);
    dealWithShapeIntersectionWithArugment(newObstacle);
    superImposedShapeChildren.clear();
    superImposedShapes.clear();
    for (let eachShape of allShapes) eachShape.clearOnTopTemp();
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
}

function renderAllSecurityGuards() {
  for (let guard of allGuards) {
    if (guardDragged !== -1) guard = guardDragged;
    if (guard.outsideGameShape() === true) continue;
    guard.visibleVertices();
    guard.getIsovist().drawIsovist(guard, 100, 0);
    if (guardDragged !== -1) break;
  }
  for (let guard of allGuards) guard.drawSecurityGuard();
}

function drawAllOnTop(shapesToDraw) {
  for (let eachShape of shapesToDraw) {
    eachShape.drawShape(255, false);
    drawAllOnTop(eachShape.getOnTop());
  }
}

function renderAllShapes() {
  for (let eachShape of allShapes) {
    eachShape.drawShape(255, false);

    drawAllOnTop(eachShape.getOnTop());
  }
}

function renderAllShapesPoints() {
  for (let shape of allShapes) {
    let currentVertex = shape.getVertexHead();
    do {
      if (
        currentVertex.getNotSelfIntersect() === true &&
        currentVertex
          .getParentShape()
          .getColor()
          .reduce(
            (previousValue, currentValue) => previousValue + currentValue
          ) !== 0
      ) {
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
    } while (currentVertex !== shape.getVertexHead());
  }

  // draw the dragged shape
  if (pointDragged !== -1) {
    push();
    strokeWeight(15);
    stroke([115, 119, 123]);
    point(pointDragged.getX(), pointDragged.getY());
    pop();
  }
}

function dealWithShapeIntersection() {
  superImposedShapes.clear();
  superImposedShapeChildren.clear();
  let overlaps = [];
  let overlapShapes = [];
  for (let eachShape of allShapes) {
    if (eachShape === gameShape) continue;
    overlaps.push(eachShape.getPointsArray(true));
    superImposedShapeChildren.add(eachShape);
    allShapes.delete(eachShape);
  }

  for (let each of overlaps) {
    overlapShapes.push({ regions: each, inverted: false });
  }

  var segments = PolyBool.segments(overlapShapes[0]);
  for (var i = 1; i < overlapShapes.length; i++) {
    var seg2 = PolyBool.segments(overlapShapes[i]);
    var comb = PolyBool.combine(segments, seg2);
    segments = PolyBool.selectUnion(comb);
  }
  let final = PolyBool.polygon(segments);

  for (let eachPointArray of final.regions) {
    let obstacleOverlap = new Obstacle([209, 209, 209]);
    let points = [];
    for (let i = 0; i < eachPointArray.length; i += 1) {
      points.push(
        new ObstaclePoint(
          eachPointArray[i][0],
          eachPointArray[i][1],
          obstacleOverlap
        )
      );
    }
    obstacleOverlap.setVerticesLinkedList(points);

    superImposedShapes.add(obstacleOverlap);
    allShapes.add(obstacleOverlap);
  }
}

function dealWithShapeIntersectionWithArugment(theShape) {
  superImposedShapes.clear();
  superImposedShapeChildren.clear();

  for (let eachShape of allShapes) {
    eachShape.deleteOnTopTempFromOnTop();
    eachShape.clearOnTopTemp();
  }

  let overlaps = [];
  let overlapShapes = [];
  let shapeDraggedPolyBool = {
    regions: theShape.getPointsArray(true),
    inverted: false,
  };
  let firstTimeSoAddShapeDraggedToOverlaps = true;
  for (let eachShape of allShapes) {
    if (eachShape === gameShape || eachShape === theShape) continue;

    let shapeToTestPolyBool = {
      regions: eachShape.getPointsArray(true),
      inverted: false,
    };
    let isPerfectlyInside = false;

    if (
      PolyBool.difference(shapeDraggedPolyBool, shapeToTestPolyBool).regions
        .length === 0
    ) {
      // shapeDragged is perfectly inside another shape


      eachShape.addOnTopTemp(theShape);
      eachShape.addOnTop(theShape);
      isPerfectlyInside = true;
    } else if (
      PolyBool.difference(shapeToTestPolyBool, shapeDraggedPolyBool).regions
        .length === 0
    ) {
      // shapeDragged is perfectly inside another shape
      theShape.addOnTopTemp(eachShape);
      theShape.addOnTop(eachShape);
      isPerfectlyInside = true;
    }

    if (isPerfectlyInside === true) continue;

    if (firstTimeSoAddShapeDraggedToOverlaps === true) {
      firstTimeSoAddShapeDraggedToOverlaps = false;
      overlaps.push(theShape.getPointsArray(true));
      superImposedShapeChildren.add(theShape);
      allShapes.delete(theShape);
    }
    overlaps.push(eachShape.getPointsArray(true));
    superImposedShapeChildren.add(eachShape);
    allShapes.delete(eachShape);
  }

  for (let each of overlaps) {
    overlapShapes.push({ regions: each, inverted: false });
  }

  if (overlapShapes.length === 0) return;
  var segments = PolyBool.segments(overlapShapes[0]);
  for (var i = 1; i < overlapShapes.length; i++) {
    var seg2 = PolyBool.segments(overlapShapes[i]);
    var comb = PolyBool.combine(segments, seg2);
    segments = PolyBool.selectUnion(comb);
  }
  let final = PolyBool.polygon(segments);

  for (let eachPointArray of final.regions) {
    let obstacleOverlap = new Obstacle([209, 209, 209]);
    let points = [];
    for (let i = 0; i < eachPointArray.length; i += 1) {
      points.push(
        new ObstaclePoint(
          eachPointArray[i][0],
          eachPointArray[i][1],
          obstacleOverlap
        )
      );
    }
    obstacleOverlap.setVerticesLinkedList(points);

    superImposedShapes.add(obstacleOverlap);
    allShapes.add(obstacleOverlap);
  }
}

function dealWithGameShapeIntersection() {
  cutShapes.clear();
  uncutShapes.clear();
  let shapesToCut = new Set();
  for (let eachShape of allShapes) {
    if (eachShape === gameShape) continue;

    if (checkIfShapeIntersectsWithGameShape(eachShape)) {
      let polyOutside = PolyBool.difference(
        { regions: eachShape.getPointsArray(true), inverted: false },
        { regions: gameShapeSmaller.getPointsArray(true), inverted: false }
      );
      let polyInside = PolyBool.difference(
        { regions: eachShape.getPointsArray(true), inverted: false },
        { regions: polyOutside.regions, inverted: false }
      );

      if (polyInside.regions.length === 0) return;

      for (let j = 0; j < polyInside.regions.length; j += 1) {
        let obstacleCut = new Obstacle([209, 209, 209]);
        let points = [];
        for (let i = 0; i < polyInside.regions[j].length; i += 1) {
          points.push(
            new ObstaclePoint(
              polyInside.regions[j][i][0],
              polyInside.regions[j][i][1],
              obstacleCut
            )
          );
        }
        obstacleCut.setVerticesLinkedList(points);
        shapesToCut.add([eachShape, obstacleCut]);
        for (let each of eachShape.getOnTop()) obstacleCut.addOnTop(each);
      }
    }
  }

  for (let each of shapesToCut) {
    allShapes.delete(each[0]);
    allShapes.add(each[1]);
    cutShapes.add(each[1]);
    uncutShapes.add(each[0]);
  }
}

function updateVertexArrayDistancetoMousePress(shape, p) {
  shape.resetVerticesDistancetoMousePress();

  let currentVertex = shape.getVertexHead();
  do {
    deltaX = p.getX() - currentVertex.getX();
    deltaY = p.getY() - currentVertex.getY();
    shape.setVerticesDistancetoMousePress(currentVertex, [deltaX, deltaY]);
    currentVertex = currentVertex.getPointNext();
  } while (currentVertex !== shape.getVertexHead());
}

function checkIfShapeIntersectsWithGameShape(theShape) {
  let currentVertex = theShape.getVertexHead();
  do {
    if (
      classifyPoint(
        gameShape.getPointsArray(),
        currentVertex.getArrayForm()
      ) === 1
    )
      return true;

    currentVertex = currentVertex.getPointNext();
  } while (currentVertex !== theShape.getVertexHead());
  return false;
}
