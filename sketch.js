
let guardArray = []; // global array of all security guards made
let allVertices = []; // global array of all the vertices on the map
function setup() {
  createCanvas(720, 400);
  frameRate(30);
}
function draw() {
  background(102);
}

// from the HTML form
function SecurityGuardInput() {
  if (guardArray.length === 0) {
    guard = new SecurityGuard("yellow");
  } else {
    guard = new SecurityGuard("orange");
  }
  guardArray.push(guard);
  guard.addAllVertices(allVertices);
  guard.sortVertices();
}


class SecurityGuard {
  constructor(color) {
    this.name = color;
    this.sortedVertices = [];
    
  }

  addAllVertices(array) {
    this.sortedVertices = [];
    for (let i = 0; i < array.length; i++) {
        this.sortedVertices.push(array[i]);
    }
    //this.sortedVertices = array;
  }

  sortVertices() {
    console.log("here", this.name);

    if (this.name === "orange") {
      this.sortedVertices[0] = "bruh";
    }

    if (guardArray.length === 2) {
      for (let i = 0; i < this.sortedVertices.length; i++) {
        console.log(guardArray[0].getName(), guardArray[0].sortedVertices[i]);
      }
      for (let i = 0; i < this.sortedVertices.length; i++) {
        console.log(guardArray[1].getName(), guardArray[1].sortedVertices[i]);
      }
    }
  }

  getName() {
    return this.name;
  }
}