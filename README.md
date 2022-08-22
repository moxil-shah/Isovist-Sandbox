
# Isovist Sandbox
[Isovist Sandbox](https://moxil-shah.github.io/Isovist-Sandbox/) is a desktop oriented and responsive website that allows
users to experiment with different kinds
of isovists for different kinds of polygons.

According to [wikipedia](https://en.wikipedia.org/wiki/Isovist), 
"a single isovist is the volume of space visible from a given point in space, 
together with a specification of the location of that point." Frankly, I don't have a better definition.


I developed this project to strengthen my relationship with mathematics, not to expand my tech stack. Hence, I used very straight forward technologies and don't have any server side components 
(as you can see below). However, the algorithm I implemented is called Asano's Algorithm and runs in O (n lg n). Asano's Algorithm is quite non-trivial (see credits for reference source). 
If I used a trival algorithm, I would be done this project in a fourth of the time I actually took.
But the goal for all of this was to once again, strengthen my relationship with mathematics.

## Tech Stack

**Client:** HTML, CSS, JS, jQuery, p5.js



## Acknowledgements

### Dependencies Used

- [Boolean operations on polygons](https://github.com/velipso/polybooljs)

### Code Templates Used
 - [AVL Tree](https://www.geeksforgeeks.org/avl-tree-set-2-deletion/?ref=lbp)



## Preview
### Starting
![Starting](https://raw.githubusercontent.com/moxil-shah/Isovist-Sandbox/master/images/Demo1.png)

### Single Guard
![Starting](https://raw.githubusercontent.com/moxil-shah/Isovist-Sandbox/master/images/Demo2.png)

### Single Guard with 2 Squares
![Starting](https://raw.githubusercontent.com/moxil-shah/Isovist-Sandbox/master/images/Demo3.png)

### Museum with Shapes
![Starting](https://raw.githubusercontent.com/moxil-shah/Isovist-Sandbox/master/images/Demo4.png)

### Random
![Starting](https://raw.githubusercontent.com/moxil-shah/Isovist-Sandbox/master/images/Demo5.png)

### Visualization in Action
![Starting](https://raw.githubusercontent.com/moxil-shah/Isovist-Sandbox/master/images/Demo6.png)

## Credits

[Helped me understand the naïve alogorithm to make an isovist.](https://www.redblobgames.com/articles/visibility/)

[Helped me understand the high-level technicalities of Asano's algorithm.](https://www.cambridge.org/core/books/visibility-algorithms-in-the-plane/BCD82CF5FE665832FAC4AAAB68305AF1) Specifically, section 2.3 of the book.

And finally, big big inspiration from Clément Mihailescu's [Pathfinder Visualizer](https://clementmihailescu.github.io/Pathfinding-Visualizer/).
