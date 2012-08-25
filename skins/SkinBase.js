(function (window) {
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

})(window);