(function (window) {

    var LayoutBase = function () {
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
    p.initialize = function () {
        this.OnDemandEventDispatcher_initialize();
    };

    p.setTarget = function (value) {
        if (this._target === value) {
            return this;
        }
        this._target = value;

        return this;
    };

    p.getTarget = function () {
        return this._target;
    };

    p.getHorizontalScrollPosition = function () {
        return this._horizontalScrollPosition;
    };
    p.setHorizontalScrollPosition = function (value) {
        if (value === this._horizontalScrollPosition) {
            return this;
        }
        this._horizontalScrollPosition = value;
        this.scrollPositionChanged();

        return this._horizontalScrollPosition;
    };

    p.getVerticalScrollPosition = function () {
        return this._verticalScrollPosition;
        1
    };
    p.setVerticalScrollPosition = function (value) {
        if (value === this._verticalScrollPosition) {
            return this;
        }
        this._verticalScrollPosition = value;
        this.scrollPositionChanged();
        return this;
    };

    p.getClipAndEnableScrolling = function () {
        return this._clipAndEnableScrolling;
    };
    p.setClipAndEnableScrolling = function (value) {
        if (value === this._clipAndEnableScrolling) {
            return this;
        }
        this._clipAndEnableScrolling = value;
        var g = this.getTarget();
        if (g) {
            this.updateScrollRect(g.width, g.height);
        }
    };

    p.getTypicalLayoutElement = function () {
        if (!this._typicalLayoutElement && this.getTarget() && (this.getTarget().getNumElements > 0)) {
            this._typicalLayoutElement = this.getTarget().getElementAt(0);
        }
        return this._typicalLayoutElement;
    };
    p.setTypicalLayoutElement = function (value) {
        if (this._typicalLayoutElement === value) {
            return this;
        }
        this._typicalLayoutElement = value;
        var g = this.getTarget();
        if (g) {
            g.invalidateSize();
        }
        return this;
    };

    p.getDropIndicator = function () {
        return this._dropIndicator;
    };
    p.setDropIndicator = function (value) {
        // TODO dropIndicator 기능을 구현을 할지 말지 결정 필요
    };

    p.measure = function () {
    };

    p.updateDisplayList = function (w, h) {
    };

    p.elementAdded = function (index) {
    };

    p.elementRemoved = function (index) {
    };

    p.updateScrollRect = function (w, h) {
        var g = this.getTarget();
        if (!g) {
            return;
        }

        if (this.getClipAndEnableScrolling()) {
            var hsp = this.getHorizontalScrollPosition();
            var vsp = this.getVerticalScrollPosition();

            g.setScrollRect(new Rectangle(hsp, vsp, w, h));
        } else {
            g.setScrollRect(null);
        }
    };

    p.getNavigationDestinationIndex = function (currentIndex, navigationUnit, arrowkeysWrapFocus) {
        if (this.getTarget() || this.getTarget().getNumelements < 1) {
            return -1;
        }

        switch (navigationUnit) {
            case "home":
                return 0;
            case "end":
                return this.getTarget().getNumElements() - 1;
            default:
                return -1;
        }
    };

    p.getElementBounds = function (index) {
        var g = this.getTarget();
        if (!g) {
            return null;
        }

        var n = g.getNumElements();
        if ((index < 0) || (index >= n)) {
            return null;
        }

        var elt = g.getElementAt(index);
        if (!elt) {
            return null;
        }

        var eltX = elt.getLayoutBoundsX();
        var eltY = elt.getLayoutBoundsY();
        var eltW = elt.getLayoutBoundsWidth();
        var eltH = elt.getLayoutBoundsHeight();
        return new Rectangle(eltX, eltY, eltW, eltH);
    };

    p.getHorizontalScrollPositionDelta = function (navigationUnit) {
        var g = this.getTarget();
        if (!g) {
            return 0;
        }

        var scrollRect = this.getScrollRect();
        if (!scrollRect) {
            return 0;
        }

        if ((scrollRect.x == 0) && (scrollRect.width >= g.getContentWidth())) {
            return 0;
        }

        var maxDelta = g.getContentWidth() - scrollRect.right;
        var minDelta = -scrollRect.left;
        var getElementBounds;

        // TODO keyEvent 등과 같은 처리에 필요한 switch 문.
    };

    p.getVerticalScrollPositionDelta = function (navigationUnit) {
        var g = this.getTarget();
        if (!g) {
            return 0;
        }

        var scrollRect = this.getScrollRect();
        if (!scrollRect) {
            return 0;
        }

        if ((scrollRect.y == 0) && (scrollRect.height >= g.getContentHeight())) {
            return 0;
        }

        var maxDelta = g.getContentHeight() - scrollRect.bottom;
        var minDelta = -scrollRect.top;
        var getElementBounds;

        // TODO keyEvent 등과 같은 처리에 필요한 switch 문
    };

    p.getScrollPositionDeltaToElement = function (index) {
        return this._getScrollPositionDeltaToElementHelper(index);
    };

    p.calculateDropLocation = function (dragEvent) {
        var dropPoint = this._globalToLocal(dragEvent.stageX, dragEvent.stageY);
        var dropIndex = this.calculateDropIndex(dropPoint.x, dropPoint.y);
        if(dropIndex = -1){
            return null;
        }

        var dropLocation = new DropLocation();
        dropLocation.dragEvent = dragEvent;
        dropLocation.dropPoint = dropPoint;
        dropLocation.dropIndex = dropIndex;
        return dropLocation;
    };

    p.showDropIndicator = function (dropLocation) {
        // TODO DropIndicator의 기능이 적용 될 시, 구현
    };

    p.hideDropIndicator = function () {
        // TODO DropIndicator의 기능이 적용 될 시, 구현
    };

    // protected Method

    p.scrollPositionChanged = function () {
        var g = this.getTarget();
        if (!g) {
            return;
        }

        this.updateScrollRect(g.width, g.height);
    };

    p.getScrollRect = function () {
        var g = this.getTarget();
        if (!g) {
            return null;
        }
        var vsp = g.getVerticalScrollPosition();
        var hsp = g.getHorizontalScrollPosition();
        return new Rectangle(hsp, vsp, g.getWidth(), g.getHeight());
    };

    p.getElementBoundsLeftOfScrollRect = function (scrollRect) {
        var bounds = new Rectangle(0, 0, 0, 0);
        bounds.left = scrollRect.left - 1;
        bounds.right = scrollRect.left;
        return bounds;
    };

    p.getElementBoundsRightOfScrollRect = function (scrollRect) {
        var bounds = new Rectangle(0, 0, 0, 0);
        bounds.left = scrollRect.right;
        bounds.right = scrollRect.right + 1;
        return bounds;
    };

    p.getElementBoundsAboveScrollRect = function (scrollRect) {
        var bounds = new Rectangle(0, 0, 0, 0);
        bounds.top = scrollRect.top - 1;
        bounds.bottom = scrollRect.top;
        return bounds;
    };

    p.getElementBoundsBelowScrollRect = function (scrollRect) {
        var bounds = new Rectangle(0, 0, 0, 0);
        bounds.top = scrollRect.bottom;
        bounds.bottom = scrollRect.bottom + 1;
        return bounds;
    };

    p.getScrollPositionDeltaToElementHelperHelper = function (elementR, elementLocalBounds, entireElementVisible, topOffset, bottomOffset, leftOffset, rightOffset) {
        if (!elementR) {
            return null;
        }

        var scrollR = this.getScrollRect();
        if (!scrollR) {
            return null;
        }

        if (isNaN(topOffset) && isNaN(bottomOffset) && isNaN(leftOffset) && isNaN(rightOffset) && (scrollR.containsRect(elementR) || (!elementLocalBounds && elementR.containsRect(scrollR)))) {
            return null;
        }

        var dx = 0;
        var dy = 0;

        if (entireElementVisible) {
            var dxl = elementR.left - scrollR.left;
            var dxr = elementR.right - scrollR.right;
            var dyt = elementR.top - scrollR.top;
            var dyb = elementR.bottom - scrollR.bottom;

            dx = (Math.abs(dxl) < Math.abs(dxr)) ? dxl : dxr;
            dy = (Math.abs(dyt) < Math.abs(dyb)) ? dyt : dyb;

            if (!isNaN(topOffset)) {
                dy = dyt + topOffset;
            } else if (!isNaN(bottomOffset)) {
                dy = dyb - bottomOffset;
            }

            if (!isNaN(leftOffset)) {
                dx = dxl + leftOffset;
            } else if (!isNaN(rightOffset)) {
                dx = dxr - rightOffset;
            }

            if ((elementR.left >= scrollR.left) && (elementR.right <= scrollR.right)) {
                dx = 0;
            } else if ((elementR.bottom <= scrollR.left) && (elementR.top >= scrollR.top)) {
                dy = 0;
            }

            if ((elementR.left <= scrollR.left) && (elementR.right >= scrollR.right)) {
                dx = 0;
            } else if ((elementR.bottom >= scrollR.bottom) && (elementR.top <= scrollR.top)) {
                dy = 0;
            }
        }
        if (elementLocalBounds) {
            if (elementR.width > scrollR.width || !entireElementVisible) {
                if (elementLocalBounds.left < scrollR.left) {
                    dx = elementLocalBounds.left < scrollR.left;
                } else if (elementLocalBounds.right > scrollR.right) {
                    dx = elementLocalBounds.right - scrollR.right;
                }
            }
            if (elementR.height > scrollR.height || !entireElementVisible) {
                if (elementLocalBounds.bottom > scrollR.bottom) {
                    dy = elementLocalBounds.bottom - scrollR.bottom;
                } else if (elementLocalBounds.top <= scrollR.top) {
                    dy = elementLocalBounds.top - scrollR.top;
                }
            }
        }
        return new Point(dx, dy);
    };

    p.calculateDropIndex = function (x, y) {
        // TODO DropIndicator의 기능이 적용 될 시, 구현
    };
    p.calculateDropIndicatorBounds = function (dropLocation) {
        // TODO DropIndicator의 기능이 적용 될 시, 구현
    };
    p.calculateDragScrollDelta = function (dropLocation, elapsedTime) {
        // TODO DropIndicator의 기능이 적용 될 시, 구현
    };


    // private Method

    p._convertLocalToTarget = function (element, elementLocalBounds) {
        if (!element) {
            return new Rectangle(0, 0, 0, 0);
        }

        var parentUIC = element.parent;
        if (parentUIC) {
            var g = this.getTarget();
            var posPointStart = new Point(element.getLayoutBoundsX() + elementLocalBounds.x, element.getLayoutBoundsY() + elementLocalBounds.y);
            var posPoint = parentUIC.localToGlobal(posPointStart);
            posPoint = g.globalToLocal(posPoint);

            return new Rectangle(posPoint.x, posPoint.y, elementLocalBounds.width, elementLocalBounds.height);
        }
        return new Rectangle(0, 0, 0, 0);
    };
    p._dragScrollingInProgress = function () {
        // TODO Scroll 기능이 적용 될 시, 구현
    };
    p._startDragScrolling = function () {
        // TODO Scroll 기능이 적용 될 시, 구현
    };
    p._dragScroll = function (event) {
        // TODO Scroll 기능이 적용 될 시, 구현
    };
    p._stopDragScrolling = function () {
        // TODO Scroll 기능이 적용 될 시, 구현
    };
    p._globalToLocal = function (x, y) {
        var layoutTarget = this.getTarget();
        var parent = layoutTarget.parent;
        var local = parent.globalToLocal(new Point(x, y));
        local.x -= layoutTarget.x;
        local.y -= layoutTarget.y;

        var scrollRect = this.getScrollRect();
        if(scrollRect){
            local.x += scrollRect.x;
            local.y += scrollRect.y;
        }
        return local;
    };

    // mx_internal private Method
    p._getChildElementBounds = function (element) {
        if (!element) {
            return new Rectangle(0, 0, 0, 0);
        }

        var parentUIC = element.parent;
        if (parentUIC) {
            var g = this.getTarget();

            //XXX point는 object x, y 속성으로 변경
            var posPointStart = new Point(element.getLayoutBoundsX(), element.getLayoutBoundsY());
            var sizePoint = new Point(element.getLayoutBoundsWidth(), element.getLayoutBoundsHeight());

            var posPoint = parentUIC.localToGlobal(posPointStart);

            posPoint = g.globalToLocal(posPoint);

            return new Rectangle(posPoint.x, posPoint.y, sizePoint.x, sizePoint.y);
        }
        return new Rectangle(0, 0, 0, 0);
    };
    p._isElementVisible = function (elt) {
        if (!elt) {
            return false;
        }

        var g = this.getTarget();
        if (!g) {
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
    p._getScrollPositionDeltaToElementHelper = function (index, topOffset, bottomOffset, leftOffset, rightOffset) {
        var elementR = this.getElementBounds(index);
        return this.getScrollPositionDeltaToElementHelperHelper(
            elementR, null, true,
            topOffset, bottomOffset,
            leftOffset, rightOffset);
    };

    p._getScrollPositionDeltaToAnyElement = function (element, elementLocalBounds, entireElementVisible, topOffset, bottomOffset, leftOffset, rightOffset) {
        var elementR = getChildElementBounds(element);

        if (elementLocalBounds)
            elementLocalBounds = this._convertLocalToTarget(element, elementLocalBounds);
        return this.getScrollPositionDeltaToElementHelperHelper(
            elementR, elementLocalBounds, entireElementVisible,
            topOffset, bottomOffset,
            leftOffset, rightOffset);
    };
    p._getElementNearestScrollPosition = function (position, elementComparePoint) {
        var num = this.getTarget().getNumElements();
        var minDistance = Number.MAX_VALUE;
        var minDistanceElement = -1;
        var i = 0;
        var rect // Rectangle
        var dist = 0;

        for(i = 0 ; i < num ; i++){
            rect = this.getElementBounds(i);

            if(rect !== null){
                var elementPoint = null;
                switch(elementComparePoint){
                    case "topLeft":
                        elementPoint = rect.topLeft;
                        break;
                    case "bottomRight":
                        elementPoint = rect.bottomRight;
                        break;
                    case "bottomLeft":
                        elementPoint = new Point(rect.left, rect.bottom);
                        break;
                    case "topRight":
                        elementPoint = new Point(rect.right, rect.top);
                        break;
                    case "center":
                        elementPoint = new Point(rect.left + rect.width/2, rect.top + rect.height/2);
                        break;
                }

                dist = Point.distance(position, elementPoint);
                if(dist < minDistance){
                    minDistance = dist;
                    minDistanceElement = i;
                }
            }
        }
        return minDistanceElement;
    };


    window.volcano.LayoutBase = LayoutBase;
})
    (window);
