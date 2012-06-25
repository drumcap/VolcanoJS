(function (window) {

    var ObjectUtil = function () {
        throw "ObjectUtil cannot be initialized.";
    };

//private static properties:

    /**
     * @property _inProgress
     * @type Array[Object]
     * @protected
     **/
    ObjectUtil._inProgress = [];


// public static methods:

    /**
     * 객체를 출력해 주는 메소드로 console 객체로 출력하지 않고 화면에 출력하려 할 때 유용하다
     * 주의!! 시스템 객체는 멈출 가능성이 높으므로 사용하지 말것!
     * @method toString
     * @param {Object} obj 출력할 대상 객체
     * @param {Boolean} showFunctions 함수를 출력할 것인지 여부
     * @param {Boolean} showUndefined Undefined를 출력할 것인지 여부
     * @param {Number} maxLineLength 최대 라인 수
     * @param {Number} indent 들여쓰기
     **/
    ObjectUtil.toString = function (obj, showFunctions, showUndefined, maxLineLength, indent) {
        if (maxLineLength == undefined) {
            maxLineLength = 100;
        }
        if (indent == undefined) indent = 0;

        for (var x = 0; x < ObjectUtil._inProgress.length; x++) {
            if (ObjectUtil._inProgress[x] == obj) return "***";
        }
        ObjectUtil._inProgress.push(obj);

        indent++;
        var t = typeof(obj);
        var result;

        if (obj instanceof Date) {
            result = obj.toString();
        }
        else if (t == "object") {
            var nameList = new Array();
            if (obj instanceof Array) {
                result = "["; // "Array" + ":";
                for (var i = 0; i < obj.length; i++) {
                    nameList.push(i);
                }
            }
            else {
                result = "{"; // "Object" + ":";
                for (var i in obj) {
                    nameList.push(i);
                }
                nameList.sort();
            }

            var sep = "";
            for (var j = 0; j < nameList.length; j++) {
                var val = obj[nameList[j]];

                var show = true;
                if (typeof(val) == "function") show = (showFunctions == true);
                if (typeof(val) == "undefined") show = (showUndefined == true);

                if (show) {
                    result += sep;
                    if (!(obj instanceof Array))
                        result += nameList[j] + ": ";
                    result +=
                        ObjectUtil.toString(val, showFunctions, showUndefined, maxLineLength, indent);
                    sep = ", `";
                }
            }
            if (obj instanceof Array)
                result += "]";
            else
                result += "}";
        }
        else if (t == "function") {
            result = "function";
        }
        else if (t == "string") {
            result = "\"" + obj + "\"";
        }
        else {
            result = String(obj);
        }

        if (result == "undefined") result = "-";
        ObjectUtil._inProgress.pop();
        return ObjectUtil.replaceAll(result, "`", (result.length < maxLineLength) ? "" : ("\n" + ObjectUtil.doIndent(indent)));
    }

    /**
     * 입력된 문자열에 치환할 모든 대상을 치환한다.
     * @method replaceAll
     * @param {String} str 입력하려 하는 대상
     * @param {String} from 치환할 검색 대상 문자
     * @param {String} to 치환할 문자
    **/
    ObjectUtil.replaceAll = function (str, from, to) {
        var chunks = str.split(from);
        var result = "";
        var sep = "";
        for (var i = 0; i < chunks.length; i++) {
            result += sep + chunks[i];
            sep = to;
        }
        return result;
    }

    /**
     * 들여쓰기를 한다.
     * @method doIndent
     * @param {Number} indent 들여쓰기 할 빈칸의 수
    **/
    ObjectUtil.doIndent = function (indent) {
        var result = "";
        for (var i = 0; i < indent; i++) {
            result += "     ";
        }
        return result;
    }


    window.volcano.ObjectUtil = ObjectUtil;

}(window));