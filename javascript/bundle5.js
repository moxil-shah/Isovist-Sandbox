(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
var expander = require("shape-expand-reduce");
global.window.expander = expander;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"shape-expand-reduce":2}],2:[function(require,module,exports){
//Constants
var rad180deg = Math.PI,
    rad90deg = Math.PI * 0.5,
    rad45deg = Math.PI * 0.25;

/**
 * Reports if contents of points are compatible
 * @param points {Array}
 * @returns {boolean}
 */
var pointsAreValid = function(points){
    for(var i = 0; i < points.length; i++) {
        var item = points[i];
        if(item instanceof Array) { // Check valid Array for 0 (x), 1 (y) items
            if (
                item.length < 2 ||
                typeof item[0] != "number" ||
                typeof item[1] != "number"
            ) return false;

        } else if(typeof item == "object" && item != null) { // Check valid object for x, y properties
            if (
                !item.hasOwnProperty("x") ||
                !item.hasOwnProperty("y") ||
                typeof item.x != "number" ||
                typeof item.y != "number"
            ) return false;

        } else { // Report fail as this must be non-null object or Array
            return false;
        }
    }
    return true;
}

/**
 * Collection of Points
 * @param {Array} points
 * @constructor
 */
var Points = function(points){
    var self = this;
    this.points = points.map(function(p, id){
        if(p instanceof Array) {
            return new Point(p[0], p[1], id, self);
        } else if(typeof p == "object" && p != null) {
            return new Points(p.x, p.y, id, self);
        } else {
            return new Point(0, 0, id, self); //0, 0 point as default
        }
    });
    this.length = points.length;
};

/**
 * Maps the points and reports mapped array
 * @param callback {Function}
 * @returns {Array}
 */
Points.prototype.map = function(callback){
    return this.points.map(callback);
};

/**
 * Reports item on given index
 * This method also goes in circles - so if index is < 0 or >length it modifies index to return item in collection
 * @param id {number}
 * @returns {Point|null}
 */
Points.prototype.get = function(id){
    if(this.length == 0) return null;
    while(id < 0) id += this.length - 1;
    while(id >= this.length) id -= this.length - 1;
    return this.points[id];
};

/**
 * Single point in our shape
 * @param x {number} position x
 * @param x {number} position y
 * @param id {number} id in our collection
 * @param points {Points} collection
 * @constructor
 */
var Point = function(x, y, id, points){
    this.x = x;
    this.y = y;
    this.id = id;
    this.points = points;
};

/**
 * Reports next point in collection
 * @returns {Point}
 */
Point.prototype.next = function(){
    return this.points.get(this.id + 1);
};

/**
 * Reports previous point in collection
 * @returns {Point}
 */
Point.prototype.previous = function(){
    return this.points.get(this.id - 1);
};

/**
 * Reports angle between 2 points
 * @param point {Point} point towards the angle should be computed
 * @returns {number}
 */
Point.prototype.angleTo = function(point){
    return Math.atan2(point.y - this.y, point.x - this.x) - rad90deg;
};

/**
 * Reports distance between 2 points
 * @param point {Point} point towards the distance should be computed
 * @returns {number}
 */
Point.prototype.distanceTo = function(point){
    return Math.sqrt(Math.pow(this.y - point.y,2) + Math.pow(this.x - point.x,2));
};

/**
 * Returns shape that is expanded/reduced based on given factor
 * @param points {Array} collection of items (single items must be {x:number,y:number} or [x,y])
 * @param factor {number=1.0} how much should the shape expand (positive) or reduce (negative)
 * @param absolute {boolean=true} absolute (expand by number) or relative (expand by coeficient) factor.
 * @returns {Array} list of resulting points (single items {x:number,y:number} or [x,y] based on given points input format)
 */
module.exports = function(points, factor, absolute) {
    // Check for default arguments
    if (typeof factor != "number") factor = 1.0;
    if (typeof absolute != "boolean") absolute = true;

    // Validate contents
    if (!(points instanceof Array)) { // Check for valid array
        console.warn("Points must be an Array. Returning empty array.");
        return [];
    } else if (points.length < 3) { // Report issue if shape does not have at least 3 points
        console.warn("Shape must have at least 3 points. Returning empty array.");
        return [];
    } else if(!pointsAreValid(points)) { // Validate object contents
        console.warn("Points are not valid. Use {x:number,y:number} or [x,y] for single object. Returning empty array.");
        return [];
    }

    //TODO: Implement relative factor
    if (!absolute) {
        console.warn("Relative factor is not yet implemented. Returning empty array.");
        return [];
    }

    // Should we output Array of Arrays or objects
    var outputObjects = true;
    if(points[0] instanceof Array) {
        outputObjects = false;
    }

    // Return mapped array with recomputed points
    return new Points(points).map(function(point, id){
        // Prepare shortcuts for points
        var cp = point,
            pp = point.previous(),
            np = point.next();

        // Prepare angles and distances
        var l1Angle = -cp.angleTo(pp),
            l2Angle = -cp.angleTo(np),
            outerAngle = -pp.angleTo(np),
            l1Distance = cp.distanceTo(pp),
            l2Distance = cp.distanceTo(np),
            outerDistance = pp.distanceTo(np) * (l1Distance/(l1Distance+l2Distance));

        // Compute points for outer/inner position
        var x = (Math.sin(outerAngle) * outerDistance) + pp.x,
            y = (Math.cos(outerAngle) * outerDistance) + pp.y;

        // Fix the angle based on outer/inner position
        var angle = -cp.angleTo({x:x, y:y});
        if(l1Angle > l2Angle) {
            if(Math.abs(l1Angle-l2Angle) < rad180deg) angle -= rad180deg;
        } else {
            if(Math.abs(l1Angle-l2Angle) > rad180deg) angle -= rad180deg;
        }

        // Return new point (eiter object or Array)
        if(outputObjects) {
            // Return new point as object
            return {
                x: (Math.sin(angle) * factor) + cp.x,
                y: (Math.cos(angle) * factor) + cp.y
            };
        } else {
            // Return new point as Array
            return [
                (Math.sin(angle) * factor) + cp.x,
                (Math.cos(angle) * factor) + cp.y
            ];
        }
    });
}
},{}]},{},[1]);
