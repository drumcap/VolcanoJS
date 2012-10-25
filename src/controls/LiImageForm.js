(function (window) {

    var LiImageForm = function(elements, options){
        this.initialize(elements, options);
    };

    var p = LiImageForm.prototype = new volcano.VObject();

    p._domElement = null;

    p.imgObj;
    p.spanOnAirObj;
    p.divObj;
    p.divBgSpanObj;
    p.divTextSpanObj;

    p.VObject_initialize = p.initialize;
    p.initialize = function(elements, options){
        var liDom = document.createElement("li");
        var imgDom = document.createElement("img");
        var spanOnAirDom = document.createElement("span");
        var divDom = document.createElement("div");
        var divBgSpanDom = document.createElement("span");
        var divTextSpanDom = document.createElement("span");

        liDom.appendChild(imgDom);
        liDom.appendChild(spanOnAirDom);
        liDom.appendChild(divDom);
        divDom.appendChild(divBgSpanDom);
        divDom.appendChild(divTextSpanDom);

        this.imgObj = new volcano.VObject(imgDom);
        this.spanOnAirObj = new volcano.VObject(spanOnAirDom);
        this.divObj = new volcano.VObject(divDom);
        this.divBgSpanObj = new volcano.VObject(divBgSpanDom);
        this.divTextSpanObj = new volcano.VObject(divTextSpanDom);

        this.VObject_initialize(liDom, options);

        this.addClass("dramaitem");
//        this.imgObj._domElement.src = "jjy/img/thumb_title01.jpg";
        this.imgObj.addClass("poster");
        this.spanOnAirObj.addClass("chaton onair");
        this.divObj.addClass("desc");
        this.divBgSpanObj.addClass("bg");
        this.divTextSpanObj.addClass("text chat");

        this.divTextSpanObj._domElement.innerHTML = "재열씨짱";

        this.imgObj.percentWidth(100);
        this.imgObj.percentHeight(100);
        var that = this;
        setInterval(function(){that.setOnAir(that);}, 1000 * 5);
    };

    /**
     * service DataProvider
     * @type {Array}
     * @private
     */
    p._dataProvider = {};
    p.dataProvider = function(provider){
        if(arguments.length){
            this._dataProvider = provider;

            this.id(this._dataProvider.id); // id
            this.imageUrl(this._dataProvider.filepath); // 대표 이미지 경로
            this.titleName(this._dataProvider.titlename); // 제목
            this.chat(this._dataProvider.chat); // 최근 채팅 내용
            this.userLink(this._dataProvider.userlink); // 채널 유저 접속 수
            this.onStart(this._dataProvider.onstart); // 드라마 시작 시간 (24시 기준)
            this.onEnd(this._dataProvider.onend); // 드라마 끝나는 시간
            this.channel(this._dataProvider.channel); // 드라마 채널 정보
            this.onDays(this._dataProvider.onday); // 드라마 요일
            this.actors(this._dataProvider.actor); // 드라마 배우
            this.sinario(this._dataProvider.sinario); // 드라마 줄거리
            this.twitterQuery(this._dataProvider.twitterquery); // 트위터 검색어
            return this;
        }else{
            return this._dataProvider;
        }
    };

    /**
     * 제목
     * @type {String}
     * @private
     */
    p._titleName = "";
    p.titleName = function(name){
        if(arguments.length){
            this._titleName = name;
            return this;
        }else{
            return this._titleName;
        }
    };

    p._chat = "";
    p.chat = function(value){
        if(arguments.length){
            this._chat = value;
            if(this._chat.trim() === ""){
                this.divTextSpanObj._domElement.innerHTML = this.titleName();
                this.removeClassDivText("chat");
            }else{
                this.divTextSpanObj._domElement.innerHTML = this._chat;
                this.addClassDivText("chat");
            }
            return this;
        }else{
            return this._chat;
        }
    }

    /**
     * 채널방에 접속되어 있는 user 수
     * @type {String}
     * @private
     */
    p._userLink = "";
    p.userLink = function(len){
        if(arguments.length){
            this._userLink = len;
            this.spanOnAirObj._domElement.innerHTML = this._userLink === "" ? 0 : parseInt(this._userLink);
            return this;
        }else{
            return this._userLink;
        }
    };

    /**
     * 드라마 시작 시간
     * @type {String}
     * @private
     */
    p._onStart = "";
    p.onStart = function(time){
        if(arguments.length){
            this._onStart = time;
            this.setOnAir();
            return this;
        }else{
            return this._onStart;
        }
    };

    /**
     * 드라마 종료 시간
     * @type {String}
     * @private
     */
    p._onEnd = "";
    p.onEnd = function(time){
        if(arguments.length){
            this._onEnd = time;
            this.setOnAir();
            return this;
        }else{
            return this._onEnd;
        }
    };

    /**
     * 현재 방영중인지를 확인
     */
    p.setOnAir = function(that){
        //onStart == int
        //onEnd == int
        //onDays == Array (int)
        if(!that){
            that = this;
        }
        var date = new Date();
        var len = that._onDays.length;
        var onAirFlag = false;
        var currentTime = Number(date.getHours().toString() + date.getMinutes().toString());
        for(var i = 0 ; i < len ; i++){
            // 해당 요일을 검사
            if(this._onDays[i] == date.getDay()){
                if(that._onStart <= currentTime && that._onEnd >= currentTime){
                    onAirFlag = true;
                    break;
                }
            }
        }
        if(onAirFlag){
            that.addClassOnAir("onair");
        }else{
            that.removeClassOnAir("onair");
        }
    }

    /**
     * 드라마 채널 정보
     * @type {String}
     * @private
     */
    p._channel = "";
    p.channel = function(channelName){
        if(arguments.length){
            this._channel = channelName;
            return this;
        }else{
            return this._channel;
        }
    };

    /**
     * 드라마 방영 요일
     * @type {Array}
     * @private
     */
    p._onDays = [];
    p.onDays = function(day){
        if(arguments.length){
            this._onDays = day;
            this.setOnAir();
            return this;
        }else{
            return this._onDays;
        }
    };

    /**
     * 드라마 주요 출연 배우
     * @type {Array}
     * @private
     */
    p._actors = [];
    p.actors = function(names){
        if(arguments.length){
            this._actors = name;
            return this;
        }else{
            return this._actors;
        }
    };

    /**
     * 드라마 시나리오
     * @type {String}
     * @private
     */
    p._sinario = "";
    p.sinario = function(name){
        if(arguments.length){
            return this;
        }else{
            return this._sinario;
        }
    };

    /**
     * 트위터 Query 정보
     * @type {String}
     * @private
     */
    p._twitterQuery = "";
    p.twitterQuery = function(name){
        if(arguments.length){
            return this;
        }else{
            return this._twitterQuery;
        }
    };

    /**
     * 이미지 경로
     * @param url 이미지 풀 경로
     */
    p.imageUrl = function(url){
        this.imgObj._domElement.src = url;
        return this;
    };

    /**
     * img tag addClass
     */
    p.addClassImage = function(){
      var className = arguments;
        var len = className.length;
        var classStr = className[0];
        for(var i = 1 ; i < len ; i++){
            classStr = classStr + ", " + classStr;
        }
        this.imgObj.addClass(classStr);
        return this;
    };

    /**
     * img tag removeClass
     */
    p.removeClassImage = function(){
        var className = arguments;
        var len = className.length;
        var classStr = className[0];
        for(var i = 1 ; i < len ; i++){
            classStr = classStr + ", " + classStr;
        }
        this.imgObj.removeClass(classStr);
        return this;
    };

    /**
     * spanOnAir tag addClass
     */
    p.addClassOnAir = function(){
        var className = arguments;
        var len = className.length;
        var classStr = className[0];
        for(var i = 1 ; i < len ; i++){
            classStr = classStr + ", " + classStr;
        }
        this.spanOnAirObj.addClass(classStr);
        return this;
    };

    /**
     * spanOnAir tag removeClass
     */
    p.removeClassOnAir = function(){
        var className = arguments;
        var len = className.length;
        var classStr = className[0];
        for(var i = 1 ; i < len ; i++){
            classStr = classStr + ", " + classStr;
        }
        this.spanOnAirObj.removeClass(classStr);
        return this;
    };

    /**
     * spanOnAir tag addClass
     */
    p.addClassDiv = function(){
        var className = arguments;
        var len = className.length;
        var classStr = className[0];
        for(var i = 1 ; i < len ; i++){
            classStr = classStr + ", " + classStr;
        }
        this.divObj.addClass(classStr);
        return this;
    };

    /**
     * spanOnAir tag removeClass
     */
    p.removeClassDiv = function(){
        var className = arguments;
        var len = className.length;
        var classStr = className[0];
        for(var i = 1 ; i < len ; i++){
            classStr = classStr + ", " + classStr;
        }
        this.divObj.removeClass(classStr);
        return this;
    };

    /**
     * spanOnAir tag addClass
     */
    p.addClassDivBg = function(){
        var className = arguments;
        var len = className.length;
        var classStr = className[0];
        for(var i = 1 ; i < len ; i++){
            classStr = classStr + ", " + classStr;
        }
        this.divBgSpanObj.addClass(classStr);
        return this;
    };

    /**
     * spanOnAir tag removeClass
     */
    p.removeClassDivBg = function(){
        var className = arguments;
        var len = className.length;
        var classStr = className[0];
        for(var i = 1 ; i < len ; i++){
            classStr = classStr + ", " + classStr;
        }
        this.divBgSpanObj.removeClass(classStr);
        return this;
    };

    /**
     * spanOnAir tag addClass
     */
    p.addClassDivText = function(){
        var className = arguments;
        var len = className.length;
        var classStr = className[0];
        for(var i = 1 ; i < len ; i++){
            classStr = classStr + ", " + classStr;
        }
        this.divTextSpanObj.addClass(classStr);
        return this;
    };

    /**
     * spanOnAir tag removeClass
     */
    p.removeClassDivText = function(){
        var className = arguments;
        var len = className.length;
        var classStr = className[0];
        for(var i = 1 ; i < len ; i++){
            classStr = classStr + ", " + classStr;
        }
        this.divTextSpanObj.removeClass(classStr);
        return this;
    };

    volcano.LiImageForm = LiImageForm;

})(window);