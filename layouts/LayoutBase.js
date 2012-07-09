(function(window){

    var LayoutBase = function(){
        this.initialize();
    };

    p = LayoutBase.prototype = new volcano.OnDemandEventDispatcher();



    // public static Properties:
    // private static Properties:
    // public Properties
    // private Properties:
    p._target = {};
    p._horizontalScrollPosition = 0;
    p._verticalScrollPosition = 0;
    p._clipAndEnableScrolling = false;
    p._typicalLayoutElement = {};
    p._dropIndicator = {};
    p._dragScrollTimer = {};
    p._dragScrollDelta = {};
    p._dragScrollEvent = {};

    // protected Properties:
    p._dragScrollRegionSizeHorizontal = 20;
    p._dragScrollRegionSizeVertical = 20;
    p._dragScrollSpeed = 5;
    p._dragScrollInitialDelay = 250;
    p._dragScrollInterval = 32;
    p._dragScrollHidesIndicator = false;

    // public Method
    p.OnDemandEventDispatcher_initialize = p.initialize();
    p.initialize = function(){
        this.OnDemandEventDispatcher_initialize();
    };

    p.setTarget = function(value){
        if(this._target === value){
            return this;
        }
        this._target = value;

        return this;
    };

    p.getTarget = function(){
        return this._target;
    };

    p.getHorizontalScrollPosition = function(){
        return this._horizontalScrollPosition;
    };
    p.setHorizontalScrollPosition = function(value){
        if(value === this._horizontalScrollPosition){
            return this;
        }
        this._horizontalScrollPosition = value;
        this.scrollPositionChanged();

        return this._horizontalScrollPosition;
    };

    p.getVerticalScrollPosition = function(){
        return this._verticalScrollPosition;1
    };
    p.setVerticalScrollPosition = function(value){
        if(value === this._verticalScrollPosition){
            return this;
        }
        this._verticalScrollPosition = value;
        this.scrollPositionChanged();
        return this;
    };

    p.getClipAndEnableScrolling = function(){
        return this._clipAndEnableScrolling;
    };
    p.setClipAndEnableScrolling = function(value){
        if(value === this._clipAndEnableScrolling){
            return this;
        }
        this._clipAndEnableScrolling = value;
        var g = this.getTarget();
        if(g){
            this.updateScrollRect(g.width, g.height);
        }
    };

    p.getTypicalLayoutElement = function(){
        if(!this._typicalLayoutElement && this.getTarget() && (this.getTarget().getNumElements > 0)){
            this._typicalLayoutElement = this.getTarget().getElementAt(0);
        }
        return this._typicalLayoutElement;
    };
    p.setTypicalLayoutElement = function(value){
        if(this._typicalLayoutElement === value){
            return this;
        }
        this._typicalLayoutElement = value;
        var g = this.getTarget();
        if(g){
            g.invalidateSize();
        }
        return this;
    };

    p.getDropIndicator = function(){
        return this._dropIndicator;
    };
    p.setDropIndicator = function(value){
        // TODO dropIndicator 기능을 구현을 할지 말지 결정 필요
    };

    p.measure = function(){};

    p.updateDisplayList = function(w, h){};

    p.elementAdded = function(index){};

    p.elementRemoved = function(index){};

    p.updateScrollRect = function(w, h){
        var g = this.getTarget();
        if(!g){
            return;
        }

        if(this.getClipAndEnableScrolling()){
            var hsp = this.getHorizontalScrollPosition();
            var vsp = this.getVerticalScrollPosition();
            // TODO RectAngle Data Function 을 만들어야 한다.
            g.setScrollRect(new Rectangle(hsp, vsp, w, h));
        }else{
            g.setScrollRect(null);
        }
    };

    p.getNavigationDestinationIndex = function(currentIndex, navigationUnit, arrowkeysWrapFocus){
        if(this.getTarget() || this.getTarget().getNumelements < 1){
            return -1;
        }

        switch(navigationUnit){
            case "home":
                return 0;
            case "end":
                return this.getTarget().getNumElements() - 1;
            default:
                return -1;
        }
    };

    p.getElementBounds = function(index){
        var g = this.getTarget();
        if(!g){
            return null;
        }

        var n = g.getNumElements();
        if((index < 0) || (index >= n)){
            return null;
        }

        var elt = g.getElementAt(index);
        if(!elt){
            return null;
        }

        var eltX = elt.getLayoutBoundsX();
        var eltY = elt.getLayoutBoundsY();
        var eltW = elt.getLayoutBoundsWidth();
        var eltH = elt.getLayoutBoundsHeight();
        return new RectAngle(eltX, eltY, eltW, eltH);
    };

    p.getHorizontalScrollPositionDelta = function(navigationUnit){
        var g = this.getTarget();
        if(!g){
            return 0;
        }

        var scrollRect = this.getScrollRect();
        if(!scrollRect){
            return 0;
        }

        if((scrollRect.x == 0) && (scrollRect.width >= g.getContentWidth())){
            return 0;
        }

        var maxDelta = g.getContentWidth() - scrollRect.right;
        var minDelta = -scrollRect.left;
        var getElementBounds;

        // TODO keyEvent 등과 같은 처리에 필요한 switch 문.
    };

    p.getVerticalScrollPositionDelta = function(navigationUnit){
        var g = this.getTarget();
        if(!g){
            return 0;
        }

        var scrollRect = this.getScrollRect();
        if(!scrollRect){
            return 0;
        }

        if((scrollRect.y == 0) && (scrollRect.height >= g.getContentHeight())){
            return 0;
        }

        var maxDelta = g.getContentHeight() - scrollRect.bottom;
        var minDelta = -scrollRect.top;
        var getElementBounds;

        // TODO keyEvent 등과 같은 처리에 필요한 switch 문
    };

    p.getScrollPositionDeltaToElement = function(index){
        return this._getScrollPositionDeltaToElementHelper(index);
    };

    p.calculateDropLocation = function(dragEvent){};

    p.showDropIndicator = function(dropLocation){};

    p.hideDropIndicator = function(){};

    // protected Method

    p.scrollPositionChanged = function(){
        var g = this.getTarget();
        if(!g){
            return;
        }

        this.updateScrollRect(g.width, g.height);
    };

    p.getScrollRect = function(){
        var g = this.getTarget();
        if(!g){
            return null;
        }
        var vsp = g.getVerticalScrollPosition();
        var hsp = g.getHorizontalScrollPosition();
        return new Rectangle(hsp, vsp, g.getWidth(), g.getHeight());
    };

    p.getElementBoundsLeftOfScrollRect = function(scrollRect){
        var bounds = new Rectangle();
        bounds.left = scrollrect.left - 1;
        bounds.right = scrollRect.left;
        return bounds;
    };

    p.getElementBoundsRightOfScrollRect = function(scrollRect){
        var bounds = new Rectangle();
        bounds.left = scrollRect.right;
        bounds.right = scrollRect.right + 1;
        return bounds;
    };

    p.getElementBoundsAboveScrollRect = function(scrollRect){
        var bounds = new Rectangle();
        bounds.top = scrollRect.top - 1;
        bounds.bottom = scrollRect.top;
        return bounds;
    };

    p.getElementBoundsBelowScrollRect = function(scrollRect){
        var bounds = new Rectangle();
        bounds.top = scrollRect.bottom;
        bounds.bottom = scrollRect.bottom + 1;
        return bounds;
    };

    p.getScrollPositionDeltaToElementHelperHelper = function(elementR, elementLocalBounds, entireElementVisible, topOffset, bottomOffset, leftOffset, rightOffset){};
    p.caculateDropIndex = function(x, y){};
    p.calculateDropIndicatorBounds = function(dropLocation){};
    p.calculateDragScrollDelta = function(dropLocation, elapsedTime){};


    // private Method

    p._convertLocalToTarget = function(element, elementLocalBounds){
        if(!element){
            return new Rectangle(0,0,0,0);
        }

        var parentUIC = element.parent;
        if(parentUIC){
            var g = this.getTarget();
            var posPointStart = {x: element.getLayoutBoundsX() + elementLocalBounds.x, y: element.getLayoutBoundsY() + elementLocalBounds.y});
            var posPoint = parentUIC.localToGlobal(posPointStart);
            posPoint = g.globalToLocal(posPoint);

            return new Rectangle(posPoint.x, posPoint.y, elementLocalBounds.width, elementLocalBounds.height);
        }
        return new Rectangle(0,0,0,0);
    };
    p._dragScrollingInProgress = function(){};
    p._startDragScrolling = function(){};
    p._dragScroll = function(event){};
    p._stopDragScrolling = function(){};
    p._globalToLocal = function(x, y){};

    // mx_internal private Method
    p._getChildElementBounds = function(element){
        if(!element){
            return new Rectangle(0,0,0,0);
        }

        var parentUIC = element.parent;
        if(parentUIC){
            var g = this.getTarget();

            //XXX point는 object x, y 속성으로 변경
            var posPointStart = {x: element.getLayoutBoundsX(), y: element.getLayoutBoundsY()};
            var sizePoint = {x: element.getLayoutBoundsWidth(), y: element.getLayoutBoundsHeight()};

            var posPoint = parentUIC.localToGlobal(posPointStart);

            posPoint = g.globalToLocal(posPoint);

            return new Rectangle(posPoint.x, posPoint.y, sizePoint.x, sizePoint.y);
        }
        return new Rectangle(0,0,0,0);
    };
    p._isElementVisible = function(elt){
        if(!elt){
            return false;
        }

        var g = this.getTarget();
        if(!g){
            return true;
        }

        const vsp = g.getVerticalScrollPosition();
        const hsp = g.getHorizontalScrollPosition();
        const targetW = g.getWidth();
        const targetH = g.getHeight();

        const eltX = elt.getLayoutBoundsX();
        const eltY = elt.getLayoutBoundsY();
        const eltW = elt.getLayoutBoundsWidth();
        const eltH = elt.getLayoutBoundsHeight();

        return (eltX < (hsp + targetW)) && ((eltX + eltW) > hsp) && (eltY < (vsp + targetH)) && ((eltY + eltH) > vsp);
    };
    p._getScrollPositionDeltaToElementHelper = function(index, topOffset, bottomOffset, leftOffset, rightOffset){};
    p._getScrollPositionDeltaToAnyElement = function(element, elementLocalBounds, entireElementVisible, topOffset, bottomOffset, leftOffset, rightOffset){};
    p._getElementNearestScrollPosition = function(position, elementComparePoint){};


    window.volcano.LayoutBase = LayoutBase;
})(window);
