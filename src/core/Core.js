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
    if (typeof exports !== 'undefined') {
        volcano = exports;
    } else {
        volcano = window.volcano = {};
    }

    var _ = window._;
    if (!_ && (typeof require !== 'undefined'))  {
        _ = require('underscore');
        require('backbone');
    }

    if (typeof Backbone !== 'undefined' && Backbone) {
        _.extend(volcano, Backbone);
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

    /** 클래스가 상속해야할 코어 클래스
    * 기본 네임스페이스 설정과 버전정보가 들어있다
    *
    * @class Core
    * @constructor
    * @author david yun
    **/
    var Core = function() {
      this.initialize();
    };
    Core.extend = window.volcano.Model.extend; // Backbone의 extend를 Core에 심어놓

    Core._isInit = false;
    Core._isSupported = false;
    Core._browserPrefix = "webkit";
    Core._transformProperty = "webkitTransform";

    var p = Core.prototype;
    p.initialize = function() {

        if (!Core._isInit) {
            var d = document.createElement("div"),
                prefixes = ["", "webkit", "Moz", "O", "ms" ],
                n = prefixes.length, i;

            Core._isInit = true;
            // check for 3D transforms
            for( i = 0; i < n; i++ ) {
                if ( ( prefixes[i] + "Perspective" ) in d.style ) {
                    Core._transformProperty = prefixes[i] + "Transform";
                    Core._isSupported = true;
                    Core._browserPrefix = prefixes[i];
                    return true;
                }
            }
        }

    };

    window.volcano.Core = Core;

})(window);
