class Node {
  constructor(d) {
    this.left = null;
    this.right = null;
    this.theKey = d;
    this.getHeight = 1;
  }
}


// A utility function to get getHeight of the tree
function getHeight(N) {
  if (N == null) return 0;
  return N.getHeight;
}

// A utility function to get getMaximum of two integers
function getMax(a, b) {
  return a > b ? a : b;
}

// A utility function to right rotate subtree theRooted with y
// See the diagram given above.
function rightRotate(y) {
  let x = y.left;
  let T2 = x.right;

  // Perform rotation
  x.right = y;
  y.left = T2;

  // Update getHeights
  y.getHeight = getMax(getHeight(y.left), getHeight(y.right)) + 1;
  x.getHeight = getMax(getHeight(x.left), getHeight(x.right)) + 1;

  // Return new theRoot
  return x;
}

// A utility function to left rotate subtree theRooted with x
// See the diagram given above.
function leftRotate(x) {
  let y = x.right;
  let T2 = y.left;

  // Perform rotation
  y.left = x;
  x.right = T2;

  // Update getHeights
  x.getHeight = getMax(getHeight(x.left), getHeight(x.right)) + 1;
  y.getHeight = getMax(getHeight(y.left), getHeight(y.right)) + 1;

  // Return new theRoot
  return y;
}

// Get Balance factor of node N
function getBalance(N) {
  if (N == null) return 0;
  return getHeight(N.left) - getHeight(N.right);
}

function ainsert(node, theKey) {
  /* 1. Perform the normal BST rotation */
  if (node == null) return new Node(theKey);

  if (theKey < node.theKey) node.left = ainsert(node.left, theKey);
  else if (theKey > node.theKey) node.right = ainsert(node.right, theKey);
  // Equal theKeys not allowed
  else return node;

  /* 2. Update getHeight of this ancestor node */
  node.getHeight = 1 + getMax(getHeight(node.left), getHeight(node.right));

  /* 3. Get the balance factor of this ancestor
    node to check whether this node became
    Wunbalanced */
  let balance = getBalance(node);

  // If this node becomes unbalanced, then
  // there are 4 cases Left Left Case
  if (balance > 1 && theKey < node.left.theKey) return rightRotate(node);

  // Right Right Case
  if (balance < -1 && theKey > node.right.theKey) return leftRotate(node);

  // Left Right Case
  if (balance > 1 && theKey > node.left.theKey) {
    node.left = leftRotate(node.left);
    return rightRotate(node);
  }

  // Right Left Case
  if (balance < -1 && theKey < node.right.theKey) {
    node.right = rightRotate(node.right);
    return leftRotate(node);
  }

  /* return the (unchanged) node pointer */
  return node;
}

/* Given a non-empty binary search tree, return the
node with minimum theKey value found in that tree.
Note that the entire tree does not need to be
searched. */
function minValueNode(node) {
  let current = node;

  /* loop down to find the leftmost leaf */
  while (current.left != null) current = current.left;

  return current;
}

function deleteNode(theRoot, theKey) {
  // STEP 1: PERFORM STANDARD BST DELETE
  if (theRoot == null) return theRoot;

  // If the theKey to be deleted is smaller than
  // the theRoot's theKey, then it lies in left subtree
  if (theKey < theRoot.theKey) theRoot.left = deleteNode(theRoot.left, theKey);
  // If the theKey to be deleted is greater than the
  // theRoot's theKey, then it lies in right subtree
  else if (theKey > theRoot.theKey) theRoot.right = deleteNode(theRoot.right, theKey);
  // if theKey is same as theRoot's theKey, then this is the node
  // to be deleted
  else {
    // node with only one child or no child
    if (theRoot.left == null || theRoot.right == null) {
      let temp = null;
      if (temp == theRoot.left) temp = theRoot.right;
      else temp = theRoot.left;

      // No child case
      if (temp == null) {
        temp = theRoot;
        theRoot = null;
      } // One child case
      else theRoot = temp; // Copy the contents of
      // the non-empty child
    } else {
      // node with two children: Get the inorder
      // successor (smallest in the right subtree)
      let temp = minValueNode(theRoot.right);

      // Copy the inorder successor's data to this node
      theRoot.theKey = temp.theKey;

      // Delete the inorder successor
      theRoot.right = deleteNode(theRoot.right, temp.theKey);
    }
  }

  // If the tree had only one node then return
  if (theRoot == null) return theRoot;

  // STEP 2: UPDATE getHeight OF THE CURRENT NODE
  theRoot.getHeight = getMax(getHeight(theRoot.left), getHeight(theRoot.right)) + 1;

  // STEP 3: GET THE BALANCE FACTOR OF THIS NODE (to check whether
  // this node became unbalanced)
  let balance = getBalance(theRoot);

  // If this node becomes unbalanced, then there are 4 cases
  // Left Left Case
  if (balance > 1 && getBalance(theRoot.left) >= 0) return rightRotate(theRoot);

  // Left Right Case
  if (balance > 1 && getBalance(theRoot.left) < 0) {
    theRoot.left = leftRotate(theRoot.left);
    return rightRotate(theRoot);
  }

  // Right Right Case
  if (balance < -1 && getBalance(theRoot.right) <= 0) return leftRotate(theRoot);

  // Right Left Case
  if (balance < -1 && getBalance(theRoot.right) > 0) {
    theRoot.right = rightRotate(theRoot.right);
    return leftRotate(theRoot);
  }

  return theRoot;
}

// A utility function to print preorder traversal of
// the tree. The function also prints getHeight of every
// node
function preOrder(node) {
  if (node != null) {
    document.write(node.theKey + " ");
    preOrder(node.left);
    preOrder(node.right);
  }
}
