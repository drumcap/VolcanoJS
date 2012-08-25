(function (window) {
    /**
     * VolcanoJS Project
     *
     * @class Rectangle
     * @constructor
     * @author Jeon jae youl
     *
     */
    var Rectangle = function (x, y, w, h) {
        this.initialize();

        if(arguments.length === 0){
            p._x = 0;
            p._y = 0;
            p._width = 0;
            p._height = 0;
            p._bottom = 0;
            p._top = 0;
            p._left = 0;
            p._right = 0;
            p._topLeft = new Point(0,0); // Point
            p._bottomRight = new Point(0,0); // Point
        }else{
            this._x = x;
            this._y = y;
            this._width = w;
            this._height = h;
            this._left = x;
            this._right = w + x;
            this._top = y;
            this._bottom = h + y;
            this._topLeft = new Point(x, y);
            this._bottomRight = new Point(w + x, h + y);
        }
    };

    var p = Rectangle.prototype = new volcano.Core();
    p.Core_initialize = p.initialize;

    p._x = 0;
    p._y = 0;
    p._width = 0;
    p._height = 0;
    p._bottom = 0;
    p._top = 0;
    p._left = 0;
    p._right = 0;
    p._topLeft = null; // Point
    p._bottomRight = null; // Point

    p.initialize = function () {
        this.Core_initialize(); //super
    };

    p.getX = function () {
        return this._x;
    };
    p.setX = function (x) {
        this._x = x;
        this._left = x;
        this._right = x + this._width;
        this._topLeft.x = x;
        this._bottomRight.x = x + this._width;
    };

    p.getY = function () {
        return this._y
    };
    p.setY = function (y) {
        this._y = y;
        this._top = y;
        this._bottom = y + this._height;
        this._topLeft.y = y;
        this._bottomRight.y = y + this._height;
    };

    p.getWidth = function () {
        return this._width
    };
    p.setWidth = function (w) {
        this._width = w;
        this._right = w + this._x;
        this._bottomRight.x = w + this._x;
    };

    p.getHeight = function () {
        return this._height
    };
    p.setHeight = function (h) {
        this._height = h;
        this._bottom = h + this._y;
        this._bottomRight.y = h + this._y;
    };

    p.getLeft = function () {
        return this._left
    };
    p.setLeft = function (left) {
        this._x = left;
        this._width = this._right - left;
        this._left = left;
        this._topLeft.x = left;
    };

    p.getRight = function () {
        return this._right
    };
    p.setRight = function (right) {
        this._width = right - this._left;
        this._right = right;
        this._bottomRight.x = right;
    };

    p.getTop = function () {
        return this._top
    };
    p.setTop = function (top) {
        this._y = top;
        this._height = this._bottom - top;
        this._top = top;
        this._topLeft.y = top;
    };

    p.getBottom = function () {
        return this._bottom
    };
    p.setBottom = function (bottom) {
        this._height = bottom - this._top;
        this._bottom = bottom;
        this._bottomRight.y = bottom;
    };

    p.getTopLeft = function () {
        return this._topLeft
    };
    p.setTopLeft = function (p) {
        this._x = p.x;
        this._y = p.y;
        this._width = this._right - p.x;
        this._height = this._bottom - p.y;
        this._left = p.x;
        this._top = p.y;
        this._topLeft.x = p.x;
        this._topLeft.y = p.y;
    };

    p.getBottomRight = function () {
        return this._bottomRight
    };
    p.setBottomRight = function (p) {
        this._width = p.x - this._x;
        this._height = p.y - this._y;
        this._right = p.x;
        this._bottom = p.y;
        this._bottomRight.x = p.x;
        this._bottomRight.y = p.y;
    };

    p.clone = function(){
        return new Rectangle(this._x, this._y, this._width, this._height);
    };

    p.contains = function(x, y){
        var result = false;
        if(x >= this._left && y >= this._top){ // x, y값이 rect의 left, top 값보다 크거나 같고
            if(x < this._right && y < this._bottom){ // x, y값이 rect의 right, bottom 보다 작으면
                result = true;
            }
        }
        return result;
    };

    // TODO 기능이 필요할 시 구현
    p.containsPoint = function(point){};

    // TODO 기능이 필요할 시 구현
    p.containsRect = function(rect){};

    // TODO 기능이 필요할 시 구현
    p.equals = function(toCompare){};

    // TODO 기능이 필요할 시 구현
    p.inflate = function(dx, dy){};

    // TODO 기능이 필요할 시 구현
    p.inflatePoint = function(point){};

    // TODO 기능이 필요할 시 구현
    p.intersection = function(toIntersect){};

    // TODO 기능이 필요할 시 구현
    p.intersects = function(toIntersect){};

    // TODO 기능이 필요할 시 구현
    p.isEmpty = function(){};

    // TODO 기능이 필요할 시 구현
    p.offset = function(dx, dy){};

    // TODO 기능이 필요할 시 구현
    p.offsetPoint = function(point){};

    // TODO 기능이 필요할 시 구현
    p.setEmpty = function(){};

    // TODO 기능이 필요할 시 구현
    p.union = function(toUnion){};

    this.window.volcano.Rectangle = Rectangle;

})(window);