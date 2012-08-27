(function(window) {
    /**
    * Volcano의 전체 System Start Point
    *
    * @class SystemManager
    * @author david yun
    **/
    var SystemManager = function(host) {
        this.initialize(host);
    };

    var p = SystemManager.prototype = new volcano.VolcanoSprite();
    p.VolcanoSprite_initialize = p.initialize;

    p.instance = null;
    p._nestLevel = 0;
    p._body = null;
    p._onEnterFrameItems = null;

    p.initialize = function(host) {
        // 변수 초기화
        this.instance = {};
        this._body = {};
        this._onEnterFrameItems = [];

        this.VolcanoSprite_initialize();

        Ticker.setFPS(this._fps);
        Ticker.addListener(this);

        this.setWidth(window.innerWidth).setHeight(window.innerHeight);

        (host) ? this._body = host : this._body = document.body;
        this._body.appendChild(this._wrapperDiv);
        this._nestLevel = 1; // systemManager는 언제나 nestLevel 1

        volcano.LayoutManager.systemManager = this;
        var that = this.instance = this; //아래의 핸들러에서 this가 window 객체로 덮어쓰기 되기 때문에 클로저로 유지
        var resizeHandler = function () {
            that.setWidth(window.innerWidth).setHeight(window.innerHeight);
            that.dispatchEvent("resize");
        };

        window.addEventListener("resize", resizeHandler);
    };

    p.getNestLevel = function(){
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

    p.VolcanoSprite__elementAdded = p._elementAdded;
    p._elementAdded = function (element, index, notifyListeners) {
        this.VolcanoSprite__elementAdded(element, index, notifyListeners); //super

        element.setNestLevel(this.getNestLevel()+1); // nest level 추가
        //todo 스타일 캐시 재생성 element.regenerateStyleCache(true);
        //todo 스타일 변경 알림  element.styleChanged(null);
        //todo 차일드에게 스타일 변경 알림 element.notifyStyleChangeInChildren(null, true);
        //todo 테마 컬러 초기화 element.initThemeColor();
        //todo 스타일 초기화 element.stylesInitialized();
        if (element.getInitialized()) {
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