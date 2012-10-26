var DEVEL=false;//로컬에서 개발할 경우 true

//***************************************
// Chatting 제어 및 관리
//***************************************

var COMMAND = '__command';//client --> server
var REPLY = '__reply';//server --> client
var ERROR = '__error';//server --> client
var MESSAGE = '__message';//server --> client

var socket = null;//
if(DEVEL){
    socket = io.connect();
}else{
    socket = io.connect("http://pangtalk.gstech.co.kr:3030");
}

function log(msg){
    console.log(JSON.stringify(msg));
}

var objectData = new Array();

var sysMgr, tdScroller;
/**
 * 초기 컨테이너를 생성한다.
 */
initCreateContainer = function(){
    sysMgr = new volcano.SystemManager().width(innerWidth).height(innerHeight).setStyle("overflow", "visible").x(0).y(0);
    sysMgr.frameRate(60);
    tdScroller = new volcano.ThreeDimensionsScroller(sysMgr);
    sysMgr.addElement(tdScroller);

    // 화면 구성 데이타를 호출한다.
    getChatRoomInfo();
};
/**
 * COMMAND에 대한 응답 결과이다.
 * replyMsg = {
 *     cmd_id:"some.command",
 *     data:"some.data",//or {subdata:"some sub data"}
 *     msg:"some.message" //생략가능.
 * }
 */
socket.on(REPLY, function (replyMsg) {
//    console.log("REPLY : "+JSON.stringify( replyMsg ));
    if(!replyMsg.cmd_id){
    }else if(replyMsg.cmd_id === 'get.chatroom.info'){
        var replyData = replyMsg.data;
        var len = replyData.length;
        for(var i = 0 ; i < len ; i++){
            // id(key), 이미지 파일 이름, 드라마 제목, 채널에 접속중인 인원 수, 방송시작시간, 방송종료시간, 방송 채널, 방송 요일, 출연진, 시놉시스, 트위터 검색어
            var chat = "";
            if(i%2 === 0){
                chat = "[인생극장] : 푸하하하하";
            }
            var obj = {id: i, filepath: replyData[i].img, title: replyData[i].title, userCnt: replyData[i].userCnt, company: replyData[i].company, onair: replyData[i].onair,
                actors: replyData[i].actors.toString(), story: replyData[i].story, lastTalk: replyData[i].lastTalk, twitterQuery: "#"+replyData[i].title};
            objectData.push(obj);
        }

        // data 넣기
        tdScroller.dataProvider(objectData);
        // 속성 변경하기
        tdScroller.setConfig({cols: 2, imageGap: 15, isReflection: false});

        tdScroller.drawView();

    }else if(replyMsg.cmd_id === 'get.chatroom.info.curr'){
        //메인페이지 마지막 대화, 사용자수, 방송여부 갱신해야한다.
    }else if(replyMsg.cmd_id === 'register.user'){
        /*
         replyMsg = {
         "cmd_id":"register.user",
         "data":"FAIL",//or "OK"
         "msg":"해당 이름을 사용하는 사람이 존재합니다."
         }
         */
        if(replyMsg.data === "OK"){
            console.log("사용자 등록이 정상적으로 이루어졌습니다.");
        }else{
            console.log("error msg : "+replyMsg.msg);
        }
    }else if(replyMsg.cmd_id === 'enter.chatroom'){
        /*
         * replyMsg.data = {
         "sender":"개똥이",
         "chatroom":2,
         "userCnt":32,
         "dramaTitle":"힘내요 미스터 김!"
         }
         */
        console.log("채팅방 '"+replyMsg.data.dramaTitle+"'의 사용자 : "+replyMsg.data.userCnt);
    }
});

/**
 * 서버로부터 발생하는 푸쉬 데이터이다.
 * pushMsg = {
 *     msg_id:"some.msg.id",
 *     data:"some.data",//or {subdata:"some sub data"}
 *     msg:"some.message"//생략가능.
 * }
 */
socket.on(MESSAGE, function (pushMsg) {
    log('message from server : '+ JSON.stringify(pushMsg));
    if(!pushMsg.msg_id){
    }else if(pushMsg.msg_id === 'send.chat.msg'){ // 챗팅방에서의 쳇팅 메세지
        /*
         pushMsg.data = {
         "chatMsg" :"방가방가",
         "sender":"개똥이",
         "chatroom":2,
         "dramaTitle":"힘내요 미스터 김!"
         };
         */
        var data = pushMsg.data;
        var line = "["+data.sender+"] "+data.chatMsg;
        addChatLine(line);
    }else if(pushMsg.msg_id === 'user.disconnect'){ // 챗팅방에서 사용자 접속 종료 안내
        /*
         pushMsg.data = {
         "sender":"개똥이",
         "chatroom":2,
         "userCnt":31,
         "dramaTitle":"힘내요 미스터 김!"
         };
         */
        var line = "** 사용자 ["+pushMsg.data.sender+"]님의 연결이 끊겼습니다.";
        addChatLine(line);
    }else if(pushMsg.msg_id === 'enter.chatroom'){ // 챗팅방에서 사용자 입장 안내
        /*
         pushMsg.data = {
         "sender":"개똥이",
         "chatroom":2,
         "userCnt":32,
         "dramaTitle":"힘내요 미스터 김!"
         };
         */
        var line = "** 사용자 ["+pushMsg.data.sender+"]님이 입장하였습니다.";
        addChatLine(line);
    }else if(pushMsg.msg_id === 'exit.chatroom'){ // 챗팅방에서 사용자 퇴장 안내
        /*
         pushMsg.data = {
         "sender":"개똥이",
         "chatroom":2,
         "userCnt":31,
         "dramaTitle":"힘내요 미스터 김!"
         };
         */
        var line = "** 사용자 ["+pushMsg.data.sender+"]님이 퇴장하였습니다.";
        addChatLine(line);
    }else if(pushMsg.msg_id === 'main.chatroom.userCnt'){ // 챗팅방 출입시 챗팅방의 사용자 수 안내
        tdScroller._imageArr[pushMsg.data.chatroom].userCnt(pushMsg.data.userCnt);
        /*
         pushMsg.data = {
         "chatroom":2,
         "userCnt":12,
         "dramaTitle":"힘내요 미스터 김!"
         };
         */
        console.log("채팅방 : "+pushMsg.data.dramaTitle +"\n채팅방 사용자 수 : "+pushMsg.data.userCnt);
    }else if(pushMsg.msg_id === 'main.chat.msg'){ // 챗팅창에서의 마지막 챗팅 대화 안내
        tdScroller._imageArr[pushMsg.data.chatroom].lastTalk({user: pushMsg.data.sender, talk: pushMsg.data.chatMsg});
        /*
         pushMsg.data = {
         "chatMsg" :"방가방가",
         "sender":"개똥이",
         "chatroom":2,
         "dramaTitle":"힘내요 미스터 김!"
         };
         */
        console.log("채팅방 : "+pushMsg.data.dramaTitle +"\n마지막 채팅대화 : "+pushMsg.data.chatMsg);
    }else if(pushMsg.msg_id === 'main.onair.status'){

        for(var i = 0 ; i < pushMsg.data.length ; i++){
            tdScroller._imageArr[pushMsg.data[i].chatroom].onair(pushMsg.data[i].onair);
        }

        /*
         pushMsg.data = [
         {
         "onair" :true,
         "chatroom":2,
         "title":"힘내요 미스터 김!"
         },
         {
         "onair" :true,
         "chatroom":2,
         "title":"힘내요 미스터 김!"
         },
         ];
         */
//        if(pushMsg.data[0].onair){
//            console.log("드라마 '"+pushMsg.data[0].title +"'가 방송중 생태로 변경되었습니다.");
//        }else{
//            console.log("드라마 '"+pushMsg.data[0].title +"'가 방송 종료 생태로 변경되었습니다.");
//        }
    }
    //main.chat.msg
});

/**
 * 에러가 발생할 경우 서버가 보내는 메시지이다.
 * errorMsg = {
 *     cmd_id:"some.cmd.id",//command에 대한 오류이면 cmd_id가 존재하며, 특정 command의 오류가 아닌경우는 생략된다.
 *     data:"some.data",//or {subdata:"some sub data"}
 *     msg:"some.message"
 * }
 */
socket.on(ERROR, function (errorMsg) {
    console.log('error data : '+ JSON.stringify( errorMsg ));
});

/**
 * server 접속이 끊겼을 경우, 연결 종료 메시지를 보여준다.
 */
socket.on('disconnect', function(){
    //control_disconnect_modal
    console.log("Socket IO disconnected");
});

/**
 * server에 명령을 송신한다.
 * @param msg 전송할 메시지 객체. msg.cmd_id를 포함하지 않을 경우는 반드시 cmd_id파라미터를 입력해야한다.
 * @param cmdId 명령 ID. 값이 있을 때에 msg.cmd_id에 포함시킨다.
 */
function sendCmd(msg,cmdId){
    if(!msg){
        log("sendCmd() >> can't send null msg." );
        return;
    }
    if(!msg.cmd_id && !cmdId){
        //log("sendCmd() >> can't send null msg." );
        alert('Error!\nNo Command Id.');
        return;
    }
    if(cmdId){
        msg.cmd_id = cmdId;
    }
    socket.emit(COMMAND,msg);
}

/**
 * 채팅보드 마지막라인에 line을 추가한다. 스크롤을 내린다.
 * @param line
 */
function addChatLine(line){
    var chatBoardTxt = $("#ta_chatting_board").val();
    if(!chatBoardTxt){
        $("#ta_chatting_board").val(line);
    }else{
        $("#ta_chatting_board").val(chatBoardTxt+"\n"+line);
    }
    $('#ta_chatting_board').scrollTop($('#ta_chatting_board')[0].scrollHeight);
}

function getChatRoomInfo(){
    console.log("getChatRoomInfo() invoked...");
    sendCmd({},"get.chatroom.info");
    //sendCmd({},"get.chatroom.info.curr");
}

function resgisterUser(){
    console.log("resgisterUser() invoked...");
    var userName = trim($("#in_userName").val());
    if(!userName){
        console.log("empty...");
        return;
    }
//    var name = "개똥이";
    sendCmd({"name":userName},"register.user");
}

function reconnect(){
    console.log("reconnect() invoked...");
    var userName = trim($("#in_userName").val());
    if(!userName){
        console.log("empty...");
        return;
    }
    sendCmd({"name":userName},"reconnect.user");
}

function enterChatRoom(){
    console.log("enterChatRoom() invoked...");
    var chatRoomIdx = trim($("#sl_chatroom").val());
    if(!chatRoomIdx){
        console.log("empty...");
        return;
    }
    sendCmd({"chatroom":chatRoomIdx},"enter.chatroom");
}

function exitChatRoom(){
    console.log("exitChatRoom() invoked...");
    var chatRoomIdx = trim($("#sl_chatroom").val());
    if(!chatRoomIdx){
        console.log("empty...");
        return;
    }
    sendCmd({"chatroom":chatRoomIdx},"exit.chatroom");
}

function sendChatMsg(){
    console.log("sendChatMsg() invoked...");
    var chatMsg = trim($("#in_chatInputText").val());
    if(!chatMsg){
        console.log("empty...");
        return;
    }
    sendCmd({"chatMsg":chatMsg},"send.chat.msg");
    $("#in_chatInputText").val("");
}
