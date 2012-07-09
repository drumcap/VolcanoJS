(function (window) {
    /**
     * VolcanoJS Project
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

    p.beginHighlightBitmapCapture = function () {};
    p.endHighlightBitmapCapture = function() {};
    p.hasState = function(stateName) {};

    p.applyColorTransform = function(uiComponent, originalColor, tintColor) {};
    p.commitCurrentState = function () {};
    p.drawBackground = function (unscaledWidth, unscaledHeight) {};
    p.getElementPreferredHeight = function (element) {};
    p.getElementPreferredWidth = function (element) {};
    p.layoutContents = function (unscaledWidth, unscaledHeight) {};
    p.setElementPosition = function (element, x, y) {};
    p.setElementSize = function (element, width, height) {};

    this.window.volcano.SkinBase = SkinBase;

})(window);