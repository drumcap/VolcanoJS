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
    UIComponent._catchCallLaterExceptions = false;
    p._methodQueue = null;
    p.systemManager = null;
    p._skin = null; //todo skin architecture 완성되면 코드삽입
    p.states = null; //todo state mechanism 완성되면 코드삽입
    p._deferredSetStyles = null;
    p._owner = null;
    p._wrapperDiv = null;
    p._skinCanvas = null;
    p._updateCompletePendingFlag = false;
    p._processedDescriptiors = false;

    p.VolcanoSprite_initialize = p.initialize;

    p.initialize = function() {
        // 변수 초기화 (primitive 이외의 타입은 반드시 초기화 해야함)
        this._methodQueue = [];
        this.systemManager = volcano.LayoutManager.systemManager;
        this._skin = {}; //todo skin architecture 완성되면 코드삽입
        this.states = []; //todo state mechanism 완성되면 코드삽입
        this._deferredSetStyles = {};
        this._owner = {};

        this._wrapperDiv = {};
        this._skinCanvas = {};

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
            try {
                if (oldIE) // excanvas hack
                    c = window.G_vmlCanvasManager.initElement(c);
            } catch (e) {}

            return c;
        };

        this._skinCanvas = createCanvas(this._width, this._height);
        this._wrapperDiv.appendChild(this._skinCanvas);
    };

    p.getOwner = function() {
        return this._owner ? this._owner : this.parent;
    };
    p.setOwner = function (o) {
        this._owner = o;
        return this;
    };

    p._id = "";
    p.getId = function() {
        return this._id;
    };

    p.setId = function(id) {
        this._id = id;
        return this;
    };


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
//        if (this._nestLevel !== value || value === 1) {
//            return;
//        }
        if (value === 1) {
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

    p.setProcessedDescriptors = function(value){
        this._processedDescriptors = value;
    };

    p.getProcessedDescriptors = function(){
        return this._processedDescriptors;
    };

    p._updateCallbacks = function() {
        if (this._invalidateDisplayListFlag) {
            volcano.LayoutManager.invalidateDisplayList(this);
        }

        if (this._invalidateSizeFlag) {
            volcano.LayoutManager.invalidateSize(this);
        }

        if (this._invalidatePropertiesFlag) {
            volcano.LayoutManager.invalidateProperties(this);
        }


        if (this.systemManager) {
            if (this._methodQueue.length > 0 && !this._listeningForRender) {
                this.systemManager.addEnterFrameListener(this._callLaterDispatcher);
                this._listeningForRender = true;
            }
        }
    };

    p.validateNow = function(){
        volcano.LayoutManager.validateClient(this);
    };

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
        return this;
    };

    p._styleName = null;

    p.getStyleName = function() {
        return this._styleName;
    };

    p.setStyleName = function(value) {
        if (this._styleName !== value) {
            this._styleName = value;

            //XXX we have to write code related to style later
//            this.regenateStyleCache(true);
//            initThemeColor();
//            styleChanged("styleName");
//            notifyStyleChangeInChildren("styleName", true);
        }
        return this;
    };

    p.getSkin = function() {
        return this._skin;
    };
    p.setSkin = function(o) {
        var isSkinChange = false;
        if (this._skin !== o) {
            this._skin = o;
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

    p._enabled = false;
    p.getEnabled = function () {
        return this._enabled;
    };

    p.setEnabled = function (value) {
        this._enabled = value;
        this.invalidateDisplayList();
        //TODO dispatch enabled event
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
    /**
     * 속성의 다음 프레임 화면에 적용을 위한 invalidate 예약 명령어
     */
    p.invalidateProperties = function() {
        if (!this._invalidatePropertiesFlag) {
            this._invalidatePropertiesFlag = true;

            //todo call layout manager invalidateProperties
            volcano.LayoutManager.invalidateProperties(this);
        }
    };

    /**
     * 화면의 다음 프레임 크기 조절을 위한 invalidate 예약 명령어
     */
    p.invalidateSize = function() {
        if (!this._invalidateSizeFlag) {
            this._invalidateSizeFlag = true;

            volcano.LayoutManager.invalidateSize(this);
        }
    };

    /**
     * 화면의 다음 프레임에 업데이트를 하기 위한 invalidate 예약 명령어
     */
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
        var recursive = arguments[0];
        if(recursive === true){
            for(var i = 0 ; i < this.getNumElements ; i++){
                var child = this.getElementAt(i);
                child.validateSize(true);
            }
        }
        if (this._invalidateSizeFlag) {
            this.measure();
        }
    };

    p.validateDisplayList = function() {
        if (this._invalidateDisplayListFlag) {
            this.updateDisplayList(this.getMeasuredWidth(), this.getMeasuredHeight() );
            this._invalidateDisplayListFlag = false;
        }
    };

    p._listeningForRender = false;
    p._callLaterDispatcher = function() {
        UIComponent._callLaterDispatcherCount++;
        //EnterFrame 이벤트에 _callLaterDispatcher 제거;
        if (this._listeningForRender) {
            this.systemManager.removeEnterFrameListener(this._callLaterDispatcher);
            this._listeningForRender = false;
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
        this.VolcanoSprite__elementAdded(element, index, notifyListeners); //super

        element.parentChanged(this);
        element.setNestLevel(this.getNestLevel()+1); // nest level 추가
        //todo 스타일 캐시 재생성 element.regenerateStyleCache(true);
        //todo 스타일 변경 알림  element.styleChanged(null);
        //todo 차일드에게 스타일 변경 알림 element.notifyStyleChangeInChildren(null, true);
        //todo 테마 컬러 초기화 element.initThemeColor();
        //todo 스타일 초기화 element.stylesInitialized();
        if (!element.getInitialized()) {
            element.initComponent();
        }
    };

    p.VolcanoSprite__elementRemoved = p._elementRemoved;
    p._elementRemoved = function(element, index, notifyListeners){

        element.parentChanged(null);

        this.VolcanoSprite__elementRemoved(element, index, notifyListeners); //super
    };

    p.getUpdateCompletePendingFlag = function(){
        return this._updateCompletePendingFlag;
    };

    p.setUpdateCompletePendingFlag = function(value){
        this._updateCompletePendingFlag = value;
    }

    var parentChangedFlag = false;
    p.parentChanged = function(p){
        if(!p){
            this.parent = null;
            this.setNestLevel(0);
        }else if(p.name === "systemManager"){
            this.parent = p;
        }else if(p._skinCanvas && p._skinCanvas.localName === "canvas"){
            this.parent = p;
        }else{
            this.parent = p.parent;
        }

        parentChangedFlag = true;
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
        if (this.getInitialized()) {
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
    p.commitProperties = function() {
        console.log(this.getName() +  "   -------------   " + "commitProperties");
    };

    /**
     * 크기조절을 위한 override용 메소드
     * @protected
     */
    p.measure = function() {
        console.log(this.getName() +  "   -------------   " + "measure");
    };
    /**
     * 좌표 조절을 위한 override용 메소드
     * @param w
     * @param h
     * @protected
     */
    p.updateDisplayList = function(w,h) {
        console.log(this.getName() +  "   -------------   " + "updateDisplayList");
    };

    /**
     * 초기화 완료 메소드
     * @protected
     */
    p.initializationComplete = function() {
        this.dispatchEvent("initialize");
        this.setProcessedDescriptors(true);
    };

    window.volcano.UIComponent = UIComponent;

})(window);