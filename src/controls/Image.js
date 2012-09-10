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
     * @extends VolcanoSprite
     * @constructor
     * @author david yun
     *
     */
    var Image = function () {
        this.initialize();
    };

    var p = Image.prototype = new volcano.VolcanoSprite();
    p.VolcanoSprite_initialize = p.initialize;

    p._imgElement;

    p.initialize = function () {
        this._imgElement = {};
        this.VolcanoSprite_initialize(); //super
        this._imgElement = document.createElement("img");
        this._imgElement.style.width = "100%";
        this._imgElement.style.height = "100%";
        this._imgElement.style[ volcano.Core._browserPrefix + "TransformStyle" ] = "preserve-3d";
        this._imgElement.style[ volcano.Core._transformProperty ] = "translateZ(0px)";

        _.bindAll(this,"errHandler");
        this._domElement.appendChild(this._imgElement);
    };

    p.errHandler = function(event) {
        var condition1 = (this.errorImg() !== "");
        var condition2 = (this.errorImg() !== this._source);

        if (this.errorImg() !== "" && this.errorImg() !== this._source) {
            this._imgElement.src = this.errorImg();
            console.log(this.errorImg() + this._source);
        }
    };

    p._source = "";
    p.source = function(value) {
        this._imgElement.src = value;
        this._imgElement.onerror = this.errHandler;
        this._source = value;
        return this;
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

    this.window.volcano.Image = Image;

})(window);