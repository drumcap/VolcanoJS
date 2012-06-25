(function(window) {
    /**
    * Volcano의 전체 System Start Point
    *
    * @class SystemManager
    **/
    var SystemManager = function() {
        this.initialize();
    };

    var p = SystemManager.prototype = new volcano.VolcanoSprite();
    p.VolcanoSprite_initialize = p.initialize;

    p.instance = null;
    p.nestLevel = 0;

    p.initialize = function() {
        p.VolcanoSprite_initialize();

        Ticker.setFPS(this._fps);
        Ticker.addListener(this);

        this.setWidth(window.innerWidth).setHeight(window.innerHeight);
        this._body = document.body;
        this._body.appendChild(this._wrapperDiv);
        this.nestLevel = 1; // systemManager는 언제나 nestLevel 1

        volcano.LayoutManager.systemManager = this;
        var that = this.instance = this; //아래의 핸들러에서 this가 window 객체로 덮어쓰기 되기 때문에 클로저로 유지
        var resizeHandler = function(e) {
            that.setWidth(window.innerWidth).setHeight(window.innerHeight);
            that.dispatchEvent("resize");
        };

        window.addEventListener("resize", resizeHandler);
    };

    p._fps = 24;
    p.setFrameRate = function (fps) {
        this._fps = fps;
        Ticker.setFPS(fps);
    };
    p.getFrameRate = function () {
        return this._fps;
    };

    p._body = null;
    p.tick = function () {
        this.dispatchEvent("enterFrame");
    };

    window.volcano.SystemManager = SystemManager;

})(window);