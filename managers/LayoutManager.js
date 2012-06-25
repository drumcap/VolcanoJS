(function(window) {
    /**
    * Volcano의 레이아웃 관리 정책에 따른 레이아웃 생명주기 관리자 클래스이다.
    * Flex의 생명주기와 동일하게 가져가기 위해서 interface를 동일하게 구성했다.
    *
    * @class LayoutManager
    **/
    var LayoutManager = function() {
        throw "LayoutManager cannot be initialized.";
    }

    LayoutManager.systemManager = null;

    LayoutManager._updateCompleteQue = {};
    LayoutManager._invalidatePropertiesQueue = {};
    LayoutManager._invalidatePropertiesFlag = false;
    LayoutManager._invalidateClientPropertiesFlag = false;
    LayoutManager._invalidateSizeQueue = {};
    LayoutManager._invalidateSizeFlag = false;
    LayoutManager._invalidateClientSizeFlag = false;
    LayoutManager._invalidateDisplayListQueue = {};
    LayoutManager._invalidateDisplayListFlag = false;
    LayoutManager._waitAFrame = false;
    LayoutManager._listenersAttached = false;
    LayoutManager._originalFrameRate = NaN;
    LayoutManager._targetLevel = Number.MAX_VALUE; //2147483647
    LayoutManager._currentObject = {};


    LayoutManager._usePhasedInstantiation = false;
    LayoutManager.getUsePhasedInstantiation = function () {};
    LayoutManager.setUsePhasedInstantiation = function (value) {};


    LayoutManager.invalidateProperties = function (obj) {};
    LayoutManager.invalidateSize = function (obj) {};
    LayoutManager.invalidateDisplayList = function (obj) {};
    LayoutManager._validateProperties = function() {};
    LayoutManager._validateSize = function() {};
    LayoutManager._validateDisplayList = function() {};
    LayoutManager._doPhasedInstantiation = function() {};
    LayoutManager._doPhasedInstantiationCallBack = function(event) {};
    LayoutManager.validateNow = function () {};
    LayoutManager.validateClient = function (target, skipDisplayList) {};
    LayoutManager.attachListeners = function (systemManager) {};

    window.volcano.LayoutManager = LayoutManager;

})(window);
