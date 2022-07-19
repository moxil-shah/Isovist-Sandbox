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
    guard = new SecurityGuard(100, 100, securityGuardNames.pop());
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
  window.scrollTo(0, 0);
  visualizeGuard.scrollBar.style.display = "none";
  visualizeGuard = -1;
  controlPanel.style.display = "none";
}

function removeGuard() {
  allGuards.delete(visualizeGuard.getGuard());
  securityGuardNames.push(visualizeGuard.getGuard().getName());
  document.getElementById("addBtn").disabled = false;
  document.getElementById("addBtn").innerText = "Add Guard";
  exitGuardControlPanel();
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
