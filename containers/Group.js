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
    p._clipAndEnableScrollingExplicitlySet = false;
    p._scrollRectSet = false;
    p._autoLayout = true;
    p._resizeMode = "noScale";
    p._contentWidth = 0;
    p._contentHeight = 0;
    p._mask = {};
    p._maskType = "clip";
    p._maskTypeChanged = false;
    p._originalMaskFilters = [];
    p._luminosityInvert = false;
    p._luminositySettingsChanged = false;
    p._luminosityClip = false;
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

    p.UIComponent_getBaselinePosition = p.getBaselinePosition();
    p.getBaselinePosition = function(){
        this.UIComponent_getBaselinePosition();
    };

    p.UIComponent_setEnabled = p.setEnabled();
    p.setEnabled = function(value){
        this.UIComponent_setEnabled(value);
    };

    p.UIComponent_setScrollRect = p.setScrollRect();
    p.setScrollRect = function(value){
        this.UIComponent_setScrollRect(value);
    };

    p.UIComponent_getScrollRect = p.getScrollRect();
    p.getScrollRect = function(){
        this.UIComponent_getScrollRect();
    };

    p.UIComponent_globalToLocal = p.globalToLocal();
    p.globalToLocal = function(point){
        this.UIComponent_globalToLocal(point);
    };

    p.UIComponent_localToGlobal = p.localToGlobal();
    p.localToGlobal = function(point){
        this.UIComponent_localToGlobal(point);
    };

    p.UIComponent_addEventListener = p.addEventListener();
    p.addEventListener = function(type, callback){
        this.UIComponent_addEventListener(type, callback);
    };

    p.UIComponent_removeEventListener = p.removeEventListener();
    p.removeEventListener = function(event, callback){
        this.UIComponent_removeEventListener(event, callback);
    };

    p.UIComponent_setMask = p.setMask();
    p.setMask = function(value){
        this.UIComponent_setMask(value);
    };

    p.UIComponent_getMask = p.getMask();
    p.getMask = function(){
        this.UIComponent_getMask();
    };





    p.containsElement = function(element){};

    p.setLayout = function(value){};
    p.getLayout = function(){};
    p.setHorizontalScrollPosition = function(value){};
    p.getHorizontalScrollPosition = function(){};
    p.setVerticalScrollPosition = function(value){};
    p.getVerticalScrollPosition = function(){};
    p.setClipAndEnableScrolling = function(value){};
    p.getClipAndEnableScrolling = function(){};
    p.setAutoLayout = function(value){};
    p.getAutoLayout = function(){};
    p.setResizeMode = function(value){};
    p.getResizeMode = function(){};
    p.getHorizontalScrollPositionDelta = function(navigationUnit){};
    p.getVerticalScrollPositionDelta = function(navigationUnit){};
    p.getContentWidth = function(){};
    p.getContentHeight = function(){};
    p.setContentSize = function(w, h){};
    p.setMaskType = function(value){};
    p.getMaskType = function(){};
    p.setLuminosityInvert = function(value){};
    p.getLuminosityInvert = function(){};
    p.setLuminosityClip = function(value){};
    p.getLuminosityClip = function(){};
    p.swapElements = function(element1, element2){};
    p.swapElementsAt = function(index1, index2){};

// protected Method
    p.UIComponent_canSkipMeasurement = p.canSkipMeasurement();
    p.canSkipMeasurement = function(){
        this.UIComponent_canSkipMeasurement();
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

    p.UIComponent_validateMatrix = p.validateMatrix();
    p.validateMatrix = function(){
        this.UIComponent_validateMatrix();
    };

// private Method

    p._redispatchLayoutEvent = function(event){};
    p._caculateLuminositySettings = function(){};
    p._setContentWidth = function(value){};
    p._setContentHeight = function(value){};

})(window);
