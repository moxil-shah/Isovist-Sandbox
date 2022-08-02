let page1 =
  '<div class="modal-header text-center"> ' +
  '<h4 class="modal-title w-100">Welcome to Isovist Sandbox.</h4> ' +
  '<div id="tutorialPageNumber">1/5</div> ' +
  "</div> " +
  '<div class="modal-body">Here\'s a quick tutorial of the application.</div> ';

let page2 =
  '<div class="modal-header text-center"> ' +
  '<h4 class="modal-title w-100">What\'s the Point of This?</h4> ' +
  '<div id="tutorialPageNumber">2/5</div> ' +
  "</div> " +
  '<div class="modal-body"> ' +
  " Imagine that you are a manager of a big museum like the Lourve. Since your " +
  "museum is home to countless pieces of priceless art, you employ security " +
  "guards. Let's say each security guard has a 360-degree field of view. From a " +
  "bird's eye view, what does the visibility region for each security guard look " +
  "like? This visibility region is called an isovist." +
  "<br /> " +
  "<br /> " +
  "This application visualizes the visibility regions of these said security guards in " +
  "a mock museum. And the best part is that you get to be in the manager's shoes. " +
  "Click &gt to find out what that means. " +
  "</div> ";

let page3 =
  '<div class="modal-header text-center"> ' +
  '<h4 class="modal-title w-100">Guard Functionality</h4> ' +
  '<div id="tutorialPageNumber">3/5</div> ' +
  "</div> " +
  '<div class="modal-body ">' +
  "Click the Add Guard button to add a security guard. " +
  "<br /> " +
  "<br /> " +
  "To pick up a guard, click any guard once. Now, it will follow your cursor " +
  "without you having to hold down the left button on your mouse or trackpad. To " +
  "place a guard back down, just click again. " +
  "<br /> " +
  "<br /> " +
  "To visualize the algorithm that makes the isovist, double-click any guard. " +
  "Then, pick a speed and press Visualize. You can also use the slider to " +
  "visualize the isovist at any angle from 0 to 360 degrees. For the especially " +
  "curious, the algorithm I implemented goes by the name of Asano's Algorithm. " +
  "The algorithm runs in O(n lg n) with the help of an AVL tree. " +
  "</div> ";

let page4 =
  '<div class="modal-header text-center"> ' +
  '<h4 class="modal-title w-100">Shape Functionality</h4> ' +
  '<div id="tutorialPageNumber">4/5</div> ' +
  "</div> " +
  '<div class="modal-body"> ' +
  "To add a shape with 𝑥 sides, enter 𝑥 into the input field and click Add Shape. " +
  "Minimum number of sides is 3, maximum is 30. " +
  "<br /> " +
  "<br /> " +
  "To pick up a shape, click any shape once. Now, it will follow your cursor " +
  "without you having to hold down the left button on your mouse or trackpad. To " +
  "place a shape back down, just click again. " +
  "<br /> " +
  "<br /> " +
  "To pick up a shape's vertex, click any shape's vertex once. Now, it will " +
  "follow your cursor without you having to hold down the left button on your " +
  "mouse or trackpad. To place a shape's vertex back down, just click again. " +
  "<br /> " +
  "<br /> " +
  "To change how the shape looks, double-click any shape and click Rotate or " +
  "Change Size. Then use the slider however you like. " +
  "</div> ";

let page5 =
  '<div class="modal-header text-center"> ' +
  '<h4 class="modal-title w-100">The Canvas is Yours</h4> ' +
  '<div id="tutorialPageNumber">5/5</div> ' +
  "</div> " +
  '<div class="modal-body"> ' +
  "The rest is pretty intuitive. Oh, and if you want to check out my source code, " +
  "here's the " +
  '<a href="https://github.com/moxil-shah/Art-Gallery-Problem">github repo</a>. ' +
  "Enjoy. " +
  "<br /> " +
  "<br /> " +
  "- Moxil " +
  "</div> ";

let tutorialPages = [page1, page2, page3, page4, page5];

$(window).on("load", function () {
  $("#myModal").modal("show");
  document.getElementById("modalContent").innerHTML = page1;
  document.getElementById("prev").style.display = "none";
});

function modalQuit() {
  $("#myModal").modal("hide");
}

function nextCard() {
  let index = parseInt(
    document.getElementById("tutorialPageNumber").innerHTML[0]
  );

  if (index !== 4) document.getElementById("next").style.display = "block";
  else document.getElementById("next").style.display = "none";
  document.getElementById("prev").style.display = "block";

  document.getElementById("modalContent").innerHTML = tutorialPages[index];
}

function prevCard() {
  let index = parseInt(
    document.getElementById("tutorialPageNumber").innerHTML[0]
  );

  if (index !== 2) document.getElementById("prev").style.display = "block";
  else document.getElementById("prev").style.display = "none";
  document.getElementById("next").style.display = "block";

  document.getElementById("modalContent").innerHTML = tutorialPages[index - 2];
}
