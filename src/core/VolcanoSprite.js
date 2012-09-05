(function (window) {

    /**
     * Sprite의 간단한 기능들을 가지고 있는 추상 클래스
     * DOM Event 처리와, 차일드 관리 기능을 포함하고 있다.
     * @class VolcanoSprite
     * @constructor
     * @author david yun
     **/
    var VolcanoSprite = function () {
        this.initialize();
    };

    VolcanoSprite._eventSplitter = /\s+/;

    /**
     * Debug를 위해 Div에 랜덤 컬러를 지정 가능하게 한다.
     * @type {Boolean}
     */
    VolcanoSprite.randomColorMode = false;

    var p = VolcanoSprite.prototype = new volcano.Core();
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
     * @type VolcanoSprite
     * @default null
     */
    p.parent = null;

    p._alpha = 1.0;

    p.Core_initialize = p.initialize;
    p.initialize = function () {
        // 변수 초기화
        this._domElement = {};
        this._elementsContent = [];
        this.eventCallback = {};
        this.parent = {};

        this.Core_initialize(); //call super

        var createContainer;

        // wrapper 컨테이너를 생성
        createContainer = function (x, y, w, h, bgColor) {
            var con = document.createElement('div');
            con.style.left = x + "px";
            con.style.top = y + "px";
            con.style.width = w + "px";
            con.style.height = h + "px";
            con.style.webkitTransform = "translateZ(0px)";
            con.style.webkitTransformStyle = "preserve-3d";
            if (bgColor != undefined) {
                con.style.backgroundColor = bgColor;
            }
            if (VolcanoSprite.randomColorMode) {
                con.style.backgroundColor = volcano.ColorUtil.getRandomColor();
                //con.innerHTML = volcano.ColorUtil.getRandomColor();;
                //con.style.opacity = 0.3;
            }

            con.style.position = "absolute";
            return con;
        };

        this._domElement = createContainer(0, 0, this._width, this._height);
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
        events = events.split(VolcanoSprite._eventSplitter);
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
        events = events.split(VolcanoSprite._eventSplitter);

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
            events = events.split(VolcanoSprite._eventSplitter);

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
     * width를 가져오는 Getter
     * @return {*}
     */
    p.getWidth = function () {
        return this._width;
    };
    /**
     * width를 저장하는 Setter
     * @param {Number} w
     * @return {*}
     */
    p.setWidth = function (w) {
        this._width = w;
        this._domElement.style.width = w+"px";
        return this;
    };
    p._height = 0;
    /**
     * height를 가져오는 Getter
     * @return {*}
     */
    p.getHeight = function () {
        return this._height;
    };
    /**
     * height를 저장하는 Setter
     * @param {Number} h
     * @return {*}
     */
    p.setHeight = function (h) {
        this._height = h;
        this._domElement.style.height = h+"px";
        return this;
    };

    p._percentWidth = 0;
    /**
     * percent width를 가져오는 Getter
     * @return {*}
     */
    p.getPercentWidth = function () {
        return this._percentWidth;
    };
    /**
     * percent width를 저장하는 Setter
     * @param {Number} w
     * @return {*}
     */
    p.setPercentWidth = function (w) {
        this._percentWidth = w;
        this._domElement.style.width = w+"%";
        return this;
    };
    p._percentHeight = 0;
    /**
     * percent height를 가져오는 Getter
     * @return {*}
     */
    p.getPercentHeight = function () {
        return this._percentHeight;
    };
    /**
     * percent height를 저장하는 Setter
     * @param {Number} h
     * @return {*}
     */
    p.setPercentHeight = function (h) {
        this._percentHeight = h;
        this._domElement.style.height = h+"%";
        return this;
    };

    p._x = 0;
    p.getX = function() {
        return this._x;
    };
    p.setX = function(x) {
        this._x = x;
        this._domElement.style.left = x+"px";
        return this;
    };

    p._y = 0;
    p.getY = function() {
        return this._y;
    };
    p.setY = function(y) {
        this._y = y;
        this._domElement.style.top = y+"px";
        return this;
    };

    p._name = "";
    p.getName = function() {
        return this._name;
    };
    p.setName = function(name) {
        this._name = name;
        return this;
    };

    p._id = "";
    p.getId = function() {
        return this._id;
    };

    p.setId = function(id) {
        this._id = id;
        this._domElement.id = id;
        return this;
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
        } else if (host instanceof VolcanoSprite){
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

    p.setAlpha = function(v){
        this._alpha = v;
        this._domElement.style.opacity = v;
        return this;
    };

    p.getAlpha = function(){
        return this._alpha;
    };

    p._visible = false;
    p.setVisible = function(v) {
        var vstr;
        this._visible = v;
        (v === true) ? vstr = "visible" : vstr = "hidden"
        this._domElement.style.visibility = vstr;
        return this;
    }

    p.getVisible = function() {
        return this._visible;
    }

    window.volcano.VolcanoSprite = VolcanoSprite;

})(window);
