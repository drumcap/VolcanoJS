/*
* VolcanoJS
* Visit http://volcanojs.com/ for documentation, updates and examples.
*
* Copyright (c) 2012 gstech.co.kr, inc.
* 
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*/
/*
 * Core
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

    var previousVolcano = window.volcano;

    var volcano;
    if (typeof exports !== 'undefined') {
        volcano = exports;
    } else {
        volcano = window.volcano = {};
    }

    var _ = window._;
    if (!_ && (typeof require !== 'undefined'))  {
        _ = require('underscore');
        require('backbone');
    }

    if (typeof Backbone !== 'undefined' && Backbone) {
        _.extend(volcano, Backbone);

        volcano.BackboneVersion = volcano.VERSION;
    } else {
        throw new Error("volcanojs needs backbonejs library. \n you must include backbonejs before volcanojs");
    }

    volcano.VERSION = "0.1";
    volcano.OS =

    /**
    * 이전 버전과의 충돌이 있을 경우 이전 버전을 사용 해야 할 때 호출.
    * @method noConflict
    * @return {Object} a string representation of the instance.
    **/
    volcano.noConflict = function() {
      window.volcano = previousVolcano;
      return this;
    };

    /** 클래스가 상속해야할 코어 클래스
    * 기본 네임스페이스 설정과 버전정보가 들어있다
    *
    * @class Core
    * @constructor
    * @author david yun
    **/
    var Core = function() {
      this.initialize();
    };
    Core.extend = window.volcano.Model.extend; // Backbone의 extend를 Core에 심어놓음

    Core._isInit = false;
    Core._isSupported = false;
    Core._browserPrefix = "webkit";
    Core._transformProperty = "webkitTransform";

    var p = Core.prototype;
    p.initialize = function() {

        if (!Core._isInit) {
            var d = document.createElement("div"),
                prefixes = ["", "webkit", "Moz", "O", "ms" ],
                n = prefixes.length, i;

            Core._isInit = true;
            // check for 3D transforms
            for( i = 0; i < n; i++ ) {
                if ( ( prefixes[i] + "Perspective" ) in d.style ) {
                    Core._transformProperty = prefixes[i] + "Transform";
                    Core._isSupported = true;
                    Core._browserPrefix = prefixes[i];
                    return true;
                }
            }
        }
    };

    window.volcano.Core = Core;

})(window);
/*
 * EventDispatcher
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
    * EventDispatcher는 이벤트를 송수신 할 수 있는 메커니즘을 제공하며 Flash와 동일하게 동작한다.
    * Backbone.js 의 Events 클래스를 가져와 Event API 호환성을 유지한다.
    *
    * @class EventDispatcher
    * @constructor
    **/
    var EventDispatcher = function() {
      this.initialize();
    }

    var mp = volcano.Model.prototype,
        cp = volcano.Collection.prototype,
        vp = volcano.View.prototype,
        rp = volcano.Router.prototype,
        vEvents = window.volcano.Events;

    mp.addEventListener = mp.on;
    mp.removeEventListener = mp.off;
    mp.dispatchEvent = mp.trigger;

    cp.addEventListener = cp.on;
    cp.removeEventListener = cp.off;
    cp.dispatchEvent = cp.trigger;

    vp.addEventListener = vp.on;
    vp.removeEventListener = vp.off;
    vp.dispatchEvent = vp.trigger;

    rp.addEventListener = rp.on;
    rp.removeEventListener = rp.off;
    rp.dispatchEvent = rp.trigger;

    var p = EventDispatcher.prototype = new volcano.Core();
    p.Core_initialize = p.initialize;

    p.initialize = function() {
        this.Core_initialize(); //call super
    };

    p.addEventListener = p.on = p.bind = vEvents.on;
    p.removeEventListener = p.off = p.unbind = vEvents.off;
    p.dispatchEvent = p.trigger = vEvents.trigger;

    window.volcano.EventDispatcher = EventDispatcher;

})(window);/*
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
     * @class VObject
     * @constructor
     * @author david yun
     **/
    var VObject = function (element) {
        this.initialize(element);
    };

    VObject._eventSplitter = /\s+/;

    /**
     * Debug를 위해 Div에 랜덤 컬러를 지정 가능하게 한다.
     * @type {Boolean}
     */
    VObject.randomColorMode = false;

    var p = VObject.prototype = new volcano.Core();
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

    p.Core_initialize = p.initialize;
    p.initialize = function (element) {

        var $ = window.Zepto || window.jQuery,
            createContainer;
        // 변수 초기화
        this._domElement = {};
        this.Core_initialize(); //call super

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

            con.style.position = "absolute";
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
        } else if (element.style.position == "static" ) {
            element.style.position = "relative";
        } else {
            element.style.position = "absolute";
        }
        element.style[ volcano.Core._browserPrefix + "TransformStyle" ] = "preserve-3d";
        element.style[ volcano.Core._transformProperty ] = "translateZ(0px)";

        // add private properties
        this._string = [
            "translate3d(", 0, "px,", 0, "px,", 0, "px) ",
            "rotateX(", 0, "deg) ",
            "rotateY(", 0, "deg) ",
            "rotateZ(", 0, "deg) ",
            "scale3d(", 1, ", ", 1, ", ", 1, ") "
        ];
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
        var calls, event, node, tail, list, innerCallback, nodeTarget, cacheTarget, proxyEvent;
        if (!(events || callback)) return this;
        events = events.split(VObject._eventSplitter);
        calls = this._callbacks || (this._callbacks = {});

        innerCallback = function(event) {
            if (event) {

                if (!nodeTarget || cacheTarget != event.target) {
                    nodeTarget = cacheTarget = event.target;
                }

                if (!nodeTarget.volcanoObj) {
                    nodeTarget = nodeTarget.parentNode;
                    innerCallback.call(this,event);
                    return;
                }

                event.volcanoCurrentTarget = this.volcanoObj; //핸들러에서의 this는 currentTarget을 가르킴
                event.volcanoTarget = nodeTarget.volcanoObj;
                event.domCurrentTarget = event.currentTarget;
                event.domTarget = event.target;

                _.extend(proxyEvent={}, event);
                proxyEvent.currentTarget = event.volcanoCurrentTarget;
                proxyEvent.target = event.volcanoTarget;
                proxyEvent.constructor = event.constructor;
            }
            callback(proxyEvent);
        };

        while (event = events.shift()) {
            list = calls[event];
            node = list ? list.tail : {};
            node.next = tail = {};
            node.callback = innerCallback;
            calls[event] = {tail: tail, next: list ? list.next : node};
            this._domElement.addEventListener(event, innerCallback);
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
                this._domElement.removeEventListener(event, cb);
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
        var event, localEvt;

        if (_.isString(events)) {
            events = events.split(VObject._eventSplitter);

            while (event = events.shift()) {
                (canBubble) ? canBubble = true : canBubble = false;

                localEvt = document.createEvent('CustomEvent');
                localEvt.initCustomEvent(event, canBubble, false, {}); //4번째 파라미터는 ie9 오류방지를 위한 data
                this._domElement.dispatchEvent(localEvt);
            }
        } else if (_.isObject(events)) {
            this._domElement.dispatchEvent(events);
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

    p.position = function( px, py, pz) {
        this._string[this._positions[0]] = px - this._ox;
        this._string[this._positions[1]] = py - this._oy;
        if ( arguments.length >= 3 ) this._string[this._positions[2]] = pz - this._oz;
        if (this.isAutoUpdate) this.updateTransform();
        return this;
    };

    p.move = function(px,py,pz) {
        this._string[this._positions[0]] += px;
        this._string[this._positions[1]] += py;
        if ( arguments.length >= 3 ) this._string[this._positions[2]] += pz;
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
                //this._string[this._positions[8]] = 1;
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
            this._domElement.style[ volcano.Core._browserPrefix + "TransformOrigin" ] = (Number(tx)?tx+"px":tx) + " " + (Number(ty)?ty+"px":ty);
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        }else{
            return this._domElement.style[ volcano.Core._browserPrefix + "TransformOrigin" ];
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
        switch(arguments.length) {
            case 0:
                return this._domElement.style[volcano.Core._browserPrefix + "Perspective"];

            case 1:
                if (this.isAutoUpdate) this.updateTransform();
                this._domElement.style[volcano.Core._browserPrefix + "Perspective"] = (typeof(value)==="string")?value:value+"px";
                return this;
        }
    };

    p.getStyle = function(name) {
        return this._domElement.style[name];
    };

    p.setStyle = function(name, value) {
        this._domElement.style[name] = value;
        if (arguments.length > 2) this._domElement.style[volcano.Core._browserPrefix + name] = value;
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

    p.updateTransform = function() {
        var s = "";
        _.all(this._string, function(value){ s += value; return true; });
        this._domElement.style[volcano.Core._transformProperty] = s;
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
    }

    window.volcano.VObject = VObject;

})(window);
/*
 * VSprite
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
     * Sprite의 간단한 기능들을 가지고 있는 추상 클래스
     * DOM Event 처리와, 차일드 관리 기능을 포함하고 있다.
     * @class VSprite
     * @constructor
     * @author david yun
     **/
    var VSprite = function (element) {
        this.initialize(element);
    };

    var p = VSprite.prototype = new volcano.VObject();
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
     * @type VSprite
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

    // OriginX 값
    p._ox = 0;

    // OriginY 값
    p._oy = 0;

    // OriginZ 값
    p._oz = 0;

    p.VObject_initialize = p.initialize;
    p.initialize = function (element) {
        // 변수 초기화
        this._domElement = {};
        this._elementsContent = [];
        this.parent = {};

        this.VObject_initialize(element); //call super
    };

    /**
     * Displaylist 의 범위계산 에러체크
     * @param {Number} index
     * @param {Boolean} isAddingElement
     * @private
     */
    p._checkRangeError = function (index, isAddingElement) {
        var maxIndex = this._elementsContent.length - 1;
        if (isAddingElement) {
            maxIndex++;
        }
        if (index < 0 || index > maxIndex) {
            throw "Elements Range Error";
        }
    };

    /**
     * addElement의 후처리 로직으로 Wrapper Div의 DOM 요소 추가를 한다.
     * @param {Object} element
     * @param {Number} index
     * @param {Boolean} notifyListeners
     * @private
     */
    p._elementAdded = function (element, index, notifyListeners) {
        element.parent = this;
        var host = this._domElement,
            elementDiv = element._domElement;

        // fixme 향후 Canvas 가 아닌 다른 Element 가 올 수 있으므로, 그 때 수정해야 함.
        var canvasNum = 0;
        if(host.children.length > 0) canvasNum = host.children[0].localName === "canvas" ? 1 : 0;

        if ((host.children.length - canvasNum) === index) {
            host.appendChild(elementDiv);
        } else {
            console.log(this.getElementAt(index)._domElement);
            host.insertBefore(elementDiv, this.getElementAt(index)._domElement);
        }

        if (notifyListeners) {
            this.dispatchEvent("elementAdded");
        }
    };
    /**
     * removeElement의 후처리 로직으로 Wrapper Div의 DOM 요소 제거를 한다.
     * @param {Object} element
     * @param {Number} index
     * @param {Boolean} notifyListeners
     * @private
     */
    p._elementRemoved = function (element, index, notifyListeners) {
        element.parent = null;
        this._domElement.removeChild(element._domElement);

        if (notifyListeners) {
            this.dispatchEvent("elementRemoved");
        }
    };

    /**
     * DisplayList의 전체 요소 갯수
     * @return {Number}
     */
    p.getNumElements = function () {
        return this._elementsContent.length;
    };

    /**
     * 해당 인덱스의 요소 반환
     * @param {Number} index
     * @return {*}
     */
    p.getElementAt = function (index) {
        this._checkRangeError(index, false);
        return this._elementsContent[index];
    };

    /**
     * DisplayList에 차일드 요소 추가
     * @param {Object} element
     * @return {*}
     */
    p.addElement = function (element) {
        var index = this.getNumElements();

        if (element.parent === this) {
            index = this.getNumElements() - 1;
        }
        return this.addElementAt(element, index);
    };
    /**
     * DisplayList의 원하는 인덱스에 차일드 요소 추가
     * @param {Object} element
     * @param {Number} index
     * @return {*}
     */
    p.addElementAt = function (element, index) {
        if (element === this) {
            throw "Cannot add yourself as your Child";
        }
        this._checkRangeError(index, true);

        var host = element.parent;
        if (host === this) {
            this.setElementIndex(element, index);
            return element;
        } else if (host instanceof VSprite){
            host.removeElement(element);
        }

        this._elementsContent.splice(index, 0, element);

        this._elementAdded(element, index);

        return element;
    };
    /**
     * 해당 요소를 DisplayList에서 제거
     * @param {Object} element
     * @return {*}
     */
    p.removeElement = function (element) {
        return this.removeElementAt(this.getElementIndex(element));
    };
    /**
     * DisplayList에서 해당 인덱스의 요소 제거
     * @param {Number} index
     */
    p.removeElementAt = function (index) {
        this._checkRangeError(index);

        var element = this._elementsContent[index];
        this._elementRemoved(element, index);
        this._elementsContent.splice(index, 1);
    };
    /**
     * DisplayList의 모든 요소를 제거
     */
    p.removeAllElements = function () {
        // DisplayList는 역순제거를 해야한다.
        for (var i = this.getNumElements() - 1; i >= 0; i--) {
            this.removeElementAt(i);
        }
    };
    /**
     * DisplayList에서 해당 요소의 인덱스를 반환
     * @param {Object} element
     * @return {*}
     */
    p.getElementIndex = function (element) {
        return _.indexOf(this._elementsContent, element);
        //TODO Element 발견 못할 시에 에러처리 할지 말지 결정.
//        var index = _.indexOf(this._elementsContent, element);
//        if (index === -1) {
//            throw "element not found in this DisplayList";
//        } else {
//            return index;
//        }
    };
    /**
     * 해당 요소의 인덱스를 변경한다.
     * @param {Object} element
     * @param {Number} index
     */
    p.setElementIndex = function (element, index) {
        this._checkRangeError(index);

        if (this.getElementIndex(element) === index) {
            return;
        }

        this.removeElement(element);
        this.addElementAt(element, index);
    };

    window.volcano.VSprite = VSprite;

})(window);
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

})(window);/*
 * LayoutManager
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
    * Volcano의 레이아웃 관리 정책에 따른 레이아웃 생명주기 관리자 클래스이다.
    * Flex의 생명주기와 동일하게 가져가기 위해서 interface를 동일하게 구성했다.
    *
    * @class LayoutManager
    * @author david yun
    **/
    var LayoutManager = function() {
        throw "LayoutManager cannot be initialized.";
    };

    /**
     * PriorityQueue Class Function
     * @constructor
     */
    var PriorityQueue = function(){
        this._priorityBins = [];
        var minPriority = 0;
        var maxPriority = -1;

        this.addObject = function(obj, priority){
            if(maxPriority < minPriority){
                minPriority = maxPriority = priority;
            }else{
                if(priority < minPriority){
                    minPriority = priority;
                }
                if(priority > maxPriority){
                    maxPriority = priority;
                }
            }

            var bin = this._priorityBins[priority];

            if(!bin){
                bin = new PriorityBin();
                this._priorityBins[priority] = bin;
                bin.items.push(obj);
                bin.length++;
            }else{
                if(_.indexOf(bin.items,obj) !== 1){
                    bin.items.push(obj);
                    bin.length++;
                }
            }

        };

        this.removeLargest = function(){
            var obj = null;

            if(minPriority <= maxPriority){
                var bin = this._priorityBins[maxPriority];
                while(!bin || bin.length === 0){
                    maxPriority--;
                    if(maxPriority < minPriority){
                        return null;
                    }
                    bin = this._priorityBins[maxPriority];
                }

                for(var i = 0 ; i < bin.items.length ; i++){
                    obj = bin.items[i];
                    this.removeChild(bin.items[i], maxPriority);
                    break;
                }

                while(!bin || bin.length === 0){
                    maxPriority--;
                    if(maxPriority < minPriority){
                        break;
                    }
                    bin = this._priorityBins[maxPriority];
                }
            }
            return obj;
        };

        this.removeLargestChild = function(client){
            var max = maxPriority;
            var min = client.getNestLevel();

            while(min <= max){
                var bin = this._priorityBins[max];
                if(bin && bin.length > 0){
                    if(max === client.getNestLevel()){
                        for(var i = 0 ; i < bin.items.length ; i++){
                            if(client === bin.items[i]){
                                this.removeChild(bin.items[i], max);
                                return client;
                            }
                        }
                    }else{
                        for(var i = 0 ; i < bin.items.length ; i++){
                            if((bin.items[i] instanceof volcano.UIComponent) && contains(client, bin.items[i])){
                                this.removeChild(bin.items[i], max);
                                return bin.items[i];
                            }
                        }
                    }

                    max--;
                }else{
                    if(max === maxPriority){
                        maxPriority--;
                    }
                    max--;
                    if(max < min){
                        break;
                    }
                }
            }
            return null;
        };

        this.removeSmallest = function(){
            var obj = null;

            if(minPriority <= maxPriority){
                var bin = this._priorityBins[minPriority];
                while(!bin || bin.length === 0){
                    minPriority++;
                    if(minPriority > maxPriority){
                        return null;
                    }
                    bin = this._priorityBins[minPriority];
                }
                for(var i = 0 ; i < bin.items.length ; i++){
                    obj = bin.items[i];
                    this.removeChild(bin.items[i], minPriority);
                    break;
                }

                while(!bin || bin.length === 0){
                    minPriority++;
                    if(minPriority > maxPriority){
                        break;
                    }
                    bin = this._priorityBins[minPriority];
                }
            }
            return obj;
        };

        this.removeSmallestChild = function(client){
            var min = client.getNestLevel();

            while(min <= maxPriority){
                var bin = this._priorityBins[min];
                if(bin && bin.length > 0){
                    if(min === client.getNestLevel()){
                        for(var i = 0 ; i < bin.items.length ; i++){
                            if(client === bin.items[i]){
                                this.removeChild(client, min);
                            }
                        }
                    }else{
                        for(var key in bin.items){
                            for(var i = 0 ; i < bin.items.length ; i++){
                                if((bin.items[i] instanceof volcano.UIComponent) && contains(client, bin.items[i])){
                                    this.removeChild(bin.items[i], min);
                                    return bin.items[i];
                                }
                            }
                        }
                    }
                    min++;
                }else{
                    if(min === minPriority){
                        minPriority++;
                    }
                    min++;

                    if(min > maxPriority){
                        break;
                    }
                }
            }
            return null;
        };

        this.removeChild = function(client, level){
            var pri = (level >= 0) ? level : client.getNestLevel();
            var bin = this._priorityBins[pri];
            for(var i = 0 ; i < bin.items.length ; i++){
                if(bin.items[i] === client){
                    bin.items.splice(i, 1);
                    bin.length--;
                    return client;
                }
            }
            return null;
        };

        this.removeAll = function(){
            this._priorityBins.length = 0;
            minPriority = 0;
            maxPriority = -1;
        };

        this.isEmpty = function(){
            return minPriority > maxPriority;
        };

        var contains = function(parent, child){
            // todo 타입 비교 조건 분기 문. cotnainer는 추후 제작
            return parent === child;
        };

        /**
         * PriorityBin
         * @constructor
         */
        var PriorityBin = function(){
            this.length = 0;
            this.items = [];
        }
    };

    LayoutManager.systemManager = null;  // systemManager를 생성하면 여기에 자동으로 잡힌다.

    LayoutManager._updateCompleteQueue = new PriorityQueue();
    LayoutManager._invalidatePropertiesQueue = new PriorityQueue();
    LayoutManager._invalidatePropertiesFlag = false;
    LayoutManager._invalidateClientPropertiesFlag = false;
    LayoutManager._invalidateSizeQueue = new PriorityQueue();
    LayoutManager._invalidateSizeFlag = false;
    LayoutManager._invalidateClientSizeFlag = false;
    LayoutManager._invalidateDisplayListQueue = new PriorityQueue();
    LayoutManager._invalidateDisplayListFlag = false;
    LayoutManager._waitAFrame = false;
    LayoutManager._listenersAttached = false;
    LayoutManager._originalFrameRate = NaN;
    LayoutManager._targetLevel = Number.MAX_VALUE; //2147483647
    LayoutManager._currentObject = {};
    LayoutManager._usePhasedInstantiation = false;

    LayoutManager.getUsePhasedInstantiation = function () {
        return LayoutManager._usePhasedInstantiation;
    };

    LayoutManager.setUsePhasedInstantiation = function (value) {
        if(LayoutManager._usePhasedInstantiation !== value){
            LayoutManager._usePhasedInstantiation = value;

            // XXX stage frameRate 설정 try catch
        }
    };


    LayoutManager.invalidateProperties = function (obj) {
        if(!LayoutManager._invalidatePropertiesFlag){
            LayoutManager._invalidatePropertiesFlag = true;
            if(!LayoutManager._listenersAttached){
                LayoutManager.attachListeners(LayoutManager.systemManager);
            }
        }
        if(LayoutManager._targetLevel <= obj.getNestLevel()){
            LayoutManager._invalidateClientPropertiesFlag = true;
        }
        LayoutManager._invalidatePropertiesQueue.addObject(obj, obj.getNestLevel());

    };

    LayoutManager.invalidateSize = function (obj) {
        if(!LayoutManager._invalidateSizeFlag){
            LayoutManager._invalidateSizeFlag = true;
            if(!LayoutManager._listenersAttached){
                LayoutManager.attachListeners(LayoutManager.systemManager);
            }
        }

        if(LayoutManager._targetLevel <= obj.getNestLevel()){
            LayoutManager._invalidateClientSizeFlag = true;
        }
        LayoutManager._invalidateSizeQueue.addObject(obj, obj.getNestLevel());
    };

    LayoutManager.invalidateDisplayList = function (obj) {
        if(!LayoutManager._invalidateDisplayListFlag){
            LayoutManager._invalidateDisplayListFlag = true;

            if(!LayoutManager._listenersAttached){
                LayoutManager.attachListeners(LayoutManager.systemManager);
            }
        }
        LayoutManager._invalidateDisplayListQueue.addObject(obj, obj.getNestLevel());
    };

    LayoutManager._validateProperties = function() {
        var obj = LayoutManager._invalidatePropertiesQueue.removeSmallest();
        while(obj){
            if(obj.getNestLevel()){
                LayoutManager._currentObject = obj;
                obj.validateProperties();
                if(!obj.getUpdateCompletePendingFlag()){
                    LayoutManager._updateCompleteQueue.addObject(obj, obj.getNestLevel());
                    obj.setUpdateCompletePendingFlag(true);
                }
            }
            obj = LayoutManager._invalidatePropertiesQueue.removeSmallest();
        }

        if(LayoutManager._invalidatePropertiesQueue.isEmpty()){
            LayoutManager._invalidatePropertiesFlag = false;
        }
    };

    LayoutManager._validateSize = function() {
        var obj = LayoutManager._invalidateSizeQueue.removeLargest();
        while(obj){
            if(obj.getNestLevel()){
                LayoutManager._currentObject = obj;
                obj.validateSize();
                if(!obj.getUpdateCompletePendingFlag()){
                    LayoutManager._updateCompleteQueue.addObject(obj, obj.getNestLevel());
                    obj.setUpdateCompletePendingFlag(true);
                }
            }

            obj = LayoutManager._invalidateSizeQueue.removeLargest();
        }

        if(LayoutManager._invalidateSizeQueue.isEmpty()){
            LayoutManager._invalidateSizeFlag = false;
        }
    };

    LayoutManager._validateDisplayList = function() {
        obj = LayoutManager._invalidateDisplayListQueue.removeSmallest();
        while(obj){
            if(obj.getNestLevel()){
                LayoutManager._currentObject = obj;
                obj.validateDisplayList();
                if(!obj.getUpdateCompletePendingFlag()){
                    LayoutManager._updateCompleteQueue.addObject(obj, obj.getNestLevel());
                    obj.getUpdateCompletePendingFlag(true);
                }
            }

            obj = LayoutManager._invalidateDisplayListQueue.removeSmallest();
        }

        if(LayoutManager._invalidateDisplayListQueue.isEmpty()){
            LayoutManager._invalidateDisplayListFlag = false;
        }
    };

    LayoutManager._doPhasedInstantiation = function() {
        if(LayoutManager.getUsePhasedInstantiation()){
            if(LayoutManager._invalidatePropertiesFlag){
                LayoutManager._validateProperties();
                //XXX Flex API -> The Preloader listens for this event.
            }else if(LayoutManager._invalidateSizeFlag){
                LayoutManager._validateSize();
                //XXX Flex API -> The Preloader listens for this event.
            }else if(LayoutManager._invalidateDisplayListFlag){
                LayoutManager._validateDisplayList();
                //XXX Flex API -> The Preloader listens for this event.
            }
        }else{
            if(LayoutManager._invalidatePropertiesFlag){
                LayoutManager._validateProperties();
            }
            if(LayoutManager._invalidateSizeFlag){
                LayoutManager._validateSize();
            }
            if(LayoutManager._invalidateDisplayListFlag){
                LayoutManager._validateDisplayList();
            }
        }

        if(LayoutManager._invalidatePropertiesFlag || LayoutManager._invalidateSizeFlag || LayoutManager._invalidateDisplayListFlag){
            LayoutManager.attachListeners(LayoutManager.systemManager);
        }else{
            LayoutManager.setUsePhasedInstantiation(false);
            LayoutManager._listenersAttached = false;

            var obj = LayoutManager._updateCompleteQueue.removeLargest();
            while(obj){
                if(!obj.getInitialized() && obj.getProcessedDescriptors()){
                    obj.setInitialized(true);
                }
                obj.dispatchEvent("updateComplete");
                obj.setUpdateCompletePendingFlag(false);
                obj = LayoutManager._updateCompleteQueue.removeLargest();
            }
            //TODO effect Handler를 위한 updateComplete Event Dispatch host = LayoutManager

        }
    };

    LayoutManager._doPhasedInstantiationCallback = function(event) {
        if(volcano.UIComponent._callLaterDispatcherCount > 0){
            return;
        }

        LayoutManager.systemManager.removeEnterFrameListener(LayoutManager._doPhasedInstantiationCallback);

        if(!volcano.UIComponent._catchCallLaterExceptions){
            LayoutManager._doPhasedInstantiation();
        }else{
            try{
                LayoutManager._doPhasedInstantiation();
            }catch(e){
                throw "callLaterError LayoutManager";
            }
        }

        LayoutManager._currentObject = null;
    };

    LayoutManager.validateNow = function () {
        if(!LayoutManager.getUsePhasedInstantiation()){
            var infiniteLoopGuard = 0;
            while(LayoutManager._listenersAttached && infiniteLoopGuard++ < 100){
                LayoutManager._doPhasedInstantiation();
            }
        }
    };

    LayoutManager.validateClient = function (target, skipDisplayList) {
        var lastCurrentObject = LayoutManager._currentObject;
        var obj;
        var i = 0;
        var done = false;
        var oldTargetLevel = LayoutManager._targetLevel;

        if(LayoutManager._targetLevel === Number.MAX_VALUE){
            LayoutManager._targetLevel = target.getNestLevel();
        }

        while(!done){
            done = true;

            obj = LayoutManager._invalidatePropertiesQueue.removeSmallestChild(target);
            while(obj){
                if(obj.getNestLevel()){
                    LayoutManager._currentObject = obj;
                    obj.validateProperties();
                    if(!obj.getUpdateCompletePendingFlag()){
                        LayoutManager._updateCompleteQueue.addObject(obj, obj.getNestLevel());
                        obj.setUpdateCompletePendingFlag(true);
                    }
                }

                obj = LayoutManager._invalidatePropertiesQueue.removeSmallestChild(target);
            }

            if(LayoutManager._invalidatePropertiesQueue.isEmpty()){
                LayoutManager._invalidatePropertiesFlag = false;
                LayoutManager._invalidateClientPropertiesFlag = false;
            }

            obj = LayoutManager._invalidateSizeQueue.removeLargestChild(target);

            while(obj){
                if(obj.getNestLevel()){
                    LayoutManager._currentObject = obj;
                    obj.validateSize();
                    if(!obj.getUpdateCompletePendingFlag()){
                        LayoutManager._updateCompleteQueue.addObject(obj, obj.getNestLevel());
                        obj.setUpdateCompletePendingFlag(true)
                    }
                }

                if(LayoutManager._invalidateClientPropertiesFlag){
                    obj = LayoutManager._invalidatePropertiesQueue.removeSmallestChild(target);
                    if(obj){
                        LayoutManager._invalidatePropertiesQueue.addObject(obj, obj.getNestLevel());
                        done = false;
                        break;
                    }
                }

                obj = LayoutManager._invalidateSizeQueue.removeLargestChild(target);
            }

            if(LayoutManager._invalidateSizeQueue.isEmpty()){
                LayoutManager._invalidateSizeFlag = false;
                LayoutManager._invalidateClientSizeFlag = false;
            }

            if(!skipDisplayList){
                obj = LayoutManager._invalidateDisplayListQueue.removeSmallestChild(target);
                while(obj){
                    if(obj.getNestLevel()){
                        LayoutManager._currentObject = obj;
                        obj.validateDisplayList();
                        if(!obj.getUpdateCompletePendingFlag()){
                            LayoutManager._updateCompleteQueue.addObject(obj, obj.getNestLevel());
                            obj.setUpdateCompletePendingFlag(true);
                        }
                    }

                    if(LayoutManager._invalidateClientPropertiesFlag){
                        obj = LayoutManager._invalidatePropertiesQueue.removeSmallestChild(target);
                        if(obj){
                            LayoutManager._invalidatePropertiesQueue.addObject(obj, obj.getNestLevel());
                            done = false;
                            break;
                        }
                    }

                    if(LayoutManager._invalidateClientSizeFlag){
                        obj = LayoutManager._invalidateSizeQueue.removeLargestChild(target);
                        if(obj){
                            LayoutManager._invalidateSizeQueue.addObject(obj, obj.getNestLevel());
                            done = false;
                            break;
                        }
                    }

                    obj = LayoutManager._invalidateDisplayListQueue.removeSmallestChild(target);
                }

                if(LayoutManager._invalidateDisplayListQueue.isEmpty()){
                    LayoutManager._invalidateDisplayListFlag = false;
                }
            }
        }

        if(oldTargetLevel === Number.MAX_VALUE){
            LayoutManager._targetLevel = Number.MAX_VALUE;
            if(!skipDisplayList){
                obj = LayoutManager._updateCompleteQueue.removeLargestChild(target);
                while(obj){
                    if(!obj.getInitialized()){
                        obj.setInitialized(true);
                    }

                    // XXX obj의 hasEventListener이 있어야 한다.

                    obj.setUpdateCompletePendingFlag(false);
                    obj = LayoutManager._updateCompleteQueue.removeLargestChild(target);
                }
            }
        }

        LayoutManager._currentObject = lastCurrentObject;
    };

    LayoutManager._waitFrame = function(){
        LayoutManager.systemManager.removeEnterFrameListener(LayoutManager._waitFrame);
        LayoutManager.systemManager.addEnterFrameListener(LayoutManager._doPhasedInstantiationCallback);
        LayoutManager._waitAFrame = true;
    };

    LayoutManager.attachListeners = function (systemManager) {
        if(!LayoutManager._waitAFrame){
            systemManager.addEnterFrameListener(LayoutManager._waitFrame);
        }else{
            systemManager.addEnterFrameListener(LayoutManager._doPhasedInstantiationCallback);
        }
        LayoutManager._listenersAttached = true;
    };

    window.volcano.LayoutManager = LayoutManager;

})(window);
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
    p._domElement = null;
    p._skinCanvas = null;
    p._updateCompletePendingFlag = false;
    p._processedDescriptiors = false;

    p.VSprite_initialize = p.initialize;

    p.initialize = function() {
        // 변수 초기화 (primitive 이외의 타입은 반드시 초기화 해야함)
        this._methodQueue = [];
        this.systemManager = volcano.LayoutManager.systemManager;
        this._skin = {}; //todo skin architecture 완성되면 코드삽입
        this.states = []; //todo state mechanism 완성되면 코드삽입
        this._deferredSetStyles = {};
        this._owner = {};

        this._domElement = {};
        this._skinCanvas = {};

        this.VSprite_initialize(); //super

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
        this._domElement.appendChild(this._skinCanvas);
    };

    p.getOwner = function() {
        return this._owner ? this._owner : this.parent;
    };
    p.setOwner = function (o) {
        this._owner = o;
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
        this._domElement.width = w+"px";
        this.invalidateProperties();
        this.invalidateDisplayList();
        return this;
    };

    p.setPercentWidth = function(w) {
        this._percentWidth = w;
        this._domElement.width = w+"%";
        this.invalidateProperties();
        this.invalidateDisplayList();
        return this;
    };

    p.setHeight = function(h) {
        this._height = h;
        this._domElement.height = h+"px";
        this.invalidateProperties();
        this.invalidateDisplayList();
        return this;
    };

    p.setPercentHeight = function(h) {
        this._percentHeight = h;
        this._domElement.height = h+"%";
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
            this._domElement.width = w+"px";
            this._skinCanvas.width = w+"px";
            changed = true;
        }
        if (this._height != h) {
            this._domElement.width = h+"px";
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
        var wrapperStyle = this._domElement.style;
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

    p.VSprite__elementAdded = p._elementAdded;
    p._elementAdded = function (element, index, notifyListeners) {
        this.VSprite__elementAdded(element, index, notifyListeners); //super

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

    p.VSprite__elementRemoved = p._elementRemoved;
    p._elementRemoved = function(element, index, notifyListeners){

        element.parentChanged(null);

        this.VSprite__elementRemoved(element, index, notifyListeners); //super
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

})(window);/*
 * SkinnableComponent
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
     * Skinnable Architecture 구현한 베이스 컴포넌트
     * You have to implement below method to make component
     * getSkinParts : defines skin parts
     * getCurrentSkinState : defines skin state
     * partAdded : add Event Handler or Initialize code
     * partRemoved : remove Event Handler or Initialize code
     *
     * @class SkinnableComponent
     * @constructor
     * @author David Yun
     */
    var SkinnableComponent = function () {
        this.initialize();
    };

    var p = SkinnableComponent.prototype = new volcano.UIComponent();

    p.UIComponent_initialize = p.initialize;

    p.initialize = function () {
        this.UIComponent_initialize(); //super
    };


// protected Method
    /**
     * 객체 생성및 초기화를 위한 override 메소드
     * @protected
     */
    p.createChildren = function () {
        this._validateSkinChange();
    };

    /**
     * Skinnable Component API
     *
     */

    p._skinStateIsDirty = false;
    /**
     * 스킨의 State 변경으로 인한 화면 업데이트를 위한 invalidate 예약 명령어
     * @public
     */
    p.invalidateSkinState = function () {
        if (!this._skinStateIsDirty) {
            this._skinStateIsDirty = true;
            this.invalidateProperties();
        }
    };

    /**
     * 스킨에서 사용할 스킨파트 정보를 객체로 담아놓는다.
     * 이 메소드는 직접 호출하는 함수가 아니고, findSkinParts, clearSkinParts 에 의해 자동으로 호출된다.
     * UIComponent의 서브클래스는 이 메소드를 재정의 해야한다.
     * @protected
     * @return {Object}
     */
    p.getSkinParts = function () {
        // {partName : required}
        //var ret = {"iconDisplay":false, "labelDisplay":false};
        var ret = null;
        return ret;
    };

    /**
     * 컴포넌트의 스킨을 만든다.
     * 이 메소드는 직접 호출하는 함수가 아니고, createChildren, commitProperties 에 의해 자동으로 호출된다.
     * @protected
     */
    p.attachSkin = function () {
        if (!this._skin) {
            var skinClass = this.getStyle("skinClass");

            if (skinClass) {
                this.setSkin(new this[skinClass]);
            }

            if (this._skin) {
                this._skin.setOwner(this);

                this._skin.setStyleName(this);

                this.addElement(this._skin);
            }

            this.findSkinParts();
            this.invalidateSkinState();
        }
    };

    /**
     * 스킨 파트에 대한 참조를 제거한다.
     * 이 메소드는 직접 호출하는 함수가 아니고, detachSkin() 에 의해 자동으로 호출된다.
     * @protected
     */
    p.clearSkinParts = function () {
        var skinParts = this.getSkinParts();
        if (skinParts) {
            for (var id in skinParts) {
                if (this[id] !== null) {
                    this.partRemoved(id, this[id]);
                    //XXX dynamic parts 구현할 시에 추가 구현
                }
            }
        }
    };

    /**
     * 컴포넌트의 스킨을 무시하고 삭제한다.
     * 이 메소드는 직접 호출하는 함수가 아니고, 런타임에 스킨이 변경될 때 자동으로 호출된다.
     * @protected
     */
    p.detachSkin = function () {
        this._skin.setStyleName(null);
        this.clearSkinParts();
        this.removeElement(this._skin);
        this.setSkin(null);
    };

    /**
     * 스킨파트 스킨 클래스에서 찾아 컴포넌트의 속성에 할당한다.
     * 이 메소드는 직접 호출하는 함수가 아니고, attachSkin() 에 의해 자동으로 호출된다.
     * @protected
     */
    p.findSkinParts = function () {
        var skinParts = this.getSkinParts();
        if (skinParts) {
            for (var id in skinParts) {
                if (skinParts[id] == true) { // 'skinpart required value' is true
                    if (!(id in this._skin)) {
                        throw "Required Skin Part Not Found";
                    }
                }

                if (id in this._skin) {
                    this[id] = this._skin[id];

                    if (this[id] !== null) {
                        this.partAdded(id, this[id]);
                    }
                }
            }
        }
    };

    /**
     * 스킨에 적용되는 상태의 이름을 반환한다.
     * 예를들어 Button 컴포넌트는 상태를 지정하기 위해 "up", "down", "over", "disabled" 라는 문자열을 반환할 수 있다.
     * UIComponent의 서브클래스는 이 메소드를 재정의 해야한다.
     * @protected
     */
    p.getCurrentSkinState = function () {
        return null;
    };

    /**
     * 스킨파트가 추가될 때 호출된다.
     * 이 메소드는 직접 호출하는 함수가 아니고, attachSkin() 에 의해 자동으로 호출된다.
     * UIComponent의 서브클래스는 이 메소드를 재정의 해야한다.
     * @protected
     */
    p.partAdded = function (partName, instance) {
    };

    /**
     * 스킨파트가 제거될 때 호출된다.
     * 이 메소드는 직접 호출하는 함수가 아니고, detachSkin() 에 의해 자동으로 호출된다.
     * UIComponent의 서브클래스는 이 메소드를 재정의 해야한다.
     * @protected
     */
    p.partRemoved = function (partName, instance) {
    };

    p._validateSkinChange = function () {
        var skinReload = false;

        //XXX 스킨 변경에 따른 skinReload flag 조절

        if (!skinReload) {
            if (this._skin) {
                this.detachSkin();
            }
            this.attachSkin();
        }
    };

    //XXX dynamic skinpart 관련 메소드 필요시 구현

    window.volcano.SkinnableComponent = SkinnableComponent;
})(window);(function (window) {
    /**
     * VolcanoJS Project
     * Skin 제작을 위한 기본 컴포넌트
     * You have to implement below method to make Skin
     * commitCurrentState : defines skin parts
     * layoutContents
     * drawBackground
     *
     * @class SkinBase
     * @constructor
     * @author David Yun
     *
     */
    var SkinBase = function () {
        this.initialize();
    };

    var p = SkinBase.prototype = new volcano.UIComponent();

    p._applicationDPI = 160;
    p.measuredDefaultHeight = 0;
    p.measuredDefaultWidth = 0;

    p.UIComponent_initialize = p.initialize;
    p.initialize = function () {
        this.UIComponent_initialize(); //super
    };

    p._currentState = "";
    p.getCurrentState = function () {
        return this._currentState;
    };

    p.setCurrentState = function (value) {
        if (value !== this._currentState) {
            this._currentState = value;
            this.commitCurrentState();
        }
    };

    p.beginHighlightBitmapCapture = function () {
        //XXX HighlightBitmapCapture 구현여부 결정하고 작업 해야함
    };
    p.endHighlightBitmapCapture = function () {
        //XXX HighlightBitmapCapture 구현여부 결정하고 작업 해야함
    };
    p.hasState = function (stateName) {
        return true;
    };

    p.applyColorTransform = function (uiComponent, originalColor, tintColor) {
        //XXX ColorTransform 구현여부 결정하고 작업 해야함
    };

    p.getElementPreferredHeight = function (element) {
        if (element instanceof volcano.LayoutBase) {
            return element.getPreffrredBoundsWidth();
        } else if (element instanceof volcano.UIComponent) {
            return element.getMeasuredWidth();
        } else {
            return element.getWidth();
        }
    };

    p.getElementPreferredWidth = function (element) {
        if (element instanceof volcano.LayoutBase) {
            return element.getPreffrredBoundsHeight();
        } else if (element instanceof volcano.UIComponent) {
            return element.getMeasuredHeight();
        } else {
            return element.getHeight();
        }
    };

    p.setElementPosition = function (element, x, y) {
        if (element instanceof volcano.LayoutBase) {
            element.setLayoutBoundPosition(x, y, false);
        } else if (element instanceof volcano.UIComponent) {
            element.move(x, y);
        } else {
            element.setX(x);
            element.setY(y);
        }
    };
    p.setElementSize = function (element, width, height) {
        if (element instanceof volcano.LayoutBase) {
            element.setLayoutBoundSize(width, height, false);
        } else if (element instanceof volcano.UIComponent) {
            element.setActualSize(width, height);
        } else {
            element.setWidth(width);
            element.setHeight(height);
        }
    };

    p.UIComponent_getMeasuredWidth = p.getMeasuredWidth;
    p.UIComponent_getMeasuredHeight = p.getMeasuredHeight;
    p.getMeasuredWidth = function () {
        return Math.max(this.UIComponent_getMeasuredWidth(), this.measuredDefaultWidth);
    };
    p.getMeasuredHeight = function () {
        return Math.max(this.UIComponent_getMeasuredHeight(), this.measuredDefaultHeight);
    };

    p.useSymbolColor = false;
    p.UIComponent_updateDisplayList = p.updateDisplayList;
    p.updateDisplayList = function (w, h) {
        //todo graphics.clear();

        this.UIComponent_updateDisplayList(w, h);

        this.layoutContents(w, h);

        if (this.useSymbolColor) {
            this.applySymbolColor();
        }

        if (useMinimumHitArea) {
            this.drawMinimumHitArea(w, h);
        }

        this.drawBackground(w, h);
    };

    p.commitCurrentState = function () {

    };

    p.layoutContents = function (unscaledWidth, unscaledHeight) {

    };

    p.drawBackground = function (unscaledWidth, unscaledHeight) {

    };

    this.window.volcano.SkinBase = SkinBase;

})(window);(function (window) {

    var ColorUtil = function () {
        throw "ColorUtil cannot be initialized.";
    };

    ColorUtil.getRandomColor = function() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    };


    window.volcano.ColorUtil = ColorUtil;

}(window));(function (window) {

    var ObjectUtil = function () {
        throw "ObjectUtil cannot be initialized.";
    };

//private static properties:

    /**
     * @property _inProgress
     * @type Array[Object]
     * @protected
     **/
    ObjectUtil._inProgress = [];


// public static methods:

    /**
     * 객체를 출력해 주는 메소드로 console 객체로 출력하지 않고 화면에 출력하려 할 때 유용하다
     * 주의!! 시스템 객체는 멈출 가능성이 높으므로 사용하지 말것!
     * @method toString
     * @param {Object} obj 출력할 대상 객체
     * @param {Boolean} showFunctions 함수를 출력할 것인지 여부
     * @param {Boolean} showUndefined Undefined를 출력할 것인지 여부
     * @param {Number} maxLineLength 최대 라인 수
     * @param {Number} indent 들여쓰기
     **/
    ObjectUtil.toString = function (obj, showFunctions, showUndefined, maxLineLength, indent) {
        if (maxLineLength == undefined) {
            maxLineLength = 100;
        }
        if (indent == undefined) indent = 0;

        for (var x = 0; x < ObjectUtil._inProgress.length; x++) {
            if (ObjectUtil._inProgress[x] == obj) return "***";
        }
        ObjectUtil._inProgress.push(obj);

        indent++;
        var t = typeof(obj);
        var result;

        if (obj instanceof Date) {
            result = obj.toString();
        }
        else if (t == "object") {
            var nameList = new Array();
            if (obj instanceof Array) {
                result = "["; // "Array" + ":";
                for (var i = 0; i < obj.length; i++) {
                    nameList.push(i);
                }
            }
            else {
                result = "{"; // "Object" + ":";
                for (var i in obj) {
                    nameList.push(i);
                }
                nameList.sort();
            }

            var sep = "";
            for (var j = 0; j < nameList.length; j++) {
                var val = obj[nameList[j]];

                var show = true;
                if (typeof(val) == "function") show = (showFunctions == true);
                if (typeof(val) == "undefined") show = (showUndefined == true);

                if (show) {
                    result += sep;
                    if (!(obj instanceof Array))
                        result += nameList[j] + ": ";
                    result +=
                        ObjectUtil.toString(val, showFunctions, showUndefined, maxLineLength, indent);
                    sep = ", `";
                }
            }
            if (obj instanceof Array)
                result += "]";
            else
                result += "}";
        }
        else if (t == "function") {
            result = "function";
        }
        else if (t == "string") {
            result = "\"" + obj + "\"";
        }
        else {
            result = String(obj);
        }

        if (result == "undefined") result = "-";
        ObjectUtil._inProgress.pop();
        return ObjectUtil.replaceAll(result, "`", (result.length < maxLineLength) ? "" : ("\n" + ObjectUtil.doIndent(indent)));
    }

    /**
     * 입력된 문자열에 치환할 모든 대상을 치환한다.
     * @method replaceAll
     * @param {String} str 입력하려 하는 대상
     * @param {String} from 치환할 검색 대상 문자
     * @param {String} to 치환할 문자
    **/
    ObjectUtil.replaceAll = function (str, from, to) {
        var chunks = str.split(from);
        var result = "";
        var sep = "";
        for (var i = 0; i < chunks.length; i++) {
            result += sep + chunks[i];
            sep = to;
        }
        return result;
    }

    /**
     * 들여쓰기를 한다.
     * @method doIndent
     * @param {Number} indent 들여쓰기 할 빈칸의 수
    **/
    ObjectUtil.doIndent = function (indent) {
        var result = "";
        for (var i = 0; i < indent; i++) {
            result += "     ";
        }
        return result;
    }


    window.volcano.ObjectUtil = ObjectUtil;

}(window));