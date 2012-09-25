/*
 * Image
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
     * VolcanoJS Project
     *
     * @class Image
     * @extends UIComponent
     * @constructor
     * @author david yun
     *
     */
    var Image = function () {
        this.initialize();
    };

    var p = Image.prototype = new volcano.UIComponent();
    p.UIComponent_initialize = p.initialize;

    p._domElement;

    p._imageElement;

    p.initialize = function () {
//        var imgElement = document.createElement("img");
//        this.UIComponent_initialize(imgElement); //super
        this._domElement = {};
        this._imageElement = {};
        this.UIComponent_initialize(); //super
        _.bindAll(this,"errHandler");
    };

    p.errHandler = function(event) {
        var condition1 = (this.errorImg() !== "");
        var condition2 = (this.errorImg() !== this._source);

        if (this.errorImg() !== "" && this.errorImg() !== this._source) {
            this._imageElement.src = this.errorImg();
        }
    };

    p._source = "";
    p._oldSource = "";
    p.source = function(value) {
        if(arguments.length){
            if(value != this._source){
                this._source = value;
                this.invalidateProperties();
                this.invalidateDisplayList();
                return this;
            }else{

                return this;
            }
        }else{
            return this._source;
        }
    };

    p._errorImg = "";
    Image.DEFAULT_ERR_IMGAGE = "";
    p.errorImg = function(value) {
        if (arguments.length) {
            this._errorImg = value;
            return this;
        }else{
            return (this._errorImg === "") ? Image.DEFAULT_ERR_IMGAGE : this._errorImg;
        }
    };

    p.createChildren = function(){
        this._imageElement = document.createElement("img");
        this._domElement.appendChild(this._imageElement);
        this._imageElement.style.width = 100 + "%";
        this._imageElement.style.height = 100 + "%";
        this._imageElement.onerror = this.errHandler;
    };

    p.UIComponent_commitProperties = p.commitProperties;
    p.commitProperties = function(){
        this.UIComponent_commitProperties();

        if(this._source != this._oldSource){
            this._oldSource = this._source;
//            console.log(this._source);
            this._imageElement.src = this._source;
        }

    };

    this.window.volcano.Image = Image;

})(window);