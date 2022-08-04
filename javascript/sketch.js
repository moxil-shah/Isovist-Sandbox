/* title: Isovist Sandbox
 * author: Moxil Shah
 * Date Created: May 1, 2022
 */

////// file contains all drawing related functions //////

// global variables //
let allShapes = new Set(); // global array of all shapes made
let allGuards = new Set(); // global array of all security guards made
let superImposedShapes = new Set(); // global array of superimposed shapes
let superImposedShapeChildren = new Set(); // global array of shapes that made up superimposed shapes
let uncutShapes = new Set(); // uncut shapes from gameShape
let cutShapes = new Set(); // cut shapes from gameShape
const securityGuardNames = [
  [255, 165, 0],
  [28, 197, 220],
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 0],
  [255, 255, 0],
]; // guard names are their colors
const ROUND_FACTOR = 10000; // used for all rounding calculations in this project
let shapeDragged = -1;
let shapesPointDragged = -1;
let pointDragged = -1;
let guardDragged = -1;
let visualizeGuard = -1;
let shapeToHandle = -1;
let gameShape;
let guardControlPanel;
let shapeControlPanel;
let madeRoom = false;
let madeRoomDoubleClick = false;


/*
 * Function description: P5 function that sets up the canvas.
 */
function setup() {
  let canvas = createCanvas(windowWidth - getScrollBarWidth(), windowHeight);
  canvas.parent("canvasDiv");
  canvas.style("margin-bottom", "-5px");
  frameRate(60);
  polygon(null, null, null, 4); // gameShape
  guardControlPanel = document.getElementById("guardControlPanel");
  shapeControlPanel = document.getElementById("shapeControlPanel");
}

/*
 * Function description: If view port is resized, reset everything (pretend starting from scratch after tutorial)
 */
function windowResized() {
  shapeDragged = -1;
  shapesPointDragged = -1;
  pointDragged = -1;
  guardDragged = -1;
  clearAll();
  if (shapeToHandle !== -1) exitShapeControlPanel();
  if (visualizeGuard !== -1) exitGuardControlPanel();

  resizeCanvas(windowWidth - getScrollBarWidth(), windowHeight);

  document.getElementById("customRange").style.width =
    ((width - 100) * 0.5).toString() + "px";
  document.getElementById("shapeRangeSize").style.width =
    ((width - 100) * 0.5).toString() + "px";
  document.getElementById("shapeRangeRotate").style.width =
    ((width - 100) * 0.5).toString() + "px";

  let currentVertex = gameShape.getVertexHead().getPointNext();
  currentVertex.setX(width - 50);
  currentVertex = currentVertex.getPointNext();
  currentVertex.setX(width - 50);
  currentVertex.setY(height - 50);
  currentVertex = currentVertex.getPointNext();
  currentVertex.setY(height - 50);

  $("#navbarSupportedContent :input").attr("disabled", false);
  document.getElementById("dropDownTemplates").style.visibility = "visible";
}

/*
 * Function description: In the name.
 * References: https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript
 */
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

/*
 * Function description: MAIN LOOP THAT REPEATS INDEFINITELY TO DRAW AND CALCULATE STUFF.
 */
function draw() {
  background(34, 40, 49);
  dragSecurityGuard();
  dragPoint(false);
  dragShape(false);
  if (shapeToHandle !== -1) shapeToHandle.masterMethod(false);
  renderAllShapes();
  if (visualizeGuard === -1) renderAllSecurityGuardsAndIsovists();
  if (visualizeGuard !== -1) {
    visualizeGuard.animateMasterMethod();
    visualizeGuard.getSecurityGuard().drawSecurityGuard();
  } else renderAllShapesPoints();
}

/*
 * Function description: When user clicks add shape, this makes the shape and sets it to shapeDragged
 */
function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let vertices = []; // to be passed into Shape constructor
  let newObstacle = null;

  if (allShapes.size === 0) {
    // means draw the gameShape
    newObstacle = new Obstacle([0, 0, 0]);

    gameShape = newObstacle;
    let stage = [
      new ObstaclePoint(50, 50, newObstacle),
      new ObstaclePoint(width - 50, 50, newObstacle),
      new ObstaclePoint(width - 50, height - 50, newObstacle),
      new ObstaclePoint(0 + 50, height - 50, newObstacle),
    ];
    for (let i = 0; i < stage.length; i += 1) {
      vertices.push(stage[i]);
    }
    newObstacle.setVerticesLinkedList(vertices);

    allShapes.add(newObstacle);
  } else {
    newObstacle = new Obstacle([209, 209, 209]);

    let preventRoundingError = 0;
    for (let i = 0; i < TWO_PI; i += angle) {
      preventRoundingError += 1;
      if (preventRoundingError > npoints) break;

      let sx = x + cos(i) * radius;
      let sy = y + sin(i) * radius;
      vertices.push(new ObstaclePoint(sx, sy, newObstacle));
    }
    newObstacle.setVerticesLinkedList(vertices);
    allShapes.add(newObstacle);

    updateVertexArrayDistancetoMousePress(
      newObstacle,
      new Point(mouseX, mouseY)
    );
    shapeDragged = newObstacle;
  }

  // set angle for each vertex for each guard
  for (let eachShape of allShapes) {
    let currentVertex = eachShape.getVertexHead();
    do {
      for (let guard of allGuards) {
        currentVertex.setSecurityGuardAngle(guard);
      }
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== eachShape.getVertexHead());
  }

  // set angles for guards and then sort vertices by angle
  for (let guard of allGuards) {
    guard.addAllVertices();
    guard.sortVertices();
  }
}

/*
 * Function description: Same as polgon function above but no dragging.
 */
function polygonNoDrag(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  let vertices = []; // // to be passed into Shape constructor
  let newObstacle = new Obstacle([209, 209, 209]);

  let preventRoundingError = 0;
  for (let i = 0; i < TWO_PI; i += angle) {
    preventRoundingError += 1;
    if (preventRoundingError > npoints) break;

    let sx = x + cos(i) * radius;
    let sy = y + sin(i) * radius;
    vertices.push(new ObstaclePoint(sx, sy, newObstacle));
  }
  newObstacle.setVerticesLinkedList(vertices);
  allShapes.add(newObstacle);
  dealWithShapeIntersectionWithArugment(newObstacle, true);
  dealWithGameShapeIntersection();
  superImposedShapes.clear();
  superImposedShapeChildren.clear();
  cutShapes.clear();
  uncutShapes.clear();
  for (let eachShape of allShapes) eachShape.clearOnTopTemp();

  // set angle for each vertex for each guard
  for (let eachShape of allShapes) {
    let currentVertex = eachShape.getVertexHead();
    do {
      for (let guard of allGuards) {
        currentVertex.setSecurityGuardAngle(guard);
      }
      currentVertex = currentVertex.getPointNext();
    } while (currentVertex !== eachShape.getVertexHead());
  }

  // set angles for guards and then sort vertices by angle
  for (let guard of allGuards) {
    guard.addAllVertices();
    guard.sortVertices();
  }
}

/*
 * Function description: Draw all guards and their isovists.
 */
function renderAllSecurityGuardsAndIsovists() {
  // draw isovists
  for (let guard of allGuards) {
    if (guardDragged !== -1) guard = guardDragged; // if guard is picked up, only draw the isovist for that guard
    if (guard.outsideGameShape() === true) continue;
    guard.visibleVertices();
    guard.getIsovist().drawIsovist(guard, 100, 0);
    if (guardDragged !== -1) break;
  }
  // draw guards
  for (let guard of allGuards) guard.drawSecurityGuard();
}

/*
 * Function description: Recursive function that draws the shapes on top last and the
 * shapes on the botton first.
 */
function drawAllOnTop(shapesToDraw) {
  for (let eachShape of shapesToDraw) {
    eachShape.drawShape(255, false);
    drawAllOnTop(eachShape.getOnTop());
  }
}

/*
 * Function description: Draws all shapes.
 */
function renderAllShapes() {
  for (let eachShape of allShapes) {
    eachShape.drawShape(255, false);

    drawAllOnTop(eachShape.getOnTop());
  }
}

/*
 * Function description: Draws all the shapes' points.
 */
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

/*
 * Function description: Makes intersecting shapes unionize.
 * Dependency used: https://github.com/velipso/polybooljs
 */
// function dealWithShapeIntersection() {
//   superImposedShapes.clear();
//   superImposedShapeChildren.clear();
//   let overlaps = [];
//   let overlapShapes = [];
//   for (let eachShape of allShapes) {
//     if (eachShape === gameShape) continue;
//     overlaps.push(eachShape.getPointsArray(true));
//     superImposedShapeChildren.add(eachShape);
//     allShapes.delete(eachShape);
//   }

//   for (let each of overlaps) {
//     overlapShapes.push({ regions: each, inverted: false });
//   }

//   var segments = PolyBool.segments(overlapShapes[0]);
//   for (var i = 1; i < overlapShapes.length; i++) {
//     var seg2 = PolyBool.segments(overlapShapes[i]);
//     var comb = PolyBool.combine(segments, seg2);
//     segments = PolyBool.selectUnion(comb);
//   }
//   let final = PolyBool.polygon(segments);

//   for (let eachPointArray of final.regions) {
//     let obstacleOverlap = new Obstacle([209, 209, 209]);
//     let points = [];
//     for (let i = 0; i < eachPointArray.length; i += 1) {
//       points.push(
//         new ObstaclePoint(
//           eachPointArray[i][0],
//           eachPointArray[i][1],
//           obstacleOverlap
//         )
//       );
//     }
//     obstacleOverlap.setVerticesLinkedList(points);

//     superImposedShapes.add(obstacleOverlap);
//     allShapes.add(obstacleOverlap);
//   }
// }

/*
 * Function description: Calculates shapes intersecting with each other.
 * Dependency used: https://github.com/velipso/polybooljs
 */
function dealWithShapeIntersectionWithArugment(theShape, end) {
  superImposedShapes.clear();
  superImposedShapeChildren.clear();

  for (let eachShape of allShapes) {
    eachShape.deleteOnTopTempFromOnTop();
    eachShape.clearOnTopTemp();
    eachShape.deleteFromOnTop(theShape);
  }

  let overlaps = [];
  let overlapShapes = [];
  let shapeDraggedPolyBool = {
    regions: theShape.getPointsArray(true),
    inverted: false,
  };

  overlaps.push(theShape.getPointsArray(true));
  superImposedShapeChildren.add(theShape);
  allShapes.delete(theShape);

  for (let eachShape of allShapes) {
    if (eachShape === gameShape || eachShape === theShape) continue;

    let shapeToTestPolyBool = {
      regions: eachShape.getPointsArray(true),
      inverted: false,
    };

    if (
      PolyBool.difference(shapeDraggedPolyBool, shapeToTestPolyBool).regions
        .length === 0 ||
      PolyBool.difference(shapeToTestPolyBool, shapeDraggedPolyBool).regions
        .length === 0
    ) {
      continue;
    }

    if (
      PolyBool.intersect(shapeDraggedPolyBool, shapeToTestPolyBool).regions
        .length === 0 // test edge case of two sqaures sharing an
    ) {
      continue;
    }
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
    obstacleOverlap = new Obstacle([209, 209, 209]);
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

    theShape = obstacleOverlap;
    shapeDraggedPolyBool = {
      regions: theShape.getPointsArray(true),
      inverted: false,
    };
    for (let eachShape of allShapes) {
      if (eachShape === gameShape || eachShape === theShape) continue;

      let shapeToTestPolyBool = {
        regions: eachShape.getPointsArray(true),
        inverted: false,
      };

      if (
        PolyBool.difference(shapeDraggedPolyBool, shapeToTestPolyBool).regions
          .length === 0
      ) {
        if (
          checkIfShapeIntersectsWithGameShape(theShape) === false &&
          theShape.getSharesGameShapeBorder() === false
        ) {
          eachShape.addOnTopTemp(theShape);
          eachShape.addOnTop(theShape);
        } else if (theShape.getSharesGameShapeBorder() === true) {
          superImposedShapeChildren.add(theShape);
          allShapes.delete(theShape);
        } else {
          allShapes.delete(theShape);
          superImposedShapes.delete(theShape);
        }
        if (end === true) {
          for (let each of superImposedShapeChildren) {
            eachShape.deleteFromOnTop(each);
          }
        }
      } else if (
        PolyBool.difference(shapeToTestPolyBool, shapeDraggedPolyBool).regions
          .length === 0
      ) {
        if (
          checkIfShapeIntersectsWithGameShape(eachShape) === false &&
          eachShape.getSharesGameShapeBorder() === false
        ) {
          theShape.addOnTopTemp(eachShape);
          theShape.addOnTop(eachShape);
        } else if (eachShape.getSharesGameShapeBorder() === true) {
          superImposedShapeChildren.add(eachShape);
          allShapes.delete(eachShape);
        } else {
          allShapes.delete(eachShape);
          superImposedShapes.delete(eachShape);
        }
      }
    }
  }
}

/*
 * Function description: Calculates shapes intersecting with gameShape.
 * Dependency used: https://github.com/velipso/polybooljs
 */
function dealWithGameShapeIntersection() {
  cutShapes.clear();
  uncutShapes.clear();
  let shapesToCut = new Set();
  for (let eachShape of allShapes) {
    if (eachShape === gameShape) continue;

    if (checkIfShapeIntersectsWithGameShape(eachShape)) {
      let polyOutside = PolyBool.difference(
        { regions: eachShape.getPointsArray(true), inverted: false },
        { regions: gameShape.getPointsArray(true), inverted: false }
      );
      let polyInside = PolyBool.difference(
        { regions: eachShape.getPointsArray(true), inverted: false },
        { regions: polyOutside.regions, inverted: false }
      );

      if (polyInside.regions.length === 0) return;

      for (let j = 0; j < polyInside.regions.length; j += 1) {
        let obstacleCut = new Obstacle([209, 209, 209]);
        obstacleCut.setSharesGameShapeBorder(true);
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

/*
 * Function description: Keeps the x and y distance from mouse press point p
 * to drag the shape around.
 */
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

/*
 * Function description: In the name.
 */
function checkIfShapeIntersectsWithGameShape(theShape) {
  let currentVertex = theShape.getVertexHead();
  do {
    if (checkIfPointIsOutsideGameShape(currentVertex.getArrayForm()))
      return true;

    currentVertex = currentVertex.getPointNext();
  } while (currentVertex !== theShape.getVertexHead());
  return false;
}
