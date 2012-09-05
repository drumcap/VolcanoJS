/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12. 8. 29
 * Time: 오전 11:11
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
        _.bindAll(this,"errHandler");
        this._domElement.appendChild(this._imgElement);
    };

    p.errHandler = function(event) {
        var condition1 = (this.getErrorImg() !== "");
        var condition2 = (this.getErrorImg() !== this._source);

        if (this.getErrorImg() !== "" && this.getErrorImg() !== this._source) {
            this._imgElement.src = this.getErrorImg();
            console.log(this.getErrorImg() + this._source);
        }
    };

    p._source = "";
    p.setSource = function(value) {
        this._imgElement.src = value;
        this._imgElement.onerror = this.errHandler;
        this._source = value;
        return this;
    };

    p._errorImg = "";
    Image.DEFAULT_ERR_IMGAGE = "";
    p.setErrorImg = function(value) {
        this._errorImg = value;
    }
    p.getErrorImg = function() {
        var ret = (this._errorImg === "") ? Image.DEFAULT_ERR_IMGAGE : this._errorImg;
        return ret;
    }

    this.window.volcano.Image = Image;

})(window);