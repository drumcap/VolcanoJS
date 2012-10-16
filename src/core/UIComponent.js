/*
 * UIComponent
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

    var p = UIComponent.prototype = new volcano.VSprite();

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
    p._updateCompletePendingFlag = false;
    p._processedDescriptiors = false;
    /**
     * 실제 화면에 display 될 래퍼 Div
     * @type {*}
     * @private
     */
    p._domElement = null;
    p.VSprite_initialize = p.initialize;

    p.initialize = function(element) {
        // 변수 초기화 (primitive 이외의 타입은 반드시 초기화 해야함)
        this._methodQueue = [];
        this.systemManager = volcano.LayoutManager.systemManager;
        this._skin = {}; //todo skin architecture 완성되면 코드삽입
        this.states = []; //todo state mechanism 완성되면 코드삽입
        this._deferredSetStyles = {};
        this._owner = {};
        this._domElement = {};

        this.VSprite_initialize(element); //super
    };

    p.owner = function(value){
      if(arguments.length){
          this._owner = value;
          return this;
      }else{
          return this._owner ? this._owner : this.parent;
      }
    };

    p._nestLevel = 0;
    /**
     * getter
   	 * 중첩레벨을 깊이(depth)를 정의하는 속성 게터이며, 레이아웃 코드에서 사용된다.
     * 만약 값이 0이라면 DisplayList에 포함되지 않은 것이다.
   	 * @method nestLevel
   	 **/
    /**
     * setter
     * 중첩레벨을 깊이(depth)를 정의하는 속성 게터세터이며, 레이아웃 코드에서 사용된다.
     * 만약 값이 0이라면 DisplayList에 포함되지 않은 것이다. SystemManager는 1, Appplication은 2 이다.
     * @method nestLevel
     * @param value
     **/
    p.nestLevel = function(value){
        if(arguments.length){
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
                    ui.nestLevel(value);
                }
            }
        }else{
            return this._nestLevel;
        }
    };

    p.processedDescriptors = function(value){
        if(arguments.length){
            this._processedDescriptors = value;
        }else{
            return this._processedDescriptors;
        }
    }

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
   	 * 컴포넌트의 스타일을 셋
   	 * @method getStyle
   	 * @param styleProp
   	 **/
    p.setStyle = function(name,value,prefix) {
        var isSetStyleChanged = false;
        if (_.isString(name)) {
            var sdata = (arguments.length > 2) ? {"value":value, "prefix":volcano._browserPrefix + name} : {value:value};
            this._deferredSetStyles[name] = sdata;
            isSetStyleChanged = true;
        }

        if (isSetStyleChanged) {
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        return this;
    };

    p._measuredWidth = 0;
    p.measuredWidth = function(w) {
        if (arguments.length) {
            this._measuredWidth = w;
            return this;
        }else{
            return this._measuredWidth;
        }
    };

    p._measuredHeight = 0;
    p.measuredHeight = function(h) {
        if (arguments.length) {
            this._measuredHeight = h;
            return this;
        }else{
            return this._measuredHeight;
        }
    };

    p._widthChanged = false;
    p._width = 0;
    p._height = 0;
    p._oldWidth = 0;
    p._oldHeight = 0;
    p.width = function(w) {
        if (arguments.length) {
            this._width = w;
            this._widthChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
            return this;
        }else{
            return this._width;
        }
    };

    p._percentWidth = 0;
    p._oldPercentWidth = 0;
    p._percentWidthChanged = false;
    p.percentWidth = function(w) {
        if (arguments.length) {
            this._percentWidth = w;
            this._percentWidthChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
            return this;
        }else{
            return this._percentWidth;
        }
    };

    p._heightChanged = false;
    p.height = function(h) {
        if (arguments.length) {
            this._height = h;
            this._heightChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
            return this;
        }else{
            return this._height;
        }
    };

    p._percentHeight = 0;
    p._oldPercentHeight = 0;
    p._percentHeightChanged = false;
    p.percentHeight = function(h) {
        if (arguments.length) {
            this._percentHeight = h;
            this._percentHeightChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
            return this;
        }else{
            return this._height;
        }
    };

    p._enabled = false;

    p.enabled = function (v) {
        if (arguments.length) {
            this._enabled = v;
            this.invalidateDisplayList();
            this.dispatchEvent("enabledChanged");
        }else{
            return this._enabled;
        }
    };

    p._initialized = false;
    p.initialized = function(value){
        if(arguments.length){
            this._initialized = arguments[0];

            if (arguments[0]) {
                this.dispatchEvent("creationComplete");
            }
        }else{
            return this._initialized;
        }
    };

    p.updateCompletePendingFlag = function(value){
        if(arguments.length){
            this._updateCompletePendingFlag = value;
        }else{
            return this._updateCompletePendingFlag;
        }
    };

    p.setActualSize = function(w,h) {
        var changed = false;
        if (this._width != w) {
            this._width = w;
            this._widthChanged = true;
            changed = true;
            this.dispatchEvent("widthChanged");
        }
        if (this._height != h) {
            this._height = h;
            this._heightChanged = true;
            changed = true;
            this.dispatchEvent("heightChanged");
        }
        if (changed) {
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
    };

    p._ox = 0;
    p._oy = 0;
    p._oz = 0;
    p._x = 0;
    p._y = 0;
    p._z = 0;
    p._oldX = 0;
    p._oldY = 0;
    p._oldZ = 0;

    p.x = function(px) {
        if ( arguments.length ) {
            if(this._x != px){
                this._x = px;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[0]] + this._ox;
        }
    };

    p.y = function(py) {
        if ( arguments.length ) {
            if(this._y != py){
                this._y = py;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[1]] + this._oy;
        }
    };

    p.z =  function(pz) {
        if ( arguments.length ) {
            if(this._z != pz){
                this._z = pz;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[2]] + this._oz;
        }
    };

    p.move = function(px,py,pz) {
        var changed = false;
        if (this._x != px) {
            this._x = px;
            changed = true;
        }
        if (this._y != py) {
            this._y = py;
            changed = true;
        }
        if(arguments.length >= 3){
            if (this._z != pz) {
                this._z = pz;
                changed = true;
            }
        }

        if (changed) {
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
    };
    
    p._rotationX = 0;
    p._rotationY = 0;
    p._rotationZ = 0;
    p._oldRotationX = 0;
    p._oldRotationY = 0;
    p._oldRotationZ = 0;
    
    p.rotationX = function(rx) {
        if ( arguments.length ) {
            if(rx != this._rotationX){
                this._rotationX = rx;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[3]];
        }
    };

    p.rotationY = function(ry) {
        if ( arguments.length ) {
            if(ry != this._rotationY){
                this._rotationY = ry;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[4]];
        }
    };

    p.rotationZ = function(rz) {
        if ( arguments.length ) {
            if(rz != this._rotationZ){
                this._rotationZ = rz;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[5]];
        }
    };

    p.rotation = function(rx,ry,rz) {
        var changed = false;
        
        if(rx != this._rotationX){
            this._rotationX = rx;
            changed = true;
        }
        if(ry != this._rotationY){
            this._rotationY = ry;
            changed = true;
        }
        if(rz != this._rotationZ){
            this._rotationZ = rz;
            changed = true;
        }
        
        if(changed){
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        return this;
    };

    p._scaleX = 1;
    p._scaleY = 1;
    p._scaleZ = 1;
    p._oldScaleX = 1;
    p._oldScaleY = 1;
    p._oldScaleZ = 1;

    p.scaleX = function(sx) {
        if ( arguments.length ) {
            if(this._scaleX != sx){
                this._scaleX = sx;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[6]];
        }
    };

    p.scaleY = function(sy) {
        if ( arguments.length ) {
            if(this._scaleY != sy){
                this._scaleY = sy;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[7]];
        }
    };

    p.scaleZ = function(sz) {
        if ( arguments.length ) {
            if(this._scaleZ != sz){
                this._scaleZ = sz;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[8]];
        }
    };

    p.scale = function(sx,sy,sz) {
        var changed = false;
        switch(arguments.length){
            case 0:
                if (this.isAutoUpdate) this.updateTransform();
                return this._string[this._positions[6]];
            case 1:
                this._scaleZ = this._scaleY = this._scaleX = sx;
                this.invalidateProperties();
                this.invalidateDisplayList();
                break;
            case 2:
                this._scaleX = sx;
                this._scaleY = sy;
                this._scaleZ = 1;
                this.invalidateProperties();
                this.invalidateDisplayList();
                break;
            case 3:
                this._scaleX = sx;
                this._scaleY = sy;
                this._scaleZ = sz;
                this.invalidateProperties();
                this.invalidateDisplayList();
                break;
        }
        return this;
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
            this.updateDisplayList(this.measuredWidth(), this.measuredHeight() );
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

    p.VSprite__elementAdded = p._elementAdded;
    p._elementAdded = function (element, index, notifyListeners) {
        this.VSprite__elementAdded(element, index, notifyListeners); //super

        element.parentChanged(this);
        element.nestLevel(this.nestLevel()+1); // nest level 추가
        //todo 스타일 캐시 재생성 element.regenerateStyleCache(true);
        //todo 스타일 변경 알림  element.styleChanged(null);
        //todo 차일드에게 스타일 변경 알림 element.notifyStyleChangeInChildren(null, true);
        //todo 테마 컬러 초기화 element.initThemeColor();
        //todo 스타일 초기화 element.stylesInitialized();
        if (!element.initialized()) {
            element.initComponent();
        }
    };

    p.VSprite__elementRemoved = p._elementRemoved;
    p._elementRemoved = function(element, index, notifyListeners){

        element.parentChanged(null);

        this.VSprite__elementRemoved(element, index, notifyListeners); //super
    };

    var parentChangedFlag = false;
    p.parentChanged = function(p){
        if(!p){
            this.parent = null;
            this.nestLevel(0);
        }else if(p.name === "systemManager"){
            this.parent = p;
        }else{
            this.parent = p.parent;
        }

        parentChangedFlag = true;
    };

    p.initComponent = function() {
        if (this.initialized()) {
            return;
        }

        this.dispatchEvent("preinitialize");

        this.createChildren();
        this.childrenCreated();

        this.initializationComplete();
    };

    // TODO Layout 적용 시 구현
    p.getLayoutBoundsX = function(postLayoutTransform){

    };

    // TODO Layout 적용 시 구현
    p.getLayoutBoundsY = function(postLayoutTransform){

    }

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
//        console.log(this.name() +  "   -------------   " + "commitProperties");
        // x, y, z 속성
        var transformChanged = false;
        if(this._x != this._oldx || this._y != this._oldy || this._z != this._oldz){
            
            this._oldx = this._x;
            this._oldy = this._y;
            this._oldz = this._z;
            this._string[this._positions[0]] = this._x - this._ox;
            this._string[this._positions[1]] = this._y - this._oy;
            this._string[this._positions[2]] = this._z - this._oz;

            transformChanged = true;
        }

        if(this._rotationX != this._oldRotationX || this._rotationY != this._oldRotationY || this._rotationZ != this._oldRotationZ){
            this._oldRotationX = this._rotationX;
            this._oldRotationY = this._rotationY;
            this._oldRotationZ = this._rotationZ;
            this._string[this._positions[3]] = this._rotationX;
            this._string[this._positions[4]] = this._rotationY;
            this._string[this._positions[5]] = this._rotationZ;

            transformChanged = true;
        }

        if(this._scaleX != this._oldScaleX || this._scaleY != this._oldScaleY || this._scaleZ != this._oldScaleZ){
            this._oldScaleX = this._scaleX;
            this._oldScaleY = this._scaleY;
            this._oldScaleZ = this._scaleZ;
            this._string[this._positions[6]] = this._scaleX;
            this._string[this._positions[7]] = this._scaleY;
            this._string[this._positions[8]] = this._scaleZ;

            transformChanged = true;
        }

        if(transformChanged){
            this.updateTransform();
        }

        // width, height 속성

        var sizeWidthChanged = false;
        if(this._width != this._oldWidth){
            this._oldWidth = this._width;
            this._domElement.style.width = this._width + "px";
            sizeWidthChanged = true;
        }

        if(this._percentWidth != this._oldPercentWidth && !sizeWidthChanged){
            this._oldPercentWidth = this._percentWidth;
            this._domElement.style.width = this._percentWidth + "%";
        }

        var sizeHeightChanged = false;
        if(this._height != this._oldHeight){
            this._oldHeight = this._height;
            this._domElement.style.height = this._height + "px";
            sizeHeightChanged = true;
        }

        if(this._percentHeight != this._oldPercentHeight && !sizeHeightChanged){
            this._oldPercentHeight = this._percentHeight;
            this._domElement.style.height = this._percentHeight + "%";
        }
    };

    /**
     * 크기조절을 위한 override용 메소드
     * @protected
     */
    p.measure = function() {
//        console.log(this.name() +  "   -------------   " + "measure");
    };
    /**
     * 좌표 조절을 위한 override용 메소드
     * @param w
     * @param h
     * @protected
     */
    p.updateDisplayList = function(w,h) {
//        console.log(this.name() +  "   -------------   " + "updateDisplayList");
    };

    /**
     * 초기화 완료 메소드
     * @protected
     */
    p.initializationComplete = function() {
        this.dispatchEvent("initialize");
        this.processedDescriptors(true);
    };

    window.volcano.UIComponent = UIComponent;

})(window);