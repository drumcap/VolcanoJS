(function(window) {
    /**
    * UIComponent 는 표현의 기초가 되는 컴포넌트 이며 객체 생명주기를 제공한다.
    * 생명주기는 Flex의 생명주기와 동일하게 제공하고 있으며 invalidate,validate 방식의 디스플레이 리스트 모델을 따른다.
    * @class DisplayObject
    * @constructor
    * @author david yun
    **/
    var UIComponent = function() {
      this.initialize();
    };

    var p = UIComponent.prototype = new volcano.VolcanoSprite();

    var MethodQueElement = function(method, args) {
        this.method = method;
        this.args = args;
    };

    UIComponent._callLaterDispatcherCount = 0;
    p._methodQueue = [];
    p.systemManager = {}; //todo systemManager 클래스 만들면 인스턴스 생성
    p.skin = {}; //todo skin architecture 완성되면 코드삽입
    p.states = []; //todo state mechanism 완성되면 코드삽입

    p._wrapperDiv = null;
    p._skinCanvas = null;

    p.VolcanoSprite_initialize = p.initialize;
    p.initialize = function() {
        p.VolcanoSprite_initialize(); //super

        // ie 인지 체크하고...
        var isExplorer = /msie [\w.]+/;
        var docMode = document.documentMode;
        var oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

        // 캔버스 태그를 만듬
        var createCanvas = function (w, h) {
            var c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            if (oldIE) // excanvas hack
                c = window.G_vmlCanvasManager.initElement(c);
            return c;
        }

        this._skinCanvas = createCanvas(this._width, this._height);
        this._wrapperDiv.appendChild(this._skinCanvas);
    };

    p.getOwner = function() {};

    p._nestLevel = 0;
    /**
   	 * 중첩레벨을 깊이(depth)를 정의하는 속성 게터이며, 레이아웃 코드에서 사용된다.
     * 만약 값이 0이라면 DisplayList에 포함되지 않은 것이다.
   	 * @method getNestLevel
   	 **/
    p.getNestLevel = function() {
        return this._nestLevel;
    };
    /**
   	 * 중첩레벨을 깊이(depth)를 정의하는 속성 게터세터이며, 레이아웃 코드에서 사용된다.
     * 만약 값이 0이라면 DisplayList에 포함되지 않은 것이다. SystemManager는 1, Appplication은 2 이다.
   	 * @method setNestLevel
   	 * @param value
   	 **/
    p.setNestLevel = function(value) {
        if (this._nestLevel !== value || value === 1) {
            return;
        }

        if (value > 1 && this._nestLevel !== value) {
            this._nestLevel = value;
            this._updateCallbacks();
            value++;
        } else if (value === 0) {
            this._nestLevel = value = 0;
        } else {
            value++;
        }

        var n = this.getNumElements();
        for (var i = 0; i<n; i++) {
            var ui = this.getElementAt(i);
            if (ui) {
                ui.setNestLevel(value);
            }
        }
    };

    p._deferredSetStyles = {};
    /**
   	 * 컴포넌트의 스타일을 가져옴
   	 * @method getStyle
   	 * @param styleProp
   	 **/
    p.getStyle = function(styleProp) {
        var ret = null;
        if (_.isString(styleProp)) {
            ret = this._deferredSetStyles[styleProp];
        }
        return ret;
    };
    p.setStyle = function(name,value) {
        var isSetStyleChanged = false;
        if (_.isString(name)) {
            this._deferredSetStyles[name] = value;
            isSetStyleChanged = true;
        }

        if (isSetStyleChanged) {
            //todo dispatch setStyleChangeEvent
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
    };

    p.getSkin = function() {
        return this.skin;
    };
    p.setSkin = function(o) {
        var isSkinChange = false;
        if (this.skin !== o) {
            this.skin = o;
            isSkinChange = true;
        }

        if (isSkinChange) {
            //todo dispatch skinChangeEvent
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
    };

    p._measuredWidth = 0;
    p.getMeasuredWidth = function() {
        return this._measuredWidth;
    };
    p.setMeasuredWidth = function(value) {
        this._measuredWidth = value;
        return this;
    };

    p._measuredHeight = 0;
    p.getMeasuredHeight = function() {
        return this._measuredHeight;
    };
    p.setMeasuredHeight = function(value) {
        this._measuredHeight = value;
        return this;
    };

    p.setWidth = function(w) {
        this._width = w;
        this._wrapperDiv.width = w;
        this.invalidateProperties();
        this.invalidateDisplayList();
        return this;
    };

    p.setHeight = function(h) {
        this._height = h;
        this._wrapperDiv.height = h;
        this.invalidateProperties();
        this.invalidateDisplayList();
        return this;
    };

    p.setActualSize = function(w,h) {
        var changed = false;
        if (this._width != w) {
            this._wrapperDiv.width = w+"px";
            this._skinCanvas.width = w+"px";
            changed = true;
        }
        if (this._height != h) {
            this._wrapperDiv.width = h+"px";
            this._skinCanvas.width = h+"px";
            changed = true;
        }
        if (changed) {
            this.invalidateProperties();
            this.invalidateDisplayList();
            //todo dispatch event to bind data
        }
    };

    p.move = function(x,y) {
        var wrapperStyle = this._wrapperDiv.style;
        var changed = false;
        if (this._x != x) {
            wrapperStyle.left = this._x+"px";
            changed = true;
        }
        if (this._y != y) {
            wrapperStyle.top = this._y+"px";
            changed = true;
        }
        if (changed) {
            //todo dispatch event to bind data
        }
    };

    p._invalidatePropertiesFlag = false;
    p._invalidateSizeFlag = false;
    p._invalidateDisplayListFlag = false;
    p.invalidateProperties = function() {
        if (!this._invalidatePropertiesFlag) {
            this._invalidatePropertiesFlag = true;

            //todo call layout manager invalidateProperties
            volcano.LayoutManager.invalidateProperties(this);
        }
    };
    p.invalidateSize = function() {
        if (!this._invalidateSizeFlag) {
            this._invalidateSizeFlag = true;

            volcano.LayoutManager.invalidateSize(this);
        }
    };
    p.invalidateDisplayList = function() {
        if (!this._invalidateDisplayListFlag) {
            this._invalidateDisplayListFlag = true;

            volcano.LayoutManager.invalidateDisplayList(this);
        }
    };
    p.validateProperties = function() {
        if (this._invalidatePropertiesFlag) {
            this.commitProperties();
            this._invalidatePropertiesFlag = false;
        }
    };
    p.validateSize = function() {
        if (this._invalidateSizeFlag) {
            this.measure();
        }
    };
    p.validateDisplayList = function() {
        if (this._invalidateDisplayListFlag) {
            this.updateDisplayList(this.getMeasuredWidth(), this.getMeasuredHeight() );
        }
    };

    p._updateCallbacks = function() {

    };

    p._callLaterDispatcher = function() {
        UIComponent._callLaterDispatcherCount++;
        //todo EnterFrame 이벤트에 _callLaterDispatcher 제거;
        //this.systemManager.removeEventListener("enterFrame", this._callLaterDispatcher);

        // methodQue 지우고..
        var queue = this._methodQueue;
        this._methodQueue = [];

        // methodQue 실행
        var n = queue.length;
        if (n > 0) {
            for (var i=0; i<n; i++) {
                var mqe = queue[i];
                mqe.method.apply(null, mqe.args);
            }
        }

        UIComponent._callLaterDispatcherCount--;
    };

    p.callLater = function(callback, args) {
        this._methodQueue.push(new MethodQueElement(callback, args));

        //todo EnterFrame 이벤트에 _callLaterDispatcher 호출;
        this.systemManager.addEventListener("enterFrame", this._callLaterDispatcher);

    };

// protected Method
    p.createChildren = function() {};
    p.commitProperties = function() {};
    p.measure = function() {};
    p.updateDisplayList = function(w,h) {};

// private Method
    p._setOwner = function(o) {};

    window.volcano.UIComponent = UIComponent;

})(window);