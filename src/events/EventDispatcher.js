/*
 * EventDispatcher
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

    /**
    * EventDispatcher는 이벤트를 송수신 할 수 있는 메커니즘을 제공하며 Flash와 동일하게 동작한다.
    * Backbone.js 의 Events 클래스를 가져와 Event API 호환성을 유지한다.
    *
    * @class EventDispatcher
    * @constructor
    **/
    var EventDispatcher = function() {
      this.initialize();
    }

    var mp = volcano.Model.prototype,
        cp = volcano.Collection.prototype,
        vp = volcano.View.prototype,
        rp = volcano.Router.prototype,
        vEvents = window.volcano.Events;

    mp.addEventListener = mp.on;
    mp.removeEventListener = mp.off;
    mp.dispatchEvent = mp.trigger;

    cp.addEventListener = cp.on;
    cp.removeEventListener = cp.off;
    cp.dispatchEvent = cp.trigger;

    vp.addEventListener = vp.on;
    vp.removeEventListener = vp.off;
    vp.dispatchEvent = vp.trigger;

    rp.addEventListener = rp.on;
    rp.removeEventListener = rp.off;
    rp.dispatchEvent = rp.trigger;

    var p = EventDispatcher.prototype = new volcano.Core();
    p.Core_initialize = p.initialize;

    p.initialize = function() {
        this.Core_initialize(); //call super
    };

    p.addEventListener = p.on = p.bind = vEvents.on;
    p.removeEventListener = p.off = p.unbind = vEvents.off;
    p.dispatchEvent = p.trigger = vEvents.trigger;

    window.volcano.EventDispatcher = EventDispatcher;

})(window);