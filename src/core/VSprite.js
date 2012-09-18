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
