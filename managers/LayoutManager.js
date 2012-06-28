(function(window) {
    /**
    * Volcano의 레이아웃 관리 정책에 따른 레이아웃 생명주기 관리자 클래스이다.
    * Flex의 생명주기와 동일하게 가져가기 위해서 interface를 동일하게 구성했다.
    *
    * @class LayoutManager
    * @author david yun
    **/
    var LayoutManager = function() {
        throw "LayoutManager cannot be initialized.";
    };

    /**
     * PriorityQueue Class Function
     * @constructor
     */
    var PriorityQueue = function(){
        var _priorityBins = [];
        var minPriority = 0;
        var maxPriority = -1;

        this.addObject = function(obj, priority){
            if(maxPriority < minPriority){
                minPriority = maxPriority = priority;
            }else{
                if(priority < minPriority){
                    minPriority = priority;
                }
                if(priority > maxPriority){
                    maxPriority = priority;
                }
            }

            var bin = _priorityBins[priority];

            if(!bin){
                bin = new PriorityBin();
                _priorityBins[priority] = bin;
                bin.items[obj] = true;
                bin.length++;
            }else{
                if(bin.items[obj] === null){
                    bin.items[obj] = true;
                    bin.length++;
                }
            }

        };

        this.removeLargest = function(){
            var obj = null;

            if(minPriority <= maxPriority){
                var bin = _priorityBins[maxPriority];
                while(!bin || bin.length === 0){
                    maxPriority--;
                    if(maxPriority < minPriority){
                        return null;
                    }
                    bin = _priorityBins[maxPriority];
                }

                for(var key in bin.items){
                    obj = key;
                    this.removeChild(key, maxPriority);
                    break;
                }

                while(!bin || bin.length === 0){
                    maxPriority--;
                    if(maxPriority < minPriority){
                        break;
                    }
                    bin = _priorityBins[maxPriority];
                }
            }
            return obj;
        };

        this.removeLargestChild = function(client){
            var max = maxPriority;
            var min = client.getNestLevel();

            while(min <= max){
                var bin = _priorityBins[max];
                if(bin && bin.length > 0){
                    if(max === client.getNestLevel()){
                        if(bin.items[client]){
                            this.removeChild(client, max);
                            return client;
                        }
                    }else{
                        for(var key in bin.items){
                            if((key instanceof volcano.UIComponent) && contains(client, key)){
                                this.removeChild(key, max);
                                return key;
                            }
                        }
                    }

                    max--;
                }else{
                    if(max === maxPriority){
                        maxPriority--;
                    }
                    max--;
                    if(max < min){
                        break;
                    }
                }
            }
            return null;
        };

        this.removeSmallest = function(){
            var obj = null;

            if(minPriority <= maxPriority){
                var bin = _priorityBins[minPriority];
                while(!bin || bin.length === 0){
                    minPriority++;
                    if(minPriority > maxPriority){
                        return null;
                    }
                    bin = _priorityBins[minPriority];
                }

                for(var key in bin.items){
                    obj = key;
                    this.removeChild(key, minPriority);
                    break;
                }

                while(!bin || bin.length === 0){
                    minPriority++;
                    if(minPriority > maxPriority){
                        break;
                    }
                    bin = _priorityBins[minPriority];
                }
            }
            return obj;
        };

        this.removeSmallestChild = function(client){
            var min = client.getNestLevel();

            while(min <= maxPriority){
                var bin = _priorityBins[min];
                if(bin && bin.length > 0){
                    if(min === client.getNestLevel()){
                        if(bin.items[client]){
                            this.removeChild(client, min);
                            return client;
                        }
                    }else{
                        for(var key in bin.items){
                            if((key instanceof volcano.UIComponent) && contains(client, key)){
                                this.removeChild(key, min);
                                return key;
                            }
                        }
                    }
                    min++;
                }else{
                    if(min === minPriority){
                        minPriority++;
                    }
                    min++;

                    if(min > maxPriority){
                        break;
                    }
                }
            }
            return null;
        };

        this.removeChild = function(client, level){
            var pri = (level >= 0) ? level : client.getNestLevel();
            var bin = _priorityBins[pri];
            if(bin && bin.items[client] !== null){
                delete bin.items[client];
                bin.length--;
                return client;
            }
            return null;
        };

        this.removeAll = function(){
            _priorityBins.length = 0;
            minPriority = 0;
            maxPriority = -1;
        };

        this.isEmpty = function(){
            return minPriority > maxPriority;
        };

        var contains = function(parent, child){
            // todo 타입 비교 조건 분기 문. cotnainer는 추후 제작

            return parent === child;
        };

        /**
         * PriorityBin
         * @constructor
         */
        var PriorityBin = function(){
            this.length = 0;
            this.items = {};
        }
    };

    LayoutManager.systemManager = null;  // systemManager를 생성하면 여기에 자동으로 잡힌다.

    LayoutManager._updateCompleteQueue = new PriorityQueue();
    LayoutManager._invalidatePropertiesQueue = new PriorityQueue();
    LayoutManager._invalidatePropertiesFlag = false;
    LayoutManager._invalidateClientPropertiesFlag = false;
    LayoutManager._invalidateSizeQueue = new PriorityQueue();
    LayoutManager._invalidateSizeFlag = false;
    LayoutManager._invalidateClientSizeFlag = false;
    LayoutManager._invalidateDisplayListQueue = new PriorityQueue();
    LayoutManager._invalidateDisplayListFlag = false;
    LayoutManager._waitAFrame = false;
    LayoutManager._listenersAttached = false;
    LayoutManager._originalFrameRate = NaN;
    LayoutManager._targetLevel = Number.MAX_VALUE; //2147483647
    LayoutManager._currentObject = {};
    LayoutManager._usePhasedInstantiation = false;

    LayoutManager.getUsePhasedInstantiation = function () {
        return LayoutManager._usePhasedInstantiation;
    };

    LayoutManager.setUsePhasedInstantiation = function (value) {
        if(LayoutManager._usePhasedInstantiation !== value){
            LayoutManager._usePhasedInstantiation = value;

            // XXX stage frameRate 설정 try catch
        }
    };


    LayoutManager.invalidateProperties = function (obj) {
        if(!LayoutManager._invalidatePropertiesFlag){
            LayoutManager._invalidatePropertiesFlag = true;
            if(!LayoutManager._listenersAttached){
                LayoutManager.attachListeners(LayoutManager.systemManager);
            }

            if(LayoutManager._targetLevel <= obj.getNestLevel()){
                LayoutManager._invalidatePropertiesQueue.addObject(obj, obj.getNestLevel());
            }
        }
    };

    LayoutManager.invalidateSize = function (obj) {
        if(!LayoutManager._invalidateSizeFlag){
            LayoutManager._invalidateSizeFlag = true;
            if(!LayoutManager._listenersAttached){
                LayoutManager.attachListeners(LayoutManager._systemManager);
            }
        }

        if(LayoutManager._targetLevel <= obj.getNestLevel()){
            LayoutManager._invalidateClientSizeFlag = true;
        }

        LayoutManager._invalidateSizeQueue.addObject(obj, obj.getNestLevel());
    };

    LayoutManager.invalidateDisplayList = function (obj) {
        if(!LayoutManager._invalidateDisplayListFlag){
            LayoutManager._invalidateDisplayListFlag = true;

            if(!LayoutManager._listenersAttached){
                LayoutManager.attachListeners(LayoutManager.systemManager);
            }
        }

        LayoutManager._invalidateDisplayListQueue.addObject(obj, obj.getNestLevel());
    };

    LayoutManager._validateProperties = function() {
        var obj = LayoutManager._invalidatePropertiesQueue.removeSmallest();
        while(obj){
            if(obj.getNestLevel()){
                LayoutManager._currentObject = obj;
                obj._validateProperties();
                if(!obj.getUpdateCompletePendingFlag()){
                    LayoutManager._updateCompleteQueue.addObject(obj, obj.getNestLevel());
                    obj.setUpdateCompletePendingFlag(true);
                }
            }

            obj = LayoutManager._invalidatePropertiesQueue.removeSmallest();
        }

        if(LayoutManager._invalidatePropertiesQueue.isEmpty()){
            LayoutManager._invalidatePropertiesFlag = false;
        }
    };

    LayoutManager._validateSize = function() {
        var obj = LayoutManager._invalidateSizeQueue.removeLargest();

        while(obj){
            if(obj.getNestLevel()){
                LayoutManager._currentObject = obj;
                obj._validateSize();
                if(!obj.getUpdateCompletePendingFlag()){
                    LayoutManager._updateCompleteQueue.addObject(obj, obj.getNestLevel());
                    obj.setUpdateCompletePendingFlag(true);
                }
            }

            obj = LayoutManager._invalidateSizeQueue.removeLargest();
        }

        if(LayoutManager._invalidateSizeQueue.isEmpty()){
            LayoutManager._invalidateSizeFlag;
        }
    };

    LayoutManager._validateDisplayList = function() {
        obj = LayoutManager._invalidateDisplayListQueue.removeSmallest();
        while(obj){
            if(obj.getNestLevel()){
                LayoutManager._currentObject = obj;
                obj._validateDisplayList();
                if(!obj.getUpdateCompletePendingFlag()){
                    LayoutManager._updateCompleteQueue.addObject(obj, obj.getNestLevel());
                    obj.getUpdateCompletePendingFlag(true);
                }
            }

            obj = LayoutManager._invalidateDisplayListQueue.removeSmallest();
        }

        if(LayoutManager._invalidateDisplayListQueue.isEmpty()){
            LayoutManager._invalidateDisplayListFlag = false;
        }
    };

    LayoutManager._doPhasedInstantiation = function() {
        if(LayoutManager.getUsePhasedInstantiation){
            if(LayoutManager._invalidatePropertiesFlag){
                LayoutManager._validateProperties();
                //XXX Flex API -> The Preloader listens for this event.
            }else if(LayoutManager._invalidateSizeFlag){
                LayoutManager._validateSize();
                //XXX Flex API -> The Preloader listens for this event.
            }else if(LayoutManager._invalidateDisplayListFlag){
                LayoutManager._validateDisplayList();
                //XXX Flex API -> The Preloader listens for this event.
            }
        }else{
            if(LayoutManager._invalidatePropertiesFlag){
                LayoutManager._validateProperties();
            }
            if(LayoutManager._invalidateSizeFlag){
                LayoutManager._validateSize();
            }
            if(LayoutManager._invalidateDisplayListFlag){
                LayoutManager._validateDisplayList();
            }
        }

        if(LayoutManager._invalidatePropertiesFlag || LayoutManager._invalidateSizeFlag || LayoutManager._invalidateDisplayListFlag){
            LayoutManager.attachListeners(LayoutManager.systemManager);
        }else{
            LayoutManager.setUsePhasedInstantiation(false);
            LayoutManager._listenersAttached = false;

            var obj = LayoutManager._updateCompleteQueue.removeLargest();
            while(obj){
                if(!obj.initialized && obj.processedDescriptors){
                    obj.initialized = true;
                }
                obj.dispatchEvent("updateComplete");
                obj.setUpdateCompletePendingFlag(false);
                obj = LayoutManager._updateCompleteQueue.removeLargest();
            }
            //TODO effect Handler를 위한 updateComplete Event Dispatch host = LayoutManager

        }
    };

    LayoutManager._doPhasedInstantiationCallback = function(event) {
        if(volcano.UIComponent._callLaterDispatcherCount > 0){
            return;
        }

        LayoutManager.systemManager.removeEnterFrameListener(LayoutManager._doPhasedInstantiationCallback);

        if(!volcano.UIComponent._catchCallLaterExceptions){
            LayoutManager._doPhasedInstantiation();
        }else{
            try{
                LayoutManager._doPhasedInstantiation();
            }catch(e){
                throw "callLaterError LayoutManager";
            }
        }

        LayoutManager._currentObject = null;
    };

    LayoutManager.validateNow = function () {
        if(!LayoutManager.getUsePhasedInstantiation()){
            var infiniteLoopGuard = 0;
            while(LayoutManager._listenersAttached && infiniteLoopGuard++ < 100){
                LayoutManager._doPhasedInstantiation();
            }
        }
    };

    LayoutManager.validateClient = function (target, skipDisplayList) {};

    LayoutManager._waitFrame = function(){
        LayoutManager.systemManager.removeEnterFrameListener(LayoutManager._waitFrame);
        LayoutManager.systemManager.addEnterFrameListener(LayoutManager._doPhasedInstantiationCallback);
        LayoutManager._waitAFrame = true;
    };

    LayoutManager.attachListeners = function (systemManager) {
        if(!LayoutManager._waitAFrame){
            systemManager.addEnterFrameListener(LayoutManager._waitFrame);
        }else{
            systemManager.addEnterFrameListener(LayoutManager._doPhasedInstantiationCallback);
        }
        LayoutManager._listenersAttached = true;
    };

    window.volcano.LayoutManager = LayoutManager;

})(window);
