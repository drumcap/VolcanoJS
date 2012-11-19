(function(window){

    var ThreeDimensionsScroller = function(mgr){
        this.initialize(mgr);
    };

    var p = ThreeDimensionsScroller.prototype = new volcano.VSprite();

    var elementArr = [];
    var gravity = .5; //중력
    var bounce = -0.7; //튕길때는 음수로 힘이 약간 상쇄된다.
    var friction = 0.95; //마찰계수
    var maxScrollX, maxScrollY;
    var regX = 0, regY = 0,
        targetX = 0, targetY = 0,
        vX=0, vY=0;
    var oldX=0, oldY=0;
    var downPoint;
    var scrollOption;
    var containerElement;
    var isDown;
    var scrollMode = "horizontal";
    var accelRotate = 0;

    // 전체 이미지 개수 설정, cols count 설정
    var imageLen = 68;
    var colsLen = 2;
    var rowsLen = imageLen / colsLen;
    var imageGap = 20;
    // reflection 기능 여부
    var isReflection = true;
    var reflectionArr = [];
    var reflectionStartIndex = -1;
    var reflectionEndIndex = -1;
    var reflectionGap = 5;
    // 윈도우 화면에서 view 화면의 크기 비율 구하기
    var windowMaxHeight;
    var windowMaxWidht;
    var windowBlank = 10;
    var windowGap; // 윈도우 전체 크기에서 top, bottom의 갭을 구한다.

    var windowHeight;
    var imageHeight;// 이미지 높이
    var imageWidth;
    var viewPortHeight;
    var viewPortWidth;
    var viewPortBack;

    // 이미지 담기
    var imageArr = [];
    var imageReflectionArr = [];

    // 이미지 담기
    p._imageArr = [];
    p._imageReflectionArr = [];
    p.sysMgr;
    p.transViewPort;
    p.container;
    p.mainContainer;
    // bounceBack 사용 유무
    p.isBounceBack = true;
    p.imageWidth;
    p.imageHeight;
    p.viewPortBack;
    p.isMouseEvent = true;
    p.isKeyboardEvent = true;

    var isMove = false;
    var bounceback = 0.7;
    var backeasing = 0.1;
    var isXBacking = false;
    var isYBacking = false;
    var maxRotate = 30;
    var sumValue = 2;
    var currentRotate = 0;
    var testFlag = false;
    var yRotateValue = 0;
    var oldRotate = 0;
    var leftOutX = false;
    var rightOutX = false;
    var scrollerOutX = false;
    // stop, leftFast, leftSlow, rightFast, rightSlow
    var motionStr = "stop";
    var maxAccelRotate = 1;
    var accelRotate = 0.1;
    var isFirstDown = false;
    var transViewPort, container;
    var mainContainer;
    var onlyOneDrawFlag = false;
    var _dataProvider = [];
    // 브라우저 3D 기능 체크
    var browserIs3dFix = true;
    var minViewPortHeight = 200;
    var maxViewPortHeight = 500;
    var that;

    p.VSprite_initialize = p.initialize;
    p.initialize = function(mgr){
        browserIs3dFix = volcano.has3d;
        that = this;
        this.VSprite_initialize();
        this.sysMgr = mgr;
    };

    /**
     * 설정을 한 후, 화면을 렌더링 하기 위해 호출되는 function
     */
    p.drawView = function(){
        if(onlyOneDrawFlag){
//            console.log("한번만 호출 할 수 있습니다.")
        }else{
            if(_dataProvider.length > 0){
                onlyOneDrawFlag = true;
                this.initContainer();
            }else{
//                console.log("먼저 데이타가 설정되어 있어야 합니다.")
            }
        }
    };

    p.initContainer = function(){
        windowMaxHeight = innerHeight;
        windowMaxWidht = innerWidth;
        this.isBounceBack = true;

        windowGap = windowMaxHeight / windowBlank;
        // 이미지 객체 생성
        imageLen = _dataProvider.length;
        rowsLen = imageLen / colsLen;

        windowHeight = windowMaxHeight - (windowGap * 2);
        if(windowHeight < minViewPortHeight){ // 최소사이즈
            windowHeight = minViewPortHeight;
            windowGap = (windowMaxHeight - minViewPortHeight) * 0.5;
        }else if(windowHeight > maxViewPortHeight){
            windowHeight = maxViewPortHeight;
            windowGap = (windowMaxHeight - maxViewPortHeight) * 0.5;
        }

        if(isReflection){
            imageHeight = windowHeight / (colsLen + 0.7) - (imageGap / (colsLen / (colsLen - 1))); // 이미지 높이
        }else{
            imageHeight = windowHeight / colsLen - (imageGap / (colsLen / (colsLen - 1))); // 이미지 높이
        }

        imageWidth = imageHeight;
        viewPortHeight = windowHeight;
        viewPortWidth = (rowsLen * imageWidth) + (imageGap * (rowsLen - 1));

        viewPortBack = -(windowMaxWidht/2);
        mainContainer = new volcano.VSprite().id("mainContainer").width(0).height(0).x(-viewPortBack);
        container = new volcano.VSprite().id("container").width(0).height(0).x(0).y(windowGap);
        var ulTag = document.createElement("ul");
        transViewPort = new volcano.VSprite(ulTag).id("viewPort").height(0).width(0);

        this.addElement(mainContainer);
        mainContainer.addElement(container);
        container.addElement(transViewPort);

        var imageX = 0;
        var imageY = 0;
        var i = 0;

        for(i = 0 ; i < imageLen ; i++){
            var imageX = (i%rowsLen) * (imageWidth + imageGap) + viewPortBack;
            var imageY = parseInt(i/(imageLen / colsLen)) * (imageHeight + imageGap);
            var img = new volcano.LiImageForm(undefined, {defaultValue: "off"}).width(imageWidth).height(imageHeight).x(imageX).y(imageY).dataProvider(_dataProvider[i]);

            if(isReflection){
                if(parseInt(i/(imageLen / colsLen)) === colsLen - 1){
                    if(reflectionStartIndex === -1){
                        reflectionStartIndex = i;
                    }
                    reflectionEndIndex = i + 1;
                }
            }
            transViewPort.addElement(img);
            imageArr.push(img);
        }

        this._imageArr = imageArr;

        // 이미지 객체 reflection 생성
        if(isReflection){
            for(i = reflectionStartIndex ; i < reflectionEndIndex ; i++){
                var imageX = (i%rowsLen) * (imageWidth + imageGap) + viewPortBack;
                var imageY = parseInt(colsLen) * (imageHeight + imageGap) - (imageGap) + reflectionGap;
                var img = new volcano.LiImageForm(undefined, {defaultValue: "off"}).width(imageWidth).height(imageHeight).x(imageX).y(imageY);
                transViewPort.addElement(img);
//                img.imageClassName("reflection");
                img.rotationX(180);
                imageReflectionArr.push(img);
            }

            this._imageReflectionArr = imageReflectionArr;
        }

        this.transViewPort = transViewPort;
        this.container = container;
        this.mainContainer = mainContainer;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.viewPortBack = viewPortBack;

        sysMgr.addEventListener(volcano.e.MOUSE_DOWN, onMouseDownHandler);
        if (!volcano.isMobile.ipad)
            sysMgr.addEventListener("resize", onSystemManagerResize);
        sysMgr.addEnterFrameListener(onEnterFrame);

        sysMgr.setStyle("Perspective", 0 + "px", volcano._browserPrefix);
        mainContainer.setStyle("Perspective", 800 + "px", volcano._browserPrefix);
        mainContainer.setStyle("perspective-origin-y", innerHeight/2, volcano._browserPrefix);

        sysMgr.addEventListener("mousewheel", mouseWheelHandler, false);
        var bd = document.body;
        bd.addEventListener("keydown", keyDownHandler);
    };

    function keyDownHandler(event){
        if(!that.isKeyboardEvent){
            return;
        }else{
            var keyCode = event.keyCode;
            isMove = false;
            isDown = false;
            var keyAccel = 100;
            var keyPos = 10;
            var codeFlag = false;

            if(keyCode == 38 || keyCode == 39){
                // 키보드 up 방향키
                keyAccel = -100;
                keyPos = -10;
                codeFlag = true;
            }else if(keyCode == 40 || keyCode == 37){
                // 키보드 down 방향키
                keyAccel = 100;
                keyPos = 10;
                codeFlag = true;
            }

            if(codeFlag){
                if(isFirstDown){
                    oldX = targetX;
                    oldY = targetY;
                    isFirstDown = false;
                }

                transViewPort.x(transViewPort.x() + keyAccel);
                targetX = targetX + keyPos;

                vX = targetX - oldX + vX;

                oldX = targetX;
            }
        }
    };

    function mouseWheelHandler(event){
        if(!that.isMouseEvent){
            return;
        }else{
            var e = window.event || event;
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

            isMove = false;
            isDown = false;
            var wheelAccel = 100;
            var wheelPos = 10;
            if(delta > 0){
                // 휠을 위로 올릴 때
                wheelAccel = -100;
                wheelPos = -10;
            }else{
                // 휠을 아래로 내릴 때
                wheelAccel = 100;
                wheelPos = 10;
            }

            if(isFirstDown){
                oldX = targetX;
                oldY = targetY;
                isFirstDown = false;
            }

            transViewPort.x(transViewPort.x() + wheelAccel);
            targetX = targetX + wheelPos;

            vX = targetX - oldX + vX;

            oldX = targetX;
        }
    }

    function onSystemManagerResize(){

        windowMaxHeight = innerHeight;
        windowMaxWidht = innerWidth;

        viewPortBack = -(windowMaxWidht/2);
        windowGap = windowMaxHeight / windowBlank;

        windowHeight = windowMaxHeight - (windowGap * 2);
        if(windowHeight < minViewPortHeight){
            windowHeight = minViewPortHeight;
            windowGap = (windowMaxHeight - minViewPortHeight) * 0.5;
        }else if(windowHeight > maxViewPortHeight){
            windowHeight = maxViewPortHeight;
            windowGap = (windowMaxHeight - maxViewPortHeight) * 0.5;
        }

        if(isReflection){
            imageHeight = windowHeight / (colsLen + 0.7) - (imageGap / (colsLen / (colsLen - 1))); // 이미지 높이
        }else{
            imageHeight = windowHeight / colsLen - (imageGap / (colsLen / (colsLen - 1))); // 이미지 높이
        }

        imageWidth = imageHeight;
        viewPortHeight = windowHeight;
        viewPortWidth = (rowsLen * imageWidth) + (imageGap * (rowsLen - 1));

        mainContainer.width(0).height(0).x(-viewPortBack);
        container.width(0).height(0).x(0).y(windowGap);
        transViewPort.height(0).width(0);

        var imageX = 0;
        var imageY = 0;

        var i = 0;
        // 이미지 객체
        for(i = 0 ; i < imageLen ; i++){
            var imageX = (i%rowsLen) * (imageWidth + imageGap) + viewPortBack;
            var imageY = parseInt(i/(imageLen / colsLen)) * (imageHeight + imageGap);
            //console.log(imageY);
            imageArr[i].width(imageWidth).height(imageHeight).x(imageX).y(imageY);
        }

        // 이미지 객체
        if(isReflection){
            for(i = reflectionStartIndex ; i < reflectionEndIndex ; i++){
                var imageX = (i%rowsLen) * (imageWidth + imageGap) + viewPortBack;
                var imageY = parseInt(colsLen) * (imageHeight + imageGap) - (imageGap) + reflectionGap;
                imageReflectionArr[i - reflectionStartIndex].width(imageWidth).height(imageHeight).x(imageX).y(imageY);
            }
        }

        p.imageWidth = imageWidth;
        p.imageHeight = imageHeight;
        p.viewPortBack = viewPortBack;

        mainContainer.setStyle("perspective-origin-y", innerHeight/2, volcano._browserPrefix);
    };

    function onEnterFrame(){
        // systemManager 크기 조절
        sysMgr.width(innerWidth).height(innerHeight);

        if(innerWidth - viewPortWidth > 0){
            maxScrollX = 0;
        }else{
            maxScrollX = innerWidth - viewPortWidth;
        }

        if(innerHeight - viewPortHeight > 0){
            maxScrollY = 0;
        }else{
            maxScrollY = innerHeight - viewPortHeight;
        }

        if (isMove) {
            if(scrollMode === "auto"){
                transViewPort.move(targetX, targetY, 0);
            }else if(scrollMode === "vertical"){
                transViewPort.move(0, targetY, 0);
                viewPort.move(0, targetY, 0);
            }else if(scrollMode === "horizontal"){
                transViewPort.move(targetX, 0, 0);
            }

            if(yRotateValue > 0.3){
                yRotateValue = yRotateValue - (0.3 * accelRotate);
                yRotateValue = yRotateValue < 0 ? 0 : yRotateValue;
            }else if(yRotateValue < -0.3){
                yRotateValue = yRotateValue + (0.3 * accelRotate);
                yRotateValue = yRotateValue > 0 ? 0 : yRotateValue;
            }else{
                yRotateValue = 0;
            }
        }else if(isDown){
            // TODO mouseDown 일 경우
            if(yRotateValue > 0.3){
                yRotateValue = yRotateValue - (0.3 * accelRotate);
                yRotateValue = yRotateValue < 0 ? 0 : yRotateValue;
            }else if(yRotateValue < -0.3){
                yRotateValue = yRotateValue + (0.3 * accelRotate);
                yRotateValue = yRotateValue > 0 ? 0 : yRotateValue;
            }else{
                yRotateValue = 0;
            }
        } else {
//            console.log(targetX);
            var sx = transViewPort.x(),
                sy = transViewPort.y();

            if (Math.abs(vX)>0 || Math.abs(vY)>0) {
                vX = (Math.abs(vX) < 0.9) ? 0 : vX * friction;
                vY = (Math.abs(vY) < 0.9) ? 0 : vY * friction;
            }

            if(that.isBounceBack){
                //좌표가 스크롤 영역에서 벗어나 있을때
                scrollerOutX = false;
                if (sx > 0 || sx < maxScrollX) {
                    var tx = sx > 0 ? 0 : maxScrollX;
                    if (vX === 0 || isXBacking) {
                        vX = (tx-sx) * backeasing;
                        isXBacking = true;
                        if(tx === 0){
                            leftOutX = true;
                        }else if(tx === maxScrollX){
                            rightOutX = true;
                        }

                    } else {
                        vX *= bounceback;
                    }
                    scrollerOutX = true;
                }

                if (sy > 0 || sy < maxScrollY) {
                    var ty = sy > 0 ? 0 : maxScrollY;
                    if (vY === 0 || isYBacking) {
                        vY = (ty-sy) * backeasing;
                        isYBacking = true;
                    } else {
                        vY *= bounceback;
                    }
                }
            }

            var rx,ry;
            if (Math.abs(vX)>0.01 || Math.abs(vY)>0.01)
            {
                if(scrollMode === "auto"){
                    rx = (sx > 0 && sx < 1) ? 0 : (sx > maxScrollX-1 && sx < maxScrollX) ? maxScrollX : sx + vX;
                    ry = (sy > 0 && sy < 1) ? 0 : (sy > maxScrollY-1 && sy < maxScrollY) ? maxScrollY : sy + vY;

                    if ((sx > 0 && sx < 1) || (sx > maxScrollX-1 && sx < maxScrollX)) isXBacking = false;
                    if ((sy > 0 && sy < 1) || (sy > maxScrollY-1 && sy < maxScrollY)) isYBacking = false;
                }else if(scrollMode === "vertical"){
                    rx = 0;
                    ry = (sy > 0 && sy < 1) ? 0 : (sy > maxScrollY-1 && sy < maxScrollY) ? maxScrollY : sy + vY;
                    if ((sy > 0 && sy < 1) || (sy > maxScrollY-1 && sy < maxScrollY)) isYBacking = false;
                }else if(scrollMode === "horizontal"){
                    rx = (sx > 0 && sx < 1) ? 0 : (sx > maxScrollX-1 && sx < maxScrollX) ? maxScrollX : sx + vX;
                    if ((sx > 0 && sx < 1) || (sx > maxScrollX-1 && sx < maxScrollX)) isXBacking = false;
                    ry = 0;
                }

                transViewPort.move(rx, ry, 0);

            }

            if(volcano.has3d){
                currentRotate = vX;

                if(currentRotate > maxRotate && scrollerOutX === false){
                    if(motionStr !== "leftFast"){
                        accelRotate = 0.1;
                    }
                    motionStr = "leftFast";
                }else if(currentRotate < -maxRotate && scrollerOutX === false){
                    if(motionStr !== "rightFast"){
                        accelRotate = 0.1;
                    }
                    motionStr = "rightFast";
                }else{
                    if(0 < currentRotate && currentRotate < oldRotate && scrollerOutX === false){
                        if(motionStr !== "leftSlow"){
                            accelRotate = 0.1;
                        }
                        motionStr = "leftSlow";
                    }else if(0 > currentRotate && currentRotate > oldRotate && scrollerOutX === false){
                        if(motionStr !== "rightSlow"){
                            accelRotate = 0.1;
                        }
                        motionStr = "rightSlow";
                    }else if(0 === currentRotate && currentRotate === oldRotate || scrollerOutX === true){
                        if(motionStr !== "stop"){
                            accelRotate = 0.1;
                        }
                        motionStr = "stop";
                    }
                }

                oldRotate = currentRotate;

                accelRotate = accelRotate + 0.3 > maxAccelRotate ? 1 : accelRotate + 0.3;
//                    //console.log(scrollerOutX);


                if(motionStr === "stop" || scrollerOutX){
                    testFlag = false;
                    if(yRotateValue > 0.3){
                        yRotateValue = yRotateValue - (0.3 * accelRotate);
                        yRotateValue = yRotateValue < 0 ? 0 : yRotateValue;
                    }else if(yRotateValue < -0.3){
                        yRotateValue = yRotateValue + (0.3 * accelRotate);
                        yRotateValue = yRotateValue > 0 ? 0 : yRotateValue;
                    }else{
                        yRotateValue = 0;
                    }
//                        //console.log("stop");
                }else if(motionStr === "leftSlow"){
//                    if(maxRotate/3 < currentRotate){
//                        yRotateValue = yRotateValue > maxRotate ? maxRotate : yRotateValue + (0.8 * accelRotate);
//                    }else{
                    yRotateValue = yRotateValue < -maxRotate ? -maxRotate : yRotateValue - (0.8 * accelRotate);
                    yRotateValue = yRotateValue < 0 ? 0 : yRotateValue;
//                    }
//                    //console.log("leftSlow " + maxRotate/3 + " ============== " + currentRotate);
                }else if(motionStr === "rightSlow"){
//                    if(-(maxRotate / 3) > currentRotate){
//                        yRotateValue = yRotateValue < -maxRotate ? -maxRotate : yRotateValue - (0.8 * accelRotate);
//                    }else{
                    yRotateValue = yRotateValue > maxRotate ? maxRotate : yRotateValue + (0.8 * accelRotate);
                    yRotateValue = yRotateValue > 0 ? 0 : yRotateValue;
//                    }
//                    //console.log("rightSlow " + -(maxRotate / 3) + " ============== " + currentRotate);
                }else if(motionStr === "leftFast"){
                    yRotateValue = yRotateValue >= maxRotate ? maxRotate : yRotateValue + (sumValue * accelRotate);
                    //console.log("leftFast");
                }else if(motionStr === "rightFast"){
                    yRotateValue = yRotateValue <= -maxRotate ? -maxRotate : yRotateValue - (sumValue * accelRotate);
                    //console.log("rightFast", yRotateValue);
                }
            }
        }

        if(volcano.has3d){
            container.rotationY(-yRotateValue);
        }
    };

    function onMouseDownHandler(event) {
        if(!that.isMouseEvent){
            return;
        }else{
            var point = volcano.hasTouch ? event.touches[0] : event;
            downPoint = point;
            event.preventDefault();

            sysMgr.addEventListener(volcano.e.MOUSE_MOVE, onMouseMoveHandler);
            sysMgr.addEventListener(volcano.e.MOUSE_UP, onMouseUpHandler);
            sysMgr.addEventListener(volcano.e.CANCEL, onMouseUpHandler);

            isMove = false;
            isDown = true;

            regX = point.pageX - transViewPort.x();
            regY = point.pageY - transViewPort.y();

            isFirstDown = true;
        }
    };

    function onMouseMoveHandler(event) {
        if(!that.isMouseEvent){
            return;
        }else{
            var point = volcano.hasTouch ? event.touches[0] : event;

            event.preventDefault();

            isMove = true;
            isDown = false;
            var pageX = point.pageX,
                pageY = point.pageY;

            targetX = pageX - regX;
            targetY = pageY - regY;

            if(isFirstDown){
                oldX = targetX;
                oldY = targetY;
                isFirstDown = false;
            }
            setAccelerate();
        }
    };

    function onMouseUpHandler(event) {
        isMove = false;
        isDown = false;
        sysMgr.removeEventListener(volcano.e.MOUSE_MOVE, onMouseMoveHandler);
        sysMgr.removeEventListener(volcano.e.MOUSE_UP, onMouseUpHandler);
        sysMgr.removeEventListener(volcano.e.CANCEL, onMouseUpHandler);
    };

    function setAccelerate() {
        vX = targetX - oldX;
        vY = targetY - oldY;

        oldX = targetX;
        oldY = targetY;
    };

    /**
     * 화면 정보 구성에 필요한 Array 데이타
     * @param value
     */
    p.dataProvider = function(value){
        _dataProvider = value;
    };

    /**
     * 실시간 메세지 서비스 push 데이타
     * @param value
     */
    p.dataRefresh = function(value){

    };

    /**
     * 속성 설징
     *
     * @param obj {cols: 2, imageGap: 20, isReflection: true};
     */
    p.setConfig = function(obj){
        colsLen = obj.cols === undefined ? colsLen : obj.cols;
        imageGap = obj.imageGap === undefined ? imageGap : obj.imageGap;
        isReflection = obj.isReflection === undefined ? isReflection : obj.isReflection;
    }

    /**
     * 접속자 수
     * @param value
     */
    p.setChannelUserLink = function(value){

    };

    /**
     * 최근 입력 된 메세지 내용
     * @param value
     */
    p.setNewMessage = function(value){

    };

    window.volcano.ThreeDimensionsScroller = ThreeDimensionsScroller;

})(window);