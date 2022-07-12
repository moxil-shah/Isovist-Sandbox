// asano's algorithm is complete except gimpy edge cases like if the top edge
// of a rectangle is on the initial intersect line
// self-intersect is done without testing test cases though becuase I am lazy

// code starts //
let allShapes = new Set(); // global array of all shapes made
let allGuards = new Set(); // global array of all security guards made
let allOverlappingShapes = new Set();
let allOverlappingChildren = new Set();

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
let gameShape;
let controlPanel;

function setup() {
  // let canvas = createCanvas($(window).width(), $(window).height());
  let canvas = createCanvas(windowWidth - getScrollBarWidth(), windowHeight);
  canvas.parent("canvasDiv");
  canvas.style("margin-bottom", "-5px");
  frameRate(60);
  polygon(null, null, null, 4);
  controlPanel = document.getElementById("controlPanel");
}

function windowResized() {
  clearAll();
  resizeCanvas(windowWidth - getScrollBarWidth(), windowHeight);
  let currentVertex = gameShape.getVertexHead().getPointNext();
  currentVertex.setX(width);
  currentVertex = currentVertex.getPointNext();
  currentVertex.setX(width);
  currentVertex.setY(height);
  currentVertex = currentVertex.getPointNext();
  currentVertex.setY(height);
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
  background(102);
  dragSecurityGuard();
  dragPoint();
  dragShape();
  renderAllShapes();
  if (visualizeGuard === -1) renderAllSecurityGuards();
  renderVertexClicked();
  if (visualizeGuard !== -1) {
    visualizeGuard.animateMasterMethod();
    visualizeGuard.getSecurityGuard().drawSecurityGuard();
  } else renderAllShapesPoints();
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
      new ObstaclePoint(0, 0, newObstacle),
      new ObstaclePoint(width, 0, newObstacle),
      new ObstaclePoint(width, height, newObstacle),
      new ObstaclePoint(0, height, newObstacle),
    ];
    for (let i = 0; i < stage.length; i += 1) {
      vertexes.push(stage[i]);
    }
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
  }

  newObstacle.setVerticesLinkedList(vertexes);
  newObstacle.setEdges();
  newObstacle.setConvexHull();
  allShapes.add(newObstacle);

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
    if (guard.outsideStage() === true) continue;
    guard.visibleVertices();
    guard.getIsovist().drawIsovist(guard, 100);
    if (guardDragged !== -1) break;
  }
  for (let guard of allGuards) guard.drawSecurityGuard();
}

function renderVertexClicked() {
  if (pointDragged !== -1) {
    push();
    strokeWeight(15);
    stroke([115, 119, 123]);
    point(pointDragged.getX(), pointDragged.getY());
    pop();
  }
}

function renderAllShapes() {
  for (let shape of new Set([...allShapes, ...allOverlappingChildren])) {
    shape.drawShape(255);
  }
}

function renderAllShapesPoints() {
  for (let shape of new Set([...allShapes, ...allOverlappingChildren])) {
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
    } while (currentVertex !== shape.vertexHead);
  }
}

function deleteTheSelfIntersect(shape) {
  let aVertex = shape.getVertexHead();
  do {
    if (aVertex.getNotSelfIntersect() === false) {
      aVertex.getPointPrev().setPointNext(aVertex.getPointNext());
      aVertex.getPointNext().setPointPrev(aVertex.getPointPrev());
      aVertex = aVertex.getPointPrev();
    }
    aVertex = aVertex.getPointNext();
  } while (aVertex !== shape.vertexHead);

  shape.setEdges();
}

function checkIfSelfIntersectingPolygon(theShape) {
  let intersectionPoints = new Map();
  for (let eachLine of theShape.getEdges()) {
    for (let shapeLine of theShape.getEdges()) {
      if (eachLine === shapeLine) continue;
      if (checkIfIntersect(eachLine, shapeLine) === true) {
        let intersectionPoint = findIntersection(eachLine, shapeLine);
        intersectionPoint = new ObstaclePoint(
          intersectionPoint.getX(),
          intersectionPoint.getY(),
          theShape
        );
        if (
          checkIfTwoPointsOverlapRounded(
            eachLine.getPoint1(),
            intersectionPoint,
            ROUND_FACTOR
          ) === false &&
          checkIfTwoPointsOverlapRounded(
            eachLine.getPoint2(),
            intersectionPoint,
            ROUND_FACTOR
          ) === false
        ) {
          if (intersectionPoints.get(eachLine) !== undefined)
            intersectionPoints.get(eachLine).push(intersectionPoint);
          else {
            intersectionPoints.set(eachLine, [intersectionPoint]);
          }
        }
      }
    }
  }
  return intersectionPoints;
}

function checkIfConvexHullIntersects(theShape) {
  let poly1Init = { regions: [theShape.getPointsArray()], inverted: false };
  let overlaps = [poly1Init];
  let overlapShapes = [theShape];
  for (let eachShape of allShapes) {
    if (eachShape === theShape || eachShape === gameShape) continue;
    let poly1 = { regions: [theShape.getPointsArray()], inverted: false };
    let poly2 = { regions: [eachShape.getPointsArray()], inverted: false };
    if (PolyBool.union(poly1, poly2).regions.length === 1) {
      overlaps.push(poly2);
      overlapShapes.push(eachShape);
    }
  }
  if (overlaps.length === 1) return;
  var segments = PolyBool.segments(overlaps[0]);
  for (var i = 1; i < overlaps.length; i++) {
    var seg2 = PolyBool.segments(overlaps[i]);
    var comb = PolyBool.combine(segments, seg2);
    segments = PolyBool.selectUnion(comb);
  }
  let obstacleOverlap = new UnionObstacle([209, 209, 209]);
  let allPoints = PolyBool.polygon(segments).regions;
  let points = [];
  for (let i = 0; i < allPoints[0].length; i += 1) {
    points.push(
      new ObstaclePoint(allPoints[0][i][0], allPoints[0][i][1], obstacleOverlap)
    );
  }
  obstacleOverlap.setVerticesLinkedList(points);
  obstacleOverlap.setEdges();
  for (let eachShape of overlapShapes) {
    obstacleOverlap.addChildrenObstacles(eachShape);
    eachShape.setUnionParent(obstacleOverlap);
    if (allShapes.delete(eachShape) === false) console.log("Big error!");
  }
  allOverlappingShapes.add(obstacleOverlap);
  for (let eachShape of obstacleOverlap.getChildrenObstacles()) {
    allOverlappingChildren.add(eachShape);
  }
  console.log(obstacleOverlap.getChildrenObstacles());
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
