var shaper = require("./index.js");

/**
 * Reports if shapes a & b are almost identical
 * @param a {Array}
 * @param b {Array}
 * @returns {boolean}
 */
var checkFloats = function(a,b){
    if(a.length != b.length) return false;

    for(var i = 0; i < a.length; i++) {
        if(
            a[i][0].toFixed(5) != b[i][0].toFixed(5) ||
            a[i][1].toFixed(5) != b[i][1].toFixed(5)
        ) return false;
    }

    return true;
};

/**
 * Create test case
 * @param title {string} title of test
 * @param shapeBefore {Array} points before transform
 * @param shapeExpected {Array} expected points after transform
 * @param ratio {number} ratio used for transform
 */
var doTest = function(title, shapeBefore, shapeExpected, ratio){
    var shapeGot = shaper(shapeBefore, ratio, true);
    if(!checkFloats(shapeGot, shapeExpected)) {
        console.warn('Test "' + title + '" failed!');
        console.warn("--------------------");
        console.warn("Got:");
        console.warn(shapeGot);
        console.warn("--------------------");
        console.warn("Expected:");
        console.warn(shapeExpected);
    } else {
        console.log('Test "' + title + '" ok!');
    }

}

/********************************************
*                TEST CASES
********************************************/

// Test case expanded triangle
doTest("Triangle (Expand)", [
    [0, 0],
    [10, 0],
    [0, 10],
    [0, 0]
], [
    [ -0.7071067811865476, -0.7071067811865475 ],
    [ 10.923879532511286, -0.38268343236508984 ],
    [ -0.3826834323650899, 10.923879532511286 ],
    [ -0.7071067811865476, -0.7071067811865475 ]
], -1);

// Test case reduced triangle
doTest("Triangle (Reduce)", [
    [0, 0],
    [10, 0],
    [0, 10],
    [0, 0]
], [
    [ 0.7071067811865476, 0.7071067811865475 ],
    [ 9.076120467488714, 0.38268343236508984 ],
    [ 0.3826834323650899, 9.076120467488714 ],
    [ 0.7071067811865476, 0.7071067811865475 ]
], 1);

// Test case expanded square
doTest("Square (Expand)", [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0]
], [
    [ -0.7071067811865476, -0.7071067811865475 ],
    [ 10.707106781186548, -0.7071067811865476 ],
    [ 10.707106781186548, 10.707106781186548 ],
    [ -0.7071067811865476, 10.707106781186548 ],
    [ -0.7071067811865476, -0.7071067811865475 ]
], -1);

// Test case reduced square
doTest("Square (Reduce)", [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
    [0, 0]
], [
    [ 0.7071067811865476, 0.7071067811865475 ],
    [ 9.292893218813452, 0.7071067811865476 ],
    [ 9.292893218813452, 9.292893218813452 ],
    [ 0.7071067811865476, 9.292893218813452 ],
    [ 0.7071067811865476, 0.7071067811865475 ]
], 1);