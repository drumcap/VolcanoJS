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

        this.imgObj.percentWidth(100);
        this.imgObj.percentHeight(100);
        var that = this;
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
            this.title(this._dataProvider.title); // 제목
            this.lastTalk({user: "", talk: ""}); // 최근 채팅 내용
            this.userCnt(this._dataProvider.userCnt); // 채널 유저 접속 수
            this.onair(this._dataProvider.onair); // 생방송 시간 확인
            this.company(this._dataProvider.company); // 드라마 채널 정보
            this.actors(this._dataProvider.actors); // 드라마 배우
            this.story(this._dataProvider.story); // 드라마 줄거리
            this.twitterQuery(this._dataProvider.twitterQuery); // 트위터 검색어
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
    p._title = "";
    p.title = function(name){
        if(arguments.length){
            this._title = name;
            return this;
        }else{
            return this._title;
        }
    };

    p._lastTalk = {};
    p.lastTalk = function(value){
        if(arguments.length){
            this._lastTalk = value;
//            "["+ replyData[i].lastTalk.user +"]" + replyData[i].lastTalk.talk,
            if(this._lastTalk.user.trim() === "" && this._lastTalk.talk.trim() === ""){
                this.divTextSpanObj._domElement.innerHTML = this.title();
                this.removeClassDivText("chat");
            }else{
                this.divTextSpanObj._domElement.innerHTML = "["+ this._lastTalk.user +"] " + this._lastTalk.talk;
                this.addClassDivText("chat");
            }
            return this;
        }else{
            return this._lastTalk;
        }
    };

    /**
     * 채널방에 접속되어 있는 user 수
     * @type {String}
     * @private
     */
    p._userCnt = "";
    p.userCnt = function(len){
        if(arguments.length){
            this._userCnt = len;
            this.spanOnAirObj._domElement.innerHTML = this._userCnt === "" ? 0 : parseInt(this._userCnt);
            return this;
        }else{
            return this._userCnt;
        }
    };

    /**
     * 현재 방영중인지를 확인
     */
    p._onair;
    p.onair = function(value){
        this._onair = value;
        if(this._onair){
            this.addClassOnAir("onair");
        }else{
            this.removeClassOnAir("onair");
        }
    }

    /**
     * 드라마 채널 정보
     * @type {String}
     * @private
     */
    p._company = "";
    p.company = function(channelName){
        if(arguments.length){
            this._company = channelName;
            return this;
        }else{
            return this._company;
        }
    };

    /**
     * 드라마 주요 출연 배우
     * @type {Array}
     * @private
     */
    p._actors = "";
    p.actors = function(names){
        if(arguments.length){
            this._actors = names;
            return this;
        }else{
            return this._actors;
        }
    };

    /**
     * 드라마 스토리
     * @type {String}
     * @private
     */
    p._story = "";
    p.story = function(name){
        if(arguments.length){
            this._story = name;
            return this;
        }else{
            return this._story;
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