/*
 * VObject
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
     * DOM Object를 감싸주는 기본 클래스
     * DOM Event 처리와, 기본 속성 조절 기능을 포함하고 있다.
     * 3D transform features are inspired by Sprite3D.js Project
     *
     * @class VObject
     * @constructor
     * @author david yun
     **/
    var VObject = function (element, options) {
        this.initialize(element, options);
    };

    var htmlEvents = {// list of real events
        //<body> and <frameset> Events
        onload:1,
        onunload:1,
        //Form Events
        onblur:1,
        onchange:1,
        onfocus:1,
        onreset:1,
        onselect:1,
        onsubmit:1,
        //Image Events
        onabort:1,
        //Keyboard Events
        onkeydown:1,
        onkeypress:1,
        onkeyup:1,
        //Mouse Events
        onclick:1,
        ondblclick:1,
        onmousedown:1,
        onmousemove:1,
        onmouseout:1,
        onmouseover:1,
        onmouseup:1
    };

    VObject._eventSplitter = /\s+/;

    /**
     * Debug를 위해 Div에 랜덤 컬러를 지정 가능하게 한다.
     * @type {Boolean}
     */
    VObject.randomColorMode = false;

    var p = VObject.prototype;
    /**
     * 실제 화면에 display 될 래퍼 Div
     * @type {*}
     * @private
     */
    p._domElement = null;
    /**
     * 요소의 객체를 담아 두는 저장 공간
     * @type {Array}
     * @private
     */
    p._elementsContent = null;
    p.eventCallback = null;
    /**
     * parent 정보
     * @property parent
     * @final
     * @type VObject
     * @default null
     */
    p.parent = null;

    p._alpha = 1.0;

    // transform 스타일 속성을 넣기 위한 스키마 배열
    p._string = [];

    // transform 스타일 속성을 넣는 값이 있는 위치의 배열
    p._positions = [];

    // transform 스타일 속성을 setter 호출시에 즉시 업데이트 할지의 여부
    p.isAutoUpdate = true;

    p._ox = 0;
    p._oy = 0;
    p._oz = 0;

    // 스타일 속성 설정
    // default : on/off
    p._option = {};

    p.initialize = function (element, options) {

        var $ = window.Zepto || window.jQuery,
            createContainer;
        // 변수 초기화
        this._domElement = {};

        if(options !== undefined){
            this._option = options;
        }else{
            this._option.defaultValue = "on";
        }

        var that = this;


        // wrapper 컨테이너를 생성
        createContainer = function (w, h, bgColor) {
                var con = document.createElement('div');
                con.style.width = w + "px";
                con.style.height = h + "px";
                con.style.margin = "0px";
                con.style.padding = "0px";
                if (bgColor != undefined) {
                    con.style.backgroundColor = bgColor;
                }
                if (VObject.randomColorMode) {
                    con.style.backgroundColor = volcano.ColorUtil.getRandomColor();
                    //con.innerHTML = volcano.ColorUtil.getRandomColor();;
                    //con.style.opacity = 0.3;
                }
                if(that._option.defaultValue === "on"){
                    con.style.position = "absolute";
            }

            return con;
        };

        if ( arguments.length === 0 || _.isUndefined(element) ) {
            element = createContainer(this._width, this._height);
        } else if ( typeof(element) === "string" ) {
            var str = element;
            element = createContainer(this._width, this._height);
            switch( str[0] ) {
                case ".":
                    element.className = str.substr(1);
                    break;
                case "#":
                    element.id = str.substr(1);
                    break;
                default:
                    element.id = str;
                    break;
            }
        } else if (element.val && element.attr ) {
            if (element.length > 1){
                throw new Error("You are using multi selected jQuery/Zepto Object \n You MUST select only one DOM Object \n If you want to use multi selected jQuery/Zepto Object, you should use alternative class that is VobjectArray");
            }
            element = element.get(0);
        }else if(this._option.defaultValue === "off"){ // 기본 스타일을 off로 설정
//            console.log("create Volcano Style Default Option =====> off");
        }else if (element.style.position == "static" ) {
            element.style.position = "relative";
        }else {
            element.style.position = "absolute";
        }

        if(this._option.defaultValue === "on" && volcano.has3d){ // 기본 스타일을 on으로 설정
            element.style[ volcano._browserPrefix + "TransformStyle" ] = "preserve-3d";
            element.style[ volcano._transformProperty ] = "translateZ(0px)";
        }

        // add private properties
        this._string = [ "translate3d(", 0, "px,", 0, "px,", 0, "px) ",
                    "rotateX(", 0, "deg) ",
                    "rotateY(", 0, "deg) ",
                    "rotateZ(", 0, "deg) ",
                    "scale3d(", 1, ", ", 1, ", ", 1, ") "];

        this._positions = [
            1,  3,  5, // x, y, z
            8, 11, 14, // rotationX, rotationY, rotationZ
            17, 19, 21 // scaleX, scaleY, scaleZ
        ];
        this._ox = 0;
        this._oy = 0;
        this._oz = 0;

        this._domElement = element;
        this._domElement.volcanoObj = this; //FIXME 향후 메모리 문제가 생길 소지 있으니 개선해야함.
    };

    /**
     * 이벤트 리스닝을 하는 함수로 Wrapper Div에 이벤트 리스너를 달아주는 Delegator 함수
     * IE8 이하는 지원하지 않는다.
     * @param {String} events
     * @param {Function} callback 핸들러 함수, 여기에 전달되는 이벤트 객체는 DOM Event 객체임
     * @return {*}
     */
    p.addEventListener = function (events, callback) {
        var calls, event, node, tail, list, innerCallback, target, nodeTarget, cacheTarget;
        if (!(events || callback)) return this;
        events = events.split(VObject._eventSplitter);
        calls = this._callbacks || (this._callbacks = {});

        innerCallback = function(event) {
            if (event) {

                target = event.target || event.srcElement;

                if (!nodeTarget || cacheTarget != target) {
                    nodeTarget = cacheTarget = target;
                }

                if (!nodeTarget.volcanoObj) {
                    nodeTarget = nodeTarget.parentNode;
                    innerCallback.call(this,event);
                    return;
                }

                if (!event.preventDefault) {event.preventDefault=function(){event.returnValue = false;}}
                if (!event.stopPropagation) {event.stopPropagation=function(){event.cancelBubble = true;}}

                event.vCurrentTarget = this.volcanoObj; //핸들러에서의 this는 currentTarget을 가르킴
                event.vTarget = nodeTarget.volcanoObj;
            }
            callback(event);
        };

        while (event = events.shift()) {
            list = calls[event];
            node = list ? list.tail : {};
            node.next = tail = {};
            node.callback = innerCallback;
            calls[event] = {tail: tail, next: list ? list.next : node};

            if(this._domElement.addEventListener){
                this._domElement.addEventListener(event,innerCallback,false);
            }else if(this._domElement.attachEvent && htmlEvents['on'+event]){ // IE < 9
                this._domElement.attachEvent('on'+event,innerCallback);
            }else{
                this._domElement['on'+event]=innerCallback;
            }
        }
        return this;
    };

    /**
     * 이벤트 리스너를 제거 하는 함수로 Wrapper Div에 이벤트 리스너를 제거하는 Delegator 함수
     * IE8 이하는 지원하지 않는다.
     * @param {String} events
     * @param {Function} callback
     * @return {*}
     */
    p.removeEventListener = function (events, callback) {
        var event, calls, node, tail, cb;
        if (!(calls = this._callbacks)) return;
        if (!(events || callback)) return this;
        events = events.split(VObject._eventSplitter);

        while (event = events.shift()) {
            node = calls[event];
            delete calls[event];
            if (!node || !callback) continue;
            tail = node.tail;
            while ((node = node.next) !== tail) {
                cb = node.callback;

                if(this._domElement.removeEventListener){
                    this._domElement.removeEventListener(event,cb,false);
                }else if(this._domElement.detachEvent && htmlEvents['on'+event]){ // IE < 9
                    this._domElement.detachEvent('on'+event,cb);
                }else{
                    this._domElement['on'+event]=null;
                }
            }
        }
        return this;
    };

    /**
     * 이벤트를 발송하는 함수로 Wrapper Div에 이벤트를 발송 하는 Delegator 함수
     * 직접 custom 이벤트를 만들어서 전송하던가 아니면, 이벤트 타입만 넣어줘도 동작한다.
     * IE8 이하는 지원하지 않는다.
     * @param {String|Object} events
     * @param {Boolean} canBubble
     * @return {*}
     */
    p.dispatchEvent = function (events, canBubble) {
        var eventName, localEvt;

        if (_.isString(events)) {
            events = events.split(VObject._eventSplitter);

            while (eventName = events.shift()) {
                (canBubble) ? canBubble = true : canBubble = false;
                if(document.createEvent){
                    localEvt = document.createEvent('HTMLEvents');
                    localEvt.initEvent(eventName,canBubble,true);
                }else if(document.createEventObject){// IE < 9
                    localEvt = document.createEventObject();
                    localEvt.eventType = eventName;
                }
                localEvt.eventName = eventName;
                if(this._domElement.dispatchEvent){
                    this._domElement.dispatchEvent(localEvt);
                }else if(this._domElement.fireEvent && htmlEvents['on'+eventName]){ // IE < 9
                    this._domElement.fireEvent('on'+localEvt.eventType,localEvt);// IE9 미만은 커스텀 이벤트 송출이 불가능 하다
                }else if(this._domElement[eventName]){
                    this._domElement[eventName]();
                }else if(this._domElement['on'+eventName]){
                    this._domElement['on'+eventName]();
                }
            }

        } else if (_.isObject(events)) {

            if(this._domElement.dispatchEvent){
                this._domElement.dispatchEvent(events);
            } else {
                throw new Error("you shouldn't dispatch custom event object. only supported custom event type is string");
            }
        }
        return this;
    };

    p._width = 0;
    /**
     * width 값을 설정하는 Getter/Setter
     * @param {Number} w
     * @return {*}
     */
    p.width = function (w) {
        if (arguments.length) {
            this._width = w;
            this._domElement.style.width = w+"px";
            return this;
        }else{
            this._width = this._domElement.style.width.toString().split("px")[0];
            if(this._width === ""){
                this._width = getComputedStyle(this._domElement).width.toString().split("px")[0];
            }
            return this._width;
        }
    };
    p._height = 0;
    /**
     * height 값을 설정하는 Getter/Setter
     * @param {Number} h
     * @return {*}
     */
    p.height = function (h) {
        if (arguments.length) {
            this._height = h;
            this._domElement.style.height = h+"px";
            return this;
        }else{
            this._height = this._domElement.style.height.toString().split("px")[0];
            if(this._height === ""){
                this._height = getComputedStyle(this._domElement).height.toString().split("px")[0];
            }
            return this._height;
        }

    };

    p._percentWidth = 0;
    /**
     * percent width 값을 설정하는 Getter/Setter
     * @param {Number} w
     * @return {*}
     */
    p.percentWidth = function (w) {
        if (arguments.length) {
            this._percentWidth = w;
            this._domElement.style.width = w+"%";
            return this;
        }else{
            if(this._percentWidth === ""){
                this._percentWidth = getComputedStyle(this._domElement).percentWidth;
            }
            return this._percentWidth;
        }
    };

    p._percentHeight = 0;
    /**
     * percent height 값을 설정하는 Getter/Setter
     * @param {Number} h
     * @return {*}
     */
    p.percentHeight = function (h) {
        if (arguments.length) {
            this._percentHeight = h;
            this._domElement.style.height = h+"%";
            return this;
        }else{
            if(this._percentHeight === ""){
                this._percentHeight = getComputedStyle(this._domElement).percentHeight;
            }
            return this._percentHeight;
        }
    };

    p.x = function(px) {
        if ( arguments.length ) {
            this._string[this._positions[0]] = px - this._ox;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[0]] + this._ox;
        }
    };

    p.y = function(py) {
        if ( arguments.length ) {
            this._string[this._positions[1]] = py - this._oy;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[1]] + this._oy;
        }
    };

    p._pz = 0;
    p.z =  function(pz) {
        if ( arguments.length ) {
            this._string[this._positions[2]] = pz - this._oz;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[2]] + this._oz;
        }
    };

//    p.position = function( px, py, pz) {
//        this._string[this._positions[0]] = px - this._ox;
//        this._string[this._positions[1]] = py - this._oy;
//        if ( arguments.length >= 3 ) this._string[this._positions[2]] = pz - this._oz;
//        if (this.isAutoUpdate) this.updateTransform();
//        return this;
//    };

    p.move = function(px,py,pz) {
        this._string[this._positions[0]] = px - this._ox;
        this._string[this._positions[1]] = py - this._oy;
        if ( arguments.length >= 3 ) this._string[this._positions[2]] = pz - this._oz;
//        this._string[this._positions[0]] += px;
//        this._string[this._positions[1]] += py;
//        if ( arguments.length >= 3 ) this._string[this._positions[2]] += pz;
        if (this.isAutoUpdate) this.updateTransform();

        return this;
    };

    p.rotationX = function(rx) {
        if ( arguments.length ) {
            this._string[this._positions[3]] = rx;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[3]];
        }
    };

    p.rotationY = function(ry) {
        if ( arguments.length ) {
            this._string[this._positions[4]] = ry;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[4]];
        }
    };

    p.rotationZ = function(rz) {
        if ( arguments.length ) {
            this._string[this._positions[5]] = rz;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[5]];
        }
    };

    p.rotation = function(rx,ry,rz) {
        this._string[this._positions[3]] = rx;
        this._string[this._positions[4]] = ry;
        this._string[this._positions[5]] = rz;
        if (this.isAutoUpdate) this.updateTransform();
        return this;
    };


    p.scaleX = function(sx) {
        if ( arguments.length ) {
            this._string[this._positions[6]] = sx;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[6]];
        }
    };

    p.scaleY = function(sy) {
        if ( arguments.length ) {
            this._string[this._positions[7]] = sy;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[7]];
        }
    };

    p.scaleZ = function(sz) {
        if ( arguments.length ) {
            this._string[this._positions[8]] = sz;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[8]];
        }
    };

    p.scale = function(sx,sy,sz) {
        switch(arguments.length){
            case 0:
                if (this.isAutoUpdate) this.updateTransform();
                return this._string[this._positions[6]];
            case 1:
                this._string[this._positions[6]] = sx;
                this._string[this._positions[7]] = sx;
                this._string[this._positions[8]] = sx;
                if (this.isAutoUpdate) this.updateTransform();
                return this;
            case 2:
                this._string[this._positions[6]] = sx;
                this._string[this._positions[7]] = sy;
                this._string[this._positions[8]] = 1;
                if (this.isAutoUpdate) this.updateTransform();
                return this;
            case 3:
                this._string[this._positions[6]] = sx;
                this._string[this._positions[7]] = sy;
                this._string[this._positions[8]] = sz;
                if (this.isAutoUpdate) this.updateTransform();
                return this;
        }
        return this;
    };

    p.origin = function(ox,oy,oz) {
        // failed attempt at auto-centering the registration point of the object
        if ( typeof(ox) === "string" ) {
            /*
             switch(ox){
             case "center":
             this._string[this._positions[0]] = -this.offsetWidth>>1;
             this._string[this._positions[1]] = -this.offsetHeight>>1;
             debugger
             console.log("centering");
             break;
             }
             */
            var cs = window.getComputedStyle(this,null);
            console.log(cs);
            console.log("w:"+ cs.getPropertyValue("width") + " || h: " + cs.height );
        } else {
            if (arguments.length<3) oz = 0;
            this._string[this._positions[0]] += this._ox - ox;
            this._string[this._positions[1]] += this._oy - oy;
            this._string[this._positions[2]] += this._oz - oz;
            this._ox = ox;
            this._oy = oy;
            this._oz = oz;
            if (this.isAutoUpdate) this.updateTransform();
        }
        return this;
    };

    p.transformOrigin = function(tx,ty) {
        if ( arguments.length ) {
            this._domElement.style[ volcano._browserPrefix + "TransformOrigin" ] = (Number(tx)?tx+"px":tx) + " " + (Number(ty)?ty+"px":ty);
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        }else{
            return this._domElement.style[ volcano._browserPrefix + "TransformOrigin" ];
        }
    };

    p.transformString = function(s) {
        var parts = s.toLowerCase().split(" "),
            numParts = parts.length,
            i = 0,
            strings = [],
            positions = [ 0,0,0, 0,0,0, 0,0,0 ],
            n = 0;

        for(i;i<numParts;i++){
            switch( parts[i] ){
                case "p":
                case "position":
                case "translate":
                    // todo: use rx ry rz (regPoint) when re-defining transform order
                    n = strings.push( "translate3d(", this._string[this._positions[0]], "px,", this._string[this._positions[1]], "px,", this._string[this._positions[2]], "px) " );
                    positions[0] = n-6;
                    positions[1] = n-4;
                    positions[2] = n-2;
                    break;
                case "rx":
                case "rotatex":
                case "rotationx":
                    n = strings.push( "rotateX(", this._string[this._positions[3]], "deg) " );
                    positions[3] = n-2;
                    break;
                case "ry" :
                case "rotatey":
                case "rotationy":
                    n = strings.push( "rotateY(", this._string[this._positions[4]], "deg) " );
                    positions[4] = n-2;
                    break;
                case "rz":
                case "rotatez":
                case "rotationz":
                    n = strings.push( "rotateZ(", this._string[this._positions[5]], "deg) " );
                    positions[5] = n-2;
                    break;
                case "s":
                case "scale":
                    n = strings.push( "scale3d(", this._string[this._positions[6]], ",", this._string[this._positions[7]], ",", this._string[this._positions[8]], ") " );
                    positions[6] = n-6;
                    positions[7] = n-4;
                    positions[8] = n-2;
                    break;
            }
        }

        this._string = strings;
        this._positions = positions;

        if (this.isAutoUpdate) this.updateTransform();
        return this;
    };

    p.perspective = function(value) {
        if (arguments.length) {
            if (this.isAutoUpdate) this.updateTransform();
            this._domElement.style[volcano._browserPrefix + "Perspective"] = (typeof(value)==="string")?value:value+"px";
            return this;
        } else {
            return this._domElement.style[volcano._browserPrefix + "Perspective"];
        }
    };

    p.getStyle = function(name) {
        return this._domElement.style[name];
    };

    p.setStyle = function(name, value, prefix) {
        this._domElement.style[name] = value;
        if (arguments.length > 2) this._domElement.style[volcano._browserPrefix + name] = value;
        return this
    };

    p._styleName = "";
    p.styleName = function(value) {
        if (arguments.length){
            this._styleName = value;
            this._domElement.className = value;
            return this;
        }else{
            if (this._styleName !== "") return this._styleName;
            return this._domElement.className;
        }
    };

    p.html = function(value) {
        if (arguments.length){
            this.innerHTML = value;
            return this;
        }else{
            return this.innerHTML;
        }
    };

    /**
     * 3d transform
     * @return {*}
     */
    p.updateTransform = function() {
        var s = "";
        var cnt = 0;
//        console.log("this._string[0] : " , this._string[0]);
//        console.log("this._string[1] : " , this._string[1]);
//        console.log("this._string[2] : " , this._string[2]);
//        console.log("this._string[3] : " , this._string[3]);
//        console.log("this._string[4] : " , this._string[4]);
//        console.log("this._string[5] : " , this._string[5]);
//        console.log("this._string[6] : " , this._string[6]);
//        console.log("this._string[7] : " , this._string[7]);
//        console.log("this._string[8] : " , this._string[8]);
//        console.log("this._string[9] : " , this._string[9]);
//        console.log("this._string[10] : ", this._string[10]);
//        console.log("this._string[11] : ", this._string[11]);
//        console.log("this._string[12]: " , this._string[12]);
//        console.log("this._string[13] : ", this._string[13]);
//        console.log("this._string[14]: " , this._string[14]);
//        console.log("this._string[15]: " , this._string[15]);
//        console.log("this._string[16]: " , this._string[16]);
//        console.log("this._string[17]: " , this._string[17]);
//        console.log("this._string[18]: " , this._string[18]);
//        console.log("this._string[19]: " , this._string[19]);
//        console.log("this._string[20]: " , this._string[20]);
//        console.log("this._string[21]: " , this._string[21]);
//        console.log("this._string[22]: " , this._string[22]);
        _.all(this._string, function(value){
            if(volcano.has3d == true){
                s += value;
            }else{
                if(value === "translate3d("){
                    s += "translate(";
                }
                else if(volcano._browserPrefix == "ms"){
                    if(cnt == 4){
                        s += "px)"  // translate 값 y좌표 px 닫는 문구
                    }else if(cnt < 4){
                        s += value;
                    }else{
                        // 필요없는 속성 제거
                    }
                }else if(volcano._browserPrefix == "O"){
                    if(cnt == 4){
                        s += "px)"  // translate 값 y좌표 px 닫는 문구
                    }else if(cnt < 4){
                        s += value;
                    }else{
                        // 필요없는 속성 제거
                    }
                }else{
                    if(cnt == 5 || cnt == 6 || cnt == 13 || cnt == 14 || cnt == 15 || cnt == 20 || cnt == 21){
                        // 필요없는 속성을 제거한다.
                    }else{
                        if(cnt == 4){
                            s += "px)"  // translate 값 y좌표 px 닫는 문구
                        }else if(cnt == 16){
                            s += "scale(";
                        }else{
                            s += value;
                        }
                    }
                }
            }
            cnt++;
            return true;
        });
        this._domElement.style[volcano._transformProperty] = s;
        return this;
    };

    p._name = "";
    p.name = function(name) {
        if (arguments.length){
            this._name = name;
            return this;
        }else{
            return this._name;
        }
    };

    p._id = "";
    p.id = function(id) {
        if (arguments.length) {
            this._id = id;
            this._domElement.id = id;
            return this;
        }else{
            return this._id;
        }
    };

    p.alpha = function(v){
        if (arguments.length) {
            this._alpha = v;
            this._domElement.style.opacity = v;
            return this;
        }else{
            return this._alpha;
        }
    };

    p._visible = false;
    p.visible = function(v) {
        if (arguments.length) {
            var vstr;
            this._visible = v;
            (v === true) ? vstr = "visible" : vstr = "hidden"
            this._domElement.style.visibility = vstr;
            return this;
        }else{
            return this._visible;
        }
    };

    /**
     * 클레스 네임 추가
     * type Array
     * @return {*}
     */
    p.addClass = function(){
        var className = arguments;
        var len = className.length;
        for(var i = 0 ; i < len ; i++){
            if (!this.hasClass(className[i])) {
                this._domElement.className = this._domElement.className ? this._domElement.className + ' ' + className[i] : className[i];
            }
        }
        return this;
    };

    /**
     * 클레스 네임 삭제
     * type Array
     * @return {*}
     */
    p.removeClass = function(){
        var className = arguments;
        var len = className.length;
        for(var i = 0 ; i < len ; i++){
            if(this.hasClass(className[i])){
                this._domElement.className = this._domElement.className.replace(new RegExp('(^|\\s+)' + className[i] + '(\\s+|$)'), ' ');
            }
        }
        return this;
    };

    p.hasClass = function(className){
        return (" " + this._domElement.className + " ").replace(/[\n\t]/g, " ").indexOf(" " + className + " ") > -1;
    };


    window.volcano.VObject = VObject;

})(window);
