/*
 * Core
 * Visit http://volcanojs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2012 gstech.co.kr, inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
(function(window) {

    var previousVolcano = window.volcano;

    var volcano;

    var _ = window._;
    if (!_ && (typeof require !== 'undefined'))  {
        _ = require('underscore');
        require('backbone');
    }

    if (typeof Backbone !== 'undefined' && Backbone) {
        window.volcano = volcano = Backbone;
        volcano.BackboneVersion = volcano.VERSION;
    } else {
        throw new Error("volcanojs needs backbonejs library. \n you must include backbonejs before volcanojs");
    }

    volcano.VERSION = "0.1";

    /**
     * 이전 버전과의 충돌이 있을 경우 이전 버전을 사용 해야 할 때 호출.
     * @method noConflict
     * @return {Object} a string representation of the instance.
     **/
    volcano.noConflict = function() {
        window.volcano = previousVolcano;
        return this;
    };

    var agent = navigator.userAgent.toLocaleLowerCase();

    // mobile 기기 테스트
    volcano.isMobile = {
        android: agent.match(/android/i) ? true : false,
        blackberry: agent.match(/blackberry/i) ? true : false,
        iphone: agent.match(/iphone|ipod/i) ? true : false,
        ipad: agent.match(/ipad/i) ? true : false,
        windows: agent.match(/iemobile/i) ? true : false
    };

    volcano.isMobile.any = (volcano.isMobile.android || volcano.isMobile.blackberry || volcano.isMobile.iphone || volcano.isMobile.ipad || volcano.isMobile.windows);
    volcano.hasTouch = "ontouchstart" in window ? true : false;
    volcano.has3d = (function() {
        return ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
    })();

    // 이벤트 스트링 객체 설정
    volcano.e = {
        CLICK: volcano.hasTouch ? "touchend" : "click",
        MOUSE_DOWN : volcano.hasTouch ? 'touchstart' : 'mousedown',
        MOUSE_MOVE : volcano.hasTouch ? 'touchmove' : 'mousemove',
        MOUSE_UP : volcano.hasTouch ? 'touchend' : 'mouseup',
        CANCEL : volcano.hasTouch ? 'touchcancel' : 'mouseup'
    };

    // HTML5 기능 체크
    volcano.isHtml5 = {
        query: document["querySelectorAll"] ? true : false,
        canvas: window["HTMLCanvasElement"] ? true : false,
        audio: window["HTMLAudioElement"] && window["Audio"] ? true : false,
        video: window["HTMLVideoElement"] && window["Video"] ? true : false,
        storage: window["localStorage"] && window["localStorage"]["setItem"] ? true : false,
        orientation: "onorientationchange" in window ? true : false,
        hashchange: "onhashchange" in window ? true : false
    };

    volcano._browserPrefix = "webkit";
    volcano._transformProperty = "webkitTransform";

    volcano.isCss3DocumentDIV = document.createElement("div");
    volcano.isCss3 = {
        isTransform: (function(){
            var prefixes = ["", "webkit", "Moz", "O", "ms" ], n = prefixes.length, i;
            for( i = 0; i < n; i++ ) {
                if ( ( prefixes[i] + "Transform" ) in volcano.isCss3DocumentDIV.style ) {
                    volcano._transformProperty = prefixes[i] + "Transform";
                    volcano._browserPrefix = prefixes[i];
                    return true;
                }
            }return false;
        })(),
        isTransition: (function(){

        })()
    };

})(window);
