(function(window) {
    /**
    *
    *
    * @class DisplayObject
    * @constructor
    **/
    var Group = function() {
      this.initialize();
    }
// public static Properties:
// private static Properties:

    var p = Group.prototype = new volcano.UIComponent();

// private Properties
    p._explicitAlpha = 1.0;
    p._layout = new LayoutBase();
    p._layoutProperties = {};
    p._layoutInvalidateSizeFlag = false;
    p._layoutInvalidateDisplayListFlag = false;
    p._scrollRectSet = false;
    p._autoLayout = true;
    p._resizeMode = "noScale";
    p._contentWidth = 0;
    p._contentHeight = 0;
// private Properties:

// public Method

    p.UIComponent_initialize = p.initialize();
    p.initialize = function() {
        this.UIComponent_initialize(); // super
    };

    p.UIComponent_invalidateSize = p.invalidateSize();
    p.invalidateSize = function(){
        this.UIComponent_invalidateSize();
    };

    p.UIComponent_invalidateDisplayList = p.invalidateDisplayList();
    p.invalidateDisplayList = function(){
        this.UIComponent_invalidateDisplayList();
    };

    p.UIComponent_createChildren = p.createChildren();
    p.createChildren = function(){
        this.UIComponent_createChildren();
    };

    p.UIComponent_commitProperties = p.commitProperties();
    p.commitProperties = function(){
        this.UIComponent_commitProperties();
    };

    p.UIComponent_measure = p.measure();
    p.measure = function(){
        this.UIComponent_measure();
    };

    p.UIComponent_updateDisplayList = p.updateDisplayList();
    p.updateDisplayList = function(w, h){
        this.UIComponent_updateDisplayList(w, h);
    };

    p.UIComponent_setWidth = p.setWidth();
    p.setWidth = function(value){
        this.UIComponent_setWidth(value);
    };

    p.UIComponent_getHeight = p.getHeight();
    p.setHeight = function(value){
        this.UIComponent_getHeight(value);
    };

    p.UIComponent_validateProperties = p.validateProperties();
    p.validateProperties = function(){
        this.UIComponent_validateProperties();
    };

    p.UIComponent_validateSize = p.validateSize();
    p.validateSize = function(){
        this.UIComponent_validateSize();
    };

    p.UIComponent_validateDisplayList = p.validateDisplayList();
    p.validateDisplayList = function(){
        this.UIComponent_validateDisplayList();
    };

    p.UIComponent_setActualSize = p.setActualSize();
    p.setActualSize = function(w, h){
        this.UIComponent_setActualSize(w, h);
    };

    p.UIComponent_setAlpha = p.setAlpha();
    p.setAlpha = function(value){
        this.UIComponent_setAlpha(value);
    };

    p.containsElement = function(element){};

    p.setLayout = function(value){};
    p.getLayout = function(){};
    p.swapElements = function(element1, element2){};
    p.swapElementsAt = function(index1, index2){};

// protected Method
// private Method

})(window);
