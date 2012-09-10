/*
 * Point
 * Visit http://volcanojs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2012 gstech.co.kr, inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
(function (window) {
    /**
     * VolcanoJS Project
     *
     * @class Point
     * @constructor
     * @author Jeon jae youl
     *
     */

    var Point = function (x, y) {
        this.initialize();
        this.x = x;
        this.y = y;
    };

    var p = Point.prototype = new volcano.Core();

    p.x = 0;
    p.y = 0;

    p.Core_initialize = p.initialize;

    p.initialize = function () {
        this.Core_initialize(); //super
    };

    /**
     * 2개의 포인트의 값을 가산해서 새로운 포인트를 반환한다.
     * @param v Point
     * @return {*}
     */
    p.add = function (v) {
        var vx = this.x + v.x;
        var vy = this.y + v.y;

        return new Point(vx, vy);
    };

    /**
     * 똑같은 좌표의 포인트를 clone 한다.
     * @return {*}
     */
    p.clone = function () {
        return new Point(this.x, this.y);
    };

    /**
     * 2개의 포인트의 x, y값이 동일한지 판단한다.
     * @param toCompare 비교할 Point
     * @return {Boolean}
     */
    p.equals = function (toCompare) {
        var result = false;
        if (this.x == toCompare.x && this.y == toCompare.y) {
            result = true;
        }
        return result;
    };

    // TODO 사용 될 경우 구현
    p.normalize = function (thickness) {
    };

    // TODO 사용 될 경우 구현
    p.offset = function (dx, dy) {
    };

    // TODO 사용 될 경우 구현
    p.subtract = function (v) {
    };

    // static function

    // TODO 사용 될 경우 구현
    Point.polar = function (len, angle) {
    };

    // TODO 사용 될 경우 구현
    Point.interpolate = function (pt1, pt2, f) {
    };

    /**
     * 두점 사이의 거리를 반환한다.
     * @param pt1 x
     * @param pt2 y
     * @return {Number}
     */
    Point.distance = function (pt1, pt2) {
        var vx = pt1.x - pt2.x;
        var vy = pt1.y - pt2.y;

        return Math.sqrt(vx * vx + vy * vy);
    };

    this.window.volcano.Point = Point;

})(window);