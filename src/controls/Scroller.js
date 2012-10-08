/*
 * Scroller
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

    var Scroller = function (viewElement, sysMgr, option) {
        this.initialize(viewElement, sysMgr, option);
    };

    var p = Scroller.prototype = new volcano.VObject();
    /**
     * 실제 화면에 display 될 래퍼 Div
     * @type {*}
     * @private
     */
    p._domElement = null;

    p._scroller = null;

    var _sysMgr;
    var maxScrollX;
    var maxScrollY;
    var viewPort;
    var isMove = false;
    var isDown = false;
    var bounceback = 0.7;
    var backeasing = 0.1;
    var isXBacking = false;
    var isYBacking = false;
    var regX = 0, regY = 0,
        targetX = 0, targetY = 0,
        vX=0, vY=0;
    var oldX=0, oldY=0;
    var gravity = .5; //중력
    var bounce = -0.7; //튕길때는 음수로 힘이 약간 상쇄된다.
    var friction = .9; //마찰계수
    var downPoint;
    var scrollOption;
    var containerElement;
//    var scrollMode = "auto";

    p.VObject_initialize = p.initialize;
    /**
     * @param viewElement viewPort
     * @param sysMgr systemManager
     * @param option option
     */
    p.initialize = function (viewElement, sysMgr, option) {
        // 변수 초기화
        this._domElement = {};
        this._scroller = {};
        scrollOption = {
            scrollMode: "auto"
        };

        containerElement = viewElement.parent;
        for (i in option) scrollOption[i] = option[i];
        containerElement.setStyle("overflow","hidden")
;        viewPort = viewElement;
        _sysMgr = sysMgr;

        this._domElement = viewElement._domElement;
        this._domElement.volcanoObj = this; //FIXME 향후 메모리 문제가 생길 소지 있으니 개선해야함.
        this._scroller = this._domElement.children[0];

        maxScrollX = containerElement.width() - viewPort.width();
        maxScrollY = containerElement.height() - viewPort.height();

        _sysMgr.addEventListener(volcano.e.MOUSE_DOWN, onMouseDownHandler);

        _sysMgr.addEnterFrameListener(enterFrameHandler);
    };

    function enterFrameHandler() {
//        stats.update();

        if (isMove) {
            // Scroll 모드에 따라서 좌표 설정
            if(scrollOption.scrollMode === "auto"){
                viewPort.move(targetX, targetY, 0);
            }else if(scrollOption.scrollMode === "vertical"){
                viewPort.move(0, targetY, 0);
            }else if(scrollOption.scrollMode === "horizontal"){
                viewPort.move(targetX, 0, 0);
            }
        } else if(isDown){
            // TODO mouseDown 일 경우
        }else
         {
            var sx = viewPort.x(),
                sy = viewPort.y();

            if (Math.abs(vX)>0 || Math.abs(vY)>0) {
                vX = (Math.abs(vX) < 0.9) ? 0 : vX * friction;
                vY = (Math.abs(vY) < 0.9) ? 0 : vY * friction;
            }

            //좌표가 스크롤 영역에서 벗어나 있을때
            if (sx > 0 || sx <maxScrollX) {
                var tx = sx > 0 ? 0 : maxScrollX;
                if (vX === 0 || isXBacking) {
                    vX = (tx-sx) * backeasing;
                    isXBacking = true;
                } else {
                    vX *= bounceback;
                }
            }

            if (sy > 0 || sy < maxScrollY) {
                var ty = sy > 0 ? 0 : maxScrollY;
                if (vY === 0 || isYBacking) {
                    vY = (ty-sy) * backeasing;
                    isYBacking = true;
                } else {
                    vY *= bounceback;
                }

            }

            var rx,ry;
            if (Math.abs(vX)>0.01 || Math.abs(vY)>0.01)
            {
                // scroll Mode 에 따라서 좌표값을 설정
                if(scrollOption.scrollMode === "auto"){
                    rx = (sx > 0 && sx < 1) ? 0 : (sx > maxScrollX-1 && sx < maxScrollX) ? maxScrollX : sx + vX;
                    ry = (sy > 0 && sy < 1) ? 0 : (sy > maxScrollY-1 && sy < maxScrollY) ? maxScrollY : sy + vY;

                    if ((sx > 0 && sx < 1) || (sx > maxScrollX-1 && sx < maxScrollX)) isXBacking = false;
                    if ((sy > 0 && sy < 1) || (sy > maxScrollY-1 && sy < maxScrollY)) isYBacking = false;
                }else if(scrollOption.scrollMode === "vertical"){
                    rx = 0;
                    ry = (sy > 0 && sy < 1) ? 0 : (sy > maxScrollY-1 && sy < maxScrollY) ? maxScrollY : sy + vY;
                    if ((sy > 0 && sy < 1) || (sy > maxScrollY-1 && sy < maxScrollY)) isYBacking = false;
                }else if(scrollOption.scrollMode === "horizontal"){
                    rx = (sx > 0 && sx < 1) ? 0 : (sx > maxScrollX-1 && sx < maxScrollX) ? maxScrollX : sx + vX;
                    if ((sx > 0 && sx < 1) || (sx > maxScrollX-1 && sx < maxScrollX)) isXBacking = false;
                    ry = 0;
                }

                viewPort.move(rx, ry, 0);
            }
        }
    }

    var isFirstDown = false;
    function onMouseDownHandler(event) {
        var point = volcano.hasTouch ? event.touches[0] : event;
        downPoint = point;
        event.preventDefault();

        maxScrollX = containerElement.width() - viewPort.width();
        maxScrollY = containerElement.height() - viewPort.height();

        _sysMgr.addEventListener(volcano.e.MOUSE_MOVE, onMouseMoveHandler);
        _sysMgr.addEventListener(volcano.e.MOUSE_UP, onMouseUpHandler);
        _sysMgr.addEventListener(volcano.e.CANCEL, onMouseUpHandler);

        isMove = false;
        isDown = true;

        regX = point.pageX - viewPort.x();
        regY = point.pageY - viewPort.y();


        isFirstDown = true;
//        _sysMgr.addEnterFrameListener(setAccelerate);
    }

    function onMouseMoveHandler(event) {
        var point = volcano.hasTouch ? event.touches[0] : event;

        event.preventDefault();

        isMove = true;
        isDown = false;
        var pageX = point.pageX,
            pageY = point.pageY;


        targetX = pageX - regX;
        targetY = pageY - regY;

        if(isFirstDown){
            oldX = targetX;
            oldY = targetY;
            isFirstDown = false;
        }

        setAccelerate();

    }

    function onMouseUpHandler(event) {
        isMove = false;
        isDown = false;
        _sysMgr.removeEventListener(volcano.e.MOUSE_MOVE, onMouseMoveHandler);
        _sysMgr.removeEventListener(volcano.e.MOUSE_UP, onMouseUpHandler);
        _sysMgr.removeEventListener(volcano.e.CANCEL, onMouseUpHandler);
//        _sysMgr.removeEnterFrameListener(setAccelerate);
    }

    function setAccelerate() {
        vX = targetX - oldX;
        vY = targetY - oldY;

        oldX = targetX;
        oldY = targetY;
    }


    window.volcano.Scroller = Scroller;

})(window);
