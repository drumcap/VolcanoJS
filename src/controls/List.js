/*
 * List
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
(function(window){
    var List = function(sysMgr, options, vPort){
        this.initialize(sysMgr, options, vPort);
    }

    var p = List.prototype = new volcano.VSprite();
    p.viewPort = {};

    p.VSprite_initialize = p.initialize;
    p.initialize = function (sysMgr, options, vPort) {
        // 변수 초기화
        this._domElement = {};
        this._elementsContent = [];
        this.parent = {};

        this.VSprite_initialize(undefined, options); //call super
        if(vPort !== undefined){
            this.viewPort = new volcano.VSprite(vPort, options);
        }else{
            this.viewPort = new volcano.VSprite(undefined, options).id("viewPort");
        }

        this._domElement.appendChild(this.viewPort._domElement);
        console.log("init" + "----" + this.height());
        this.viewPort.parent = this;

        if(options.browserScrollMode === "on"){
            // todo Container 크기는 고정, Container에 append 되는 Dom 객체가 Container보다 클 경우 영역을 제어할지 말지를 결정해야 한다.
            this.percentWidth(100);
            this.percentHeight(100);
            this.setStyle("overflow","auto");
        }else{
            new volcano.Scroller(this.viewPort, sysMgr, { scrollMode: "vertical" });
        }
    };

    /**
     * Displaylist 의 범위계산 에러체크
     * @param {Number} index
     * @param {Boolean} isAddingElement
     * @private
     */
    p._checkRangeError = function (index, isAddingElement) {
        var maxIndex = this.viewPort._elementsContent.length - 1;
        if (isAddingElement) {
            maxIndex++;
        }

        if (index < 0 || index > maxIndex) {
            throw "Elements Range Error";
        }
    };

    p._templete;
    /**
     * Templete
     * @param templeteItem
     */
    p.templete = function(templeteItem){
        this._templete = templeteItem;
    }

    /**
     * dataProvider
     * @param value
     */
    p.dataProvider = function(value){
        if(argumenets.length > 0){

        }else{

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
        element.parent = this.viewPort;
        var host = this.viewPort._domElement,
            elementDiv = element._domElement;

        // fixme 향후 Canvas 가 아닌 다른 Element 가 올 수 있으므로, 그 때 수정해야 함.
        var canvasNum = 0;
        if(host.children.length > 0) canvasNum = host.children[0].localName === "canvas" ? 1 : 0;

        if ((host.children.length - canvasNum) === index) {
            host.appendChild(elementDiv);
        } else {
            console.log(this.getElementAt(index).viewPort._domElement);
            host.insertBefore(elementDiv, this.getElementAt(index).viewPort._domElement);
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
        return this.viewPort._elementsContent.length;
    };

    /**
     * 해당 인덱스의 요소 반환
     * @param {Number} index
     * @return {*}
     */
    p.getElementAt = function (index) {
        this._checkRangeError(index, false);
        return this.viewPort._elementsContent[index];
    };

    /**
     * DisplayList에 차일드 요소 추가
     * @param {Object} element
     * @return {*}
     */
    p.addElement = function (element) {
        var index = this.viewPort.getNumElements();

        if (element.parent === this.viewPort) {
            index = this.viewPort.getNumElements() - 1;
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
        if (element === this.viewPort) {
            throw "Cannot add yourself as your Child";
        }
        this._checkRangeError(index, true);

        var host = element.parent;
        if (host === this.viewPort) {
            this.setElementIndex(element, index);
            return element;
        } else if (host instanceof volcano.VSprite){
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

        var element = this.viewPort._elementsContent[index];
        this._elementRemoved(element, index);
        this.viewPort._elementsContent.splice(index, 1);
    };
    /**
     * DisplayList의 모든 요소를 제거
     */
    p.removeAllElements = function () {
        // DisplayList는 역순제거를 해야한다.
        for (var i = this.viewPort.getNumElements() - 1; i >= 0; i--) {
            this.removeElementAt(i);
        }
    };
    /**
     * DisplayList에서 해당 요소의 인덱스를 반환
     * @param {Object} element
     * @return {*}
     */
    p.getElementIndex = function (element) {
        return _.indexOf(this.viewPort._elementsContent, element);
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

    window.volcano.List = List;

})(window);