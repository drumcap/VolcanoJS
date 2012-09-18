/*
 * SystemManager
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
     * Volcano의 전체 System Start Point
     *
     * @class SystemManager
     * @extends VSprite
     * @author david yun
     **/
    var SystemManager = function (parent) {
        this.initialize(parent);
    };

    var p = SystemManager.prototype = new volcano.VSprite();
    p.VSprite_initialize = p.initialize;

    p.instance = null;
    p._nestLevel = 0;
    p._body = null;
    p._onEnterFrameItems = null;

    p.initialize = function (parent) {
        // 변수 초기화
        this.instance = {};
        this._body = {};
        this._onEnterFrameItems = [];

        this.VSprite_initialize("#systemManager");

        Ticker.setFPS(this._fps);
        Ticker.addListener(this);

        this._body = (_.isObject(parent)) ? parent : document.body;

        var pst = this._body.style;
        this.setSize(pst.width, pst.height);
//        this.width(_.isNumber(parent.style.width) ? parent.style.width : window.innerWidth ).height(_.isNumber(parent.style.height) ? parent.style.height : window.innerHeight);

        this._body.appendChild(this._domElement);
        this._domElement.style.overflow = "hidden";
        this._domElement.style[volcano.Core._browserPrefix+"Perspective"] = "800px";
        this._domElement.style[volcano.Core._browserPrefix+"PerspectiveOrigin"] = "0 0";
        this._domElement.style[volcano.Core._browserPrefix+"TransformOrigin"] = "0 0";
//        this._domElement.style.top = "50%";
//        this._domElement.style.left = "50%";
        this._domElement.style[volcano.Core._browserPrefix+"TransformStyle"] = "flat";
        this._nestLevel = 1; // systemManager는 언제나 nestLevel 1

        volcano.LayoutManager.systemManager = this;

        var that = this.instance = this;
        var resizeHandler = function () {
            that.setSize(pst.width, pst.height);
            that.dispatchEvent("resize");
        };

        window.addEventListener("resize", resizeHandler);
    };

    p.setSize = function(w,h) {
        this.width(_.isNumber(w) ? w : window.innerWidth).height(_.isNumber(h) ? h : window.innerHeight);
        return this;
    }

    p.getNestLevel = function () {
        return this._nestLevel;
    };

    p._fps = 24;
    p.setFrameRate = function (fps) {
        this._fps = fps;
        Ticker.setFPS(fps);
        return this;
    };
    p.getFrameRate = function () {
        return this._fps;
    };

    p.VSprite__elementAdded = p._elementAdded;
    p._elementAdded = function (element, index, notifyListeners) {
        this.VSprite__elementAdded(element, index, notifyListeners); //super

        if (element.setNestLevel)
            element.setNestLevel(this.getNestLevel() + 1); // nest level 추가
        //todo 스타일 캐시 재생성 element.regenerateStyleCache(true);
        //todo 스타일 변경 알림  element.styleChanged(null);
        //todo 차일드에게 스타일 변경 알림 element.notifyStyleChangeInChildren(null, true);
        //todo 테마 컬러 초기화 element.initThemeColor();
        //todo 스타일 초기화 element.stylesInitialized();
        if (element.getInitialized && element.getInitialized()) {
            element.initComponent();
        }
    };

    p.enterFrameEventMode = false;

    /**
     * 엔터프레임 이벤트를 구현한 이벤트 루프 핸들러이며 Override 하면 안됩니다.
     * @private
     */
    p.tick = function () {
        var len = this._onEnterFrameItems.length;
        if (this.enterFrameEventMode) {
            this.dispatchEvent("enterFrame");
        }

        for (var i = 0; i < len; i++) {
            if (_.isFunction(this._onEnterFrameItems[i])) {
                this._onEnterFrameItems[i]();
            }
        }
    };

    /**
     * 엔터프레임 이벤트 핸들러를 추가
     * @param callback 이벤트 마다 실행할 콜백
     * @param isFirst 첫번째 위치로 추가
     * @return {*}
     */
    p.addEnterFrameListener = function (callback, isFirst) {
        var index = _.indexOf(this._onEnterFrameItems, callback);
        if (index !== -1) {
            return this;
        }

        (isFirst) ? isFirst = true : isFirst = false;
        if (isFirst) {
            this._onEnterFrameItems.unshift(callback);
        } else {
            this._onEnterFrameItems.push(callback);
        }
        return this;
    };

    /**
     * 엔터프레임 이벤트에 콜백 핸들러 제거
     * @param callback
     * @return {*}
     */
    p.removeEnterFrameListener = function (callback) {
        var index = _.indexOf(this._onEnterFrameItems, callback);
        this._onEnterFrameItems.splice(index, 1);
        return this;
    };

    window.volcano.SystemManager = SystemManager;

})(window);