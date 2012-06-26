(function(window) {
    /**
    * UIComponent 는 표현의 기초가 되는 컴포넌트 이며 객체 생명주기를 제공한다.
    * 생명주기는 Flex의 생명주기와 동일하게 제공하고 있으며 invalidate,validate 방식의 디스플레이 리스트 모델을 따른다.
    * @class UIComponent
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
        this.VolcanoSprite_initialize(); //super

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

    p._updateCallbacks = function() {
        if (this._invalidateDisplayListFlag) {
            LayoutManager.invalidateDisplayList(this);
        }

        if (this._invalidateSizeFlag) {
            LayoutManager.invalidateSize(this);
        }

        if (this._invalidatePropertiesFlag) {
            LayoutManager.invalidateProperties(this);
        }


        if (this.systemManager) {
            if (this._methodQueue.length > 0 && !this._listeningForRender) {
                this.systemManager.addEnterFrameListener(this._callLaterDispatcher);
                this._listeningForRender = true;
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

    p._listeningForRender = false;
    p._callLaterDispatcher = function() {
        UIComponent._callLaterDispatcherCount++;
        //EnterFrame 이벤트에 _callLaterDispatcher 제거;
        if (this._listeningForRender) {
            this.systemManager.removeEnterFrameListener(this._callLaterDispatcher);
        }

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

        //EnterFrame 이벤트에 _callLaterDispatcher 호출;
        if (!this._listeningForRender) {
            this.systemManager.addEnterFrameListener(this._callLaterDispatcher);
            this._listeningForRender = true
        }
    };

    p.VolcanoSprite__elementAdded = p._elementAdded;
    p._elementAdded = function (element, index, notifyListeners) {
        p.VolcanoSprite__elementAdded(element, index, notifyListeners); //super

        element.setNestLevel(this._nestLevel+1); // nest level 추가
        //todo 스타일 캐시 재생성 element.regenerateStyleCache(true);
        //todo 스타일 변경 알림  element.styleChanged(null);
        //todo 차일드에게 스타일 변경 알림 element.notifyStyleChangeInChildren(null, true);
        //todo 테마 컬러 초기화 element.initThemeColor();
        //todo 스타일 초기화 element.stylesInitialized();
        if (element.getInitialized()) {
            element.initComponent();
        }
    };



    p._initialized = false;
    p.getInitialized = function() {
        return this._initialized;
    };

    p.setInitialized = function(value) {
        this._initialized = value;

        if (value) {
            this.dispatchEvent("creationComplete");
        }
    };

    p.initComponent = function() {
        if (this._initialized) {
            return;
        }

        this.dispatchEvent("preinitialize");

        this.createChildren();
        this.childrenCreated();

        this.initializationComplete();
    };

// protected Method
    /**
     * 객체 생성및 초기화를 위한 override 메소드
     * @protected
     */
    p.createChildren = function() {};

    /**
     * 객체 생성이 완료 되었을 때의 메소드
     * @protected
     */
    p.childrenCreated = function() {
        this.invalidateProperties();
        this.invalidateSize();
        this.invalidateDisplayList();
    };
    /**
     * 속성 변경을 하기위한 override용 메소드
     * @protected
     */
    p.commitProperties = function() {};

    /**
     * 크기조절을 위한 override용 메소드
     * @protected
     */
    p.measure = function() {};
    /**
     * 좌표 조절을 위한 override용 메소드
     * @param w
     * @param h
     * @protected
     */
    p.updateDisplayList = function(w,h) {};

    /**
     * 초기화 완료 메소드
     * @protected
     */
    p.initializationComplete = function() {
        this.dispatchEvent("initialize");
    };

// private Method
    p._setOwner = function(o) {};

    window.volcano.UIComponent = UIComponent;

})(window);