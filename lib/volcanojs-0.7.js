/*
* VolcanoJS
* Visit http://volcanojs.com/ for documentation, updates and examples.
*
* Copyright (c) 2012 gstech.co.kr, inc.
* 
* Distributed under the terms of the MIT license.
* http://www.opensource.org/licenses/mit-license.html
*
* This notice shall be included in all copies or substantial portions of the Software.
*/
/*
* Ticker
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2010 gskinner.com, inc.
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

// namespace:
this.createjs = this.createjs||{};

(function() {

// constructor:
/**
* The Ticker class uses a static interface (ex. Ticker.getPaused()) and should not be instantiated.
* Provides a centralized tick or heartbeat broadcast at a set interval. Listeners can subscribe
* to the tick event to be notified when a set time interval has elapsed.
* Note that the interval that the tick event is called is a target interval, and may be broadcast
* at a slower interval during times of high CPU load.
* @class Ticker
* @static
**/
var Ticker = function() {
	throw "Ticker cannot be instantiated.";
}

// public static properties:
	/**
	 * Indicates whether Ticker should use requestAnimationFrame if it is supported in the browser. If false, Ticker
	 * will use setTimeout. If you use RAF, it is recommended that you set the framerate to a divisor of 60 (ex. 15,
	 * 20, 30, 60).
	 * @property useRAF
	 * @static
	 * @type Boolean
	 **/
	Ticker.useRAF = null;
	
	/**
	 * Event broadcast  once each tick / interval. The interval is specified via the 
	 * .setInterval(ms) or setFPS methods.
	 * @event tick
	 * @param {Number} timeElapsed The time elapsed in milliseconds since the last tick event.
	*/	
	
// private static properties:

	
	/** 
	 * @property _listeners
	 * @type Array[Object]
	 * @protected 
	 **/
	Ticker._listeners = null;
	
	/** 
	 * @property _pauseable
	 * @type Array[Boolean]
	 * @protected 
	 **/
	Ticker._pauseable = null;
	
	/** 
	 * @property _paused
	 * @type Boolean
	 * @protected 
	 **/
	Ticker._paused = false;
	
	/** 
	 * @property _inited
	 * @type Boolean
	 * @protected 
	 **/
	Ticker._inited = false;
	
	/** 
	 * @property _startTime
	 * @type Number
	 * @protected 
	 **/
	Ticker._startTime = 0;
	
	/** 
	 * @property _pausedTime
	 * @type Number
	 * @protected 
	 **/
	Ticker._pausedTime=0;
	
	/** 
	 * Number of ticks that have passed
	 * @property _ticks
	 * @type Number
	 * @protected 
	 **/
	Ticker._ticks = 0;
	
	/**
	 * Number of ticks that have passed while Ticker has been paused
	 * @property _pausedTicks
	 * @type Number
	 * @protected 
	 **/
	Ticker._pausedTicks = 0;
	
	/** 
	 * @property _interval
	 * @type Number
	 * @protected 
	 **/
	Ticker._interval = 50; // READ-ONLY
	
	/** 
	 * @property _lastTime
	 * @type Number
	 * @protected 
	 **/
	Ticker._lastTime = 0;
	
	/** 
	 * @property _times
	 * @type Array[Number]
	 * @protected 
	 **/
	Ticker._times = null;
	
	/** 
	 * @property _tickTimes
	 * @type Array[Number]
	 * @protected 
	 **/
	Ticker._tickTimes = null;
	
	/** 
	 * @property _rafActive
	 * @type Boolean
	 * @protected 
	 **/
	Ticker._rafActive = false;
	
	/** 
	 * @property _timeoutID
	 * @type Number
	 * @protected 
	 **/
	Ticker._timeoutID = null;
	
	
// public static methods:
	/**
	 * Adds a listener for the tick event. The listener must be either an object exposing a .tick() method,
	 * or a function. The listener will be called once each tick / interval. The interval is specified via the 
	 * .setInterval(ms) method.
	 * The tick method or function is passed two parameters: the elapsed time between the 
	 * previous tick and the current one, and a boolean indicating whether Ticker is paused.
	 * @method addListener
	 * @static
	 * @param {Object} o The object or function to add as a listener.
	 * @param {Boolean} pauseable If false, the listener will continue to have tick called 
	 * even when Ticker is paused via Ticker.pause(). Default is true.
	 **/
	Ticker.addListener = function(o, pauseable) {
		if (o == null) { return; }
		if (!Ticker._inited) { Ticker.init(); }
		Ticker.removeListener(o);
		Ticker._pauseable[Ticker._listeners.length] = (pauseable == null) ? true : pauseable;
		Ticker._listeners.push(o);
	}
	
	/**
	 * Initializes or resets the timer, clearing all associated listeners and fps measuring data, starting the tick.
	 * This is called automatically when the first listener is added.
	 * @method init
	 * @static
	 **/
	Ticker.init = function() {
		Ticker._inited = true;
		Ticker._times = [];
		Ticker._tickTimes = [];
		Ticker._pauseable = [];
		Ticker._listeners = [];
		Ticker._times.push(Ticker._lastTime = Ticker._startTime = Ticker._getTime());
		Ticker.setInterval(Ticker._interval);
	}
	
	/**
	 * Removes the specified listener.
	 * @method removeListener
	 * @static
	 * @param {Object} o The object or function to remove from listening from the tick event.
	 **/
	Ticker.removeListener = function(o) {
		var listeners = Ticker._listeners;
		if (!listeners) { return; }
		var index = listeners.indexOf(o);
		if (index != -1) {
			listeners.splice(index, 1);
			Ticker._pauseable.splice(index, 1);
		}
	}
	
	/**
	 * Removes all listeners.
	 * @method removeAllListeners
	 * @static
	 **/
	Ticker.removeAllListeners = function() {
		Ticker._listeners = [];
		Ticker._pauseable = [];
	}
	
	/**
	 * Sets the target time (in milliseconds) between ticks. Default is 50 (20 FPS).
	 * Note actual time between ticks may be more than requested depending on CPU load.
	 * @method setInterval
	 * @static
	 * @param {Number} interval Time in milliseconds between ticks. Default value is 50.
	 **/
	Ticker.setInterval = function(interval) {
		Ticker._interval = interval;
		if (!Ticker._inited) { return; }
		Ticker._setupTick();
	}
	
	/**
	 * Returns the current target time between ticks, as set with setInterval.
	 * @method getInterval
	 * @static
	 * @return {Number} The current target interval in milliseconds between tick events.
	 **/
	Ticker.getInterval = function() {
		return Ticker._interval;
	}
	
	/**
	 * Sets the target frame rate in frames per second (FPS). For example, with an interval of 40, getFPS() will 
	 * return 25 (1000ms per second divided by 40 ms per tick = 25fps).
	 * @method setFPS
	 * @static
	 * @param {Number} value Target number of ticks broadcast per second.
	 **/	
	Ticker.setFPS = function(value) {
		Ticker.setInterval(1000/value);
	}
	
	/**
	 * Returns the target frame rate in frames per second (FPS). For example, with an 
	 * interval of 40, getFPS() will return 25 (1000ms per second divided by 40 ms per tick = 25fps).
	 * @method getFPS
	 * @static
	 * @return {Number} The current target number of frames / ticks broadcast per second.
	 **/
	Ticker.getFPS = function() {
		return 1000/Ticker._interval;
	}
	
	/**
	 * Returns the actual frames / ticks per second.
	 * @method getMeasuredFPS
	 * @static
	 * @param {Number} ticks Optional. The number of previous ticks over which to measure the actual 
	 * frames / ticks per second. Defaults to the number of ticks per second.
	 * @return {Number} The actual frames / ticks per second. Depending on performance, this may differ
	 * from the target frames per second.
	 **/
	Ticker.getMeasuredFPS = function(ticks) {
		if (Ticker._times.length < 2) { return -1; }
		
		// by default, calculate fps for the past 1 second:
		if (ticks == null) { ticks = Ticker.getFPS()|0; }
		ticks = Math.min(Ticker._times.length-1, ticks);
		return 1000/((Ticker._times[0]-Ticker._times[ticks])/ticks);
	}
	
	/**
	 * While Ticker is paused, pausable listeners are not ticked. See addListener for more information.
	 * @method setPaused
	 * @static
	 * @param {Boolean} value Indicates whether to pause (true) or unpause (false) Ticker.
	 **/
	Ticker.setPaused = function(value) {
		Ticker._paused = value;
	}
	
	/**
	 * Returns a boolean indicating whether Ticker is currently paused, as set with setPaused.
	 * @method getPaused
	 * @static
	 * @return {Boolean} Whether the Ticker is currently paused.
	 **/
	Ticker.getPaused = function() {
		return Ticker._paused;
	}
	
	/**
	 * Returns the number of milliseconds that have elapsed since the first tick event listener was added to
	 * Ticker. For example, you could use this in a time synchronized animation to determine the exact amount of 
	 * time that has elapsed.
	 * @method getTime
	 * @static
	 * @param {Boolean} pauseable Indicates whether to include time elapsed
	 * while Ticker was paused. If false only time elapsed while Ticker is not paused will be returned.
	 * If true, the value returned will be total time elapsed since the first tick event listener was added.
	 * @return {Number} Number of milliseconds that have elapsed since Ticker was begun.
	 **/
	Ticker.getTime = function(pauseable) {
		return Ticker._getTime() - Ticker._startTime - (pauseable ? Ticker._pausedTime : 0);
	}
	
	/**
	 * Returns the number of ticks that have been broadcast by Ticker.
	 * @method getTicks
	 * @static
	 * @param {Boolean} pauseable Indicates whether to include ticks that would have been broadcast
	 * while Ticker was paused. If false only tick events broadcast while Ticker is not paused will be returned.
	 * If true, tick events that would have been broadcast while Ticker was paused will be included in the return
	 * value. The default value is false.
	 * @return {Number} of ticks that have been broadcast.
	 **/
	Ticker.getTicks = function(pauseable) {
		return  Ticker._ticks - (pauseable ?Ticker._pausedTicks : 0);
	}
	
// private static methods:
	/**
	 * @method _handleAF
	 * @protected
	 **/
	Ticker._handleAF = function() {
		Ticker._rafActive = false;
		Ticker._setupTick();
		// run if enough time has elapsed, with a little bit of flexibility to be early, because RAF seems to run a little faster than 60hz:
		if (Ticker._getTime() - Ticker._lastTime >= (Ticker._interval-1)*0.97) {
			Ticker._tick();
		}
	}
	
	/**
	 * @method _handleTimeout
	 * @protected
	 **/
	Ticker._handleTimeout = function() {
		Ticker.timeoutID = null;
		Ticker._setupTick();
		Ticker._tick();
	}
	
	/**
	 * @method _setupTick
	 * @protected
	 **/
	Ticker._setupTick = function() {
		if (Ticker._rafActive || Ticker.timeoutID != null) { return; } // avoid duplicates
		if (Ticker.useRAF) {
			var f = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
			if (f) {
				f(Ticker._handleAF);
				Ticker._rafActive = true;
				return;
			}
		}
		Ticker.timeoutID = setTimeout(Ticker._handleTimeout, Ticker._interval);
	}
	
	/**
	 * @method _tick
	 * @protected
	 **/
	Ticker._tick = function() {
		var time = Ticker._getTime();
		Ticker._ticks++;
		
		var elapsedTime = time-Ticker._lastTime;
		
		var paused = Ticker._paused;
		
		if (paused) {
			Ticker._pausedTicks++;
			Ticker._pausedTime += elapsedTime;
		}
		Ticker._lastTime = time;
		
		var pauseable = Ticker._pauseable;
		var listeners = Ticker._listeners.slice();
		var l = listeners ? listeners.length : 0;
		for (var i=0; i<l; i++) {
			var listener = listeners[i];
			if (listener == null || (paused && pauseable[i])) { continue; }
			if (listener.tick) { listener.tick(elapsedTime, paused); }
			else if (listener instanceof Function) { listener(elapsedTime, paused); }
		}
		
		Ticker._tickTimes.unshift(Ticker._getTime()-time);
		while (Ticker._tickTimes.length > 100) { Ticker._tickTimes.pop(); }
		
		Ticker._times.unshift(time);
		while (Ticker._times.length > 100) { Ticker._times.pop(); }
	}
	
	/**
	 * @method _getTime
	 * @protected
	 **/
	var now = window.performance && (performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow);
	Ticker._getTime = function() {
		return (now&&now.call(performance))||(new Date().getTime());
	}

createjs.Ticker = Ticker;
}());
// stats.js r5 - http://github.com/mrdoob/stats.js
var Stats=function(){function w(d,K,n){var u,f,c;for(f=0;f<30;f++)for(u=0;u<73;u++){c=(u+f*74)*4;d[c]=d[c+4];d[c+1]=d[c+5];d[c+2]=d[c+6]}for(f=0;f<30;f++){c=(73+f*74)*4;if(f<K){d[c]=b[n].bg.r;d[c+1]=b[n].bg.g;d[c+2]=b[n].bg.b}else{d[c]=b[n].fg.r;d[c+1]=b[n].fg.g;d[c+2]=b[n].fg.b}}}var v=0,x=2,e,y=0,l=(new Date).getTime(),J=l,z=l,o=0,A=1E3,B=0,m,g,a,p,C,q=0,D=1E3,E=0,h,i,r,F,s=0,G=1E3,H=0,j,k,t,I,b={fps:{bg:{r:16,g:16,b:48},fg:{r:0,g:255,b:255}},ms:{bg:{r:16,g:48,b:16},fg:{r:0,g:255,b:0}},mem:{bg:{r:48,
g:16,b:26},fg:{r:255,g:0,b:128}}};e=document.createElement("div");e.style.cursor="pointer";e.style.width="80px";e.style.opacity="0.9";e.style.zIndex="10001";e.addEventListener("click",function(){v++;v==x&&(v=0);m.style.display="none";h.style.display="none";j.style.display="none";switch(v){case 0:m.style.display="block";break;case 1:h.style.display="block";break;case 2:j.style.display="block"}},false);m=document.createElement("div");m.style.backgroundColor="rgb("+Math.floor(b.fps.bg.r/2)+","+Math.floor(b.fps.bg.g/
2)+","+Math.floor(b.fps.bg.b/2)+")";m.style.padding="2px 0px 3px 0px";e.appendChild(m);g=document.createElement("div");g.style.fontFamily="Helvetica, Arial, sans-serif";g.style.textAlign="left";g.style.fontSize="9px";g.style.color="rgb("+b.fps.fg.r+","+b.fps.fg.g+","+b.fps.fg.b+")";g.style.margin="0px 0px 1px 3px";g.innerHTML='<span style="font-weight:bold">FPS</span>';m.appendChild(g);a=document.createElement("canvas");a.width=74;a.height=30;a.style.display="block";a.style.marginLeft="3px";m.appendChild(a);
p=a.getContext("2d");p.fillStyle="rgb("+b.fps.bg.r+","+b.fps.bg.g+","+b.fps.bg.b+")";p.fillRect(0,0,a.width,a.height);C=p.getImageData(0,0,a.width,a.height);h=document.createElement("div");h.style.backgroundColor="rgb("+Math.floor(b.ms.bg.r/2)+","+Math.floor(b.ms.bg.g/2)+","+Math.floor(b.ms.bg.b/2)+")";h.style.padding="2px 0px 3px 0px";h.style.display="none";e.appendChild(h);i=document.createElement("div");i.style.fontFamily="Helvetica, Arial, sans-serif";i.style.textAlign="left";i.style.fontSize=
"9px";i.style.color="rgb("+b.ms.fg.r+","+b.ms.fg.g+","+b.ms.fg.b+")";i.style.margin="0px 0px 1px 3px";i.innerHTML='<span style="font-weight:bold">MS</span>';h.appendChild(i);a=document.createElement("canvas");a.width=74;a.height=30;a.style.display="block";a.style.marginLeft="3px";h.appendChild(a);r=a.getContext("2d");r.fillStyle="rgb("+b.ms.bg.r+","+b.ms.bg.g+","+b.ms.bg.b+")";r.fillRect(0,0,a.width,a.height);F=r.getImageData(0,0,a.width,a.height);try{if(webkitPerformance&&webkitPerformance.memory.totalJSHeapSize)x=
3}catch(L){}j=document.createElement("div");j.style.backgroundColor="rgb("+Math.floor(b.mem.bg.r/2)+","+Math.floor(b.mem.bg.g/2)+","+Math.floor(b.mem.bg.b/2)+")";j.style.padding="2px 0px 3px 0px";j.style.display="none";e.appendChild(j);k=document.createElement("div");k.style.fontFamily="Helvetica, Arial, sans-serif";k.style.textAlign="left";k.style.fontSize="9px";k.style.color="rgb("+b.mem.fg.r+","+b.mem.fg.g+","+b.mem.fg.b+")";k.style.margin="0px 0px 1px 3px";k.innerHTML='<span style="font-weight:bold">MEM</span>';
j.appendChild(k);a=document.createElement("canvas");a.width=74;a.height=30;a.style.display="block";a.style.marginLeft="3px";j.appendChild(a);t=a.getContext("2d");t.fillStyle="#301010";t.fillRect(0,0,a.width,a.height);I=t.getImageData(0,0,a.width,a.height);return{domElement:e,update:function(){y++;l=(new Date).getTime();q=l-J;D=Math.min(D,q);E=Math.max(E,q);w(F.data,Math.min(30,30-q/200*30),"ms");i.innerHTML='<span style="font-weight:bold">'+q+" MS</span> ("+D+"-"+E+")";r.putImageData(F,0,0);J=l;if(l>
z+1E3){o=Math.round(y*1E3/(l-z));A=Math.min(A,o);B=Math.max(B,o);w(C.data,Math.min(30,30-o/100*30),"fps");g.innerHTML='<span style="font-weight:bold">'+o+" FPS</span> ("+A+"-"+B+")";p.putImageData(C,0,0);if(x==3){s=webkitPerformance.memory.usedJSHeapSize*9.54E-7;G=Math.min(G,s);H=Math.max(H,s);w(I.data,Math.min(30,30-s/2),"mem");k.innerHTML='<span style="font-weight:bold">'+Math.round(s)+" MEM</span> ("+Math.round(G)+"-"+Math.round(H)+")";t.putImageData(I,0,0)}z=l;y=0}}}};

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

    var p = EventDispatcher.prototype;

    p.initialize = function() {};
    p.addEventListener = p.on = p.bind = vEvents.on;
    p.removeEventListener = p.off = p.unbind = vEvents.off;
    p.dispatchEvent = p.trigger = vEvents.trigger;

    window.volcano.EventDispatcher = EventDispatcher;

})(window);/*
 * VObject
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
(function (window) {

    /**
     * DOM Object를 감싸주는 기본 클래스
     * DOM Event 처리와, 기본 속성 조절 기능을 포함하고 있다.
     * 3D transform features are inspired by Sprite3D.js Project
     *
     * @class VObject
     * @constructor
     * @author david yun
     **/
    var VObject = function (element, options) {
        this.initialize(element, options);
    };

    VObject._eventSplitter = /\s+/;

    /**
     * Debug를 위해 Div에 랜덤 컬러를 지정 가능하게 한다.
     * @type {Boolean}
     */
    VObject.randomColorMode = false;

    var p = VObject.prototype;
    /**
     * 실제 화면에 display 될 래퍼 Div
     * @type {*}
     * @private
     */
    p._domElement = null;
    /**
     * 요소의 객체를 담아 두는 저장 공간
     * @type {Array}
     * @private
     */
    p._elementsContent = null;
    p.eventCallback = null;
    /**
     * parent 정보
     * @property parent
     * @final
     * @type VObject
     * @default null
     */
    p.parent = null;

    p._alpha = 1.0;

    // transform 스타일 속성을 넣기 위한 스키마 배열
    p._string = [];

    // transform 스타일 속성을 넣는 값이 있는 위치의 배열
    p._positions = [];

    // transform 스타일 속성을 setter 호출시에 즉시 업데이트 할지의 여부
    p.isAutoUpdate = true;

    p._ox = 0;
    p._oy = 0;
    p._oz = 0;

    // 스타일 속성 설정
    // default : on/off
    p._option = {};

    p.initialize = function (element, options) {

        var $ = window.Zepto || window.jQuery,
            createContainer;
        // 변수 초기화
        this._domElement = {};

        if(options !== undefined){
            this._option = options;
        }else{
            this._option.defaultValue = "on";
        }

        var that = this;


        // wrapper 컨테이너를 생성
        createContainer = function (w, h, bgColor) {
                var con = document.createElement('div');
                con.style.width = w + "px";
                con.style.height = h + "px";
                con.style.margin = "0px";
                con.style.padding = "0px";
                if (bgColor != undefined) {
                    con.style.backgroundColor = bgColor;
                }
                if (VObject.randomColorMode) {
                    con.style.backgroundColor = volcano.ColorUtil.getRandomColor();
                    //con.innerHTML = volcano.ColorUtil.getRandomColor();;
                    //con.style.opacity = 0.3;
                }
                if(that._option.defaultValue === "on"){
                    con.style.position = "absolute";
            }

            return con;
        };

        if ( arguments.length === 0 || _.isUndefined(element) ) {
            element = createContainer(this._width, this._height);
        } else if ( typeof(element) === "string" ) {
            var str = element;
            element = createContainer(this._width, this._height);
            switch( str[0] ) {
                case ".":
                    element.className = str.substr(1);
                    break;
                case "#":
                    element.id = str.substr(1);
                    break;
                default:
                    element.id = str;
                    break;
            }
        } else if (element.val && element.attr ) {
            if (element.length > 1){
                throw new Error("You are using multi selected jQuery/Zepto Object \n You MUST select only one DOM Object \n If you want to use multi selected jQuery/Zepto Object, you should use alternative class that is VobjectArray");
            }
            element = element.get(0);
        }else if(this._option.defaultValue === "off"){ // 기본 스타일을 off로 설정
//            console.log("create Volcano Style Default Option =====> off");
        }else if (element.style.position == "static" ) {
            element.style.position = "relative";
        }else {
            element.style.position = "absolute";
        }

        if(this._option.defaultValue === "on" && volcano.has3d){ // 기본 스타일을 on으로 설정
            element.style[ volcano._browserPrefix + "TransformStyle" ] = "preserve-3d";
            element.style[ volcano._transformProperty ] = "translateZ(0px)";
        }

        // add private properties
        this._string = [ "translate3d(", 0, "px,", 0, "px,", 0, "px) ",
                    "rotateX(", 0, "deg) ",
                    "rotateY(", 0, "deg) ",
                    "rotateZ(", 0, "deg) ",
                    "scale3d(", 1, ", ", 1, ", ", 1, ") "];

        this._positions = [
            1,  3,  5, // x, y, z
            8, 11, 14, // rotationX, rotationY, rotationZ
            17, 19, 21 // scaleX, scaleY, scaleZ
        ];
        this._ox = 0;
        this._oy = 0;
        this._oz = 0;

        this._domElement = element;
        this._domElement.volcanoObj = this; //FIXME 향후 메모리 문제가 생길 소지 있으니 개선해야함.
    };

    /**
     * 이벤트 리스닝을 하는 함수로 Wrapper Div에 이벤트 리스너를 달아주는 Delegator 함수
     * IE8 이하는 지원하지 않는다.
     * @param {String} events
     * @param {Function} callback 핸들러 함수, 여기에 전달되는 이벤트 객체는 DOM Event 객체임
     * @return {*}
     */
    p.addEventListener = function (events, callback) {
        var calls, event, node, tail, list, innerCallback, nodeTarget, cacheTarget, proxyEvent;
        if (!(events || callback)) return this;
        events = events.split(VObject._eventSplitter);
        calls = this._callbacks || (this._callbacks = {});

        innerCallback = function(event) {
            if (event) {

                if (!nodeTarget || cacheTarget != event.target) {
                    nodeTarget = cacheTarget = event.target;
                }

                if (!nodeTarget.volcanoObj) {
                    nodeTarget = nodeTarget.parentNode;
                    innerCallback.call(this,event);
                    return;
                }

                event.vCurrentTarget = this.volcanoObj; //핸들러에서의 this는 currentTarget을 가르킴
                event.vTarget = nodeTarget.volcanoObj;
//                event.domCurrentTarget = event.currentTarget;
//                event.domTarget = event.target;

//                _.extend(proxyEvent={}, event);
//                proxyEvent.currentTarget = event.volcanoCurrentTarget;
//                proxyEvent.target = event.volcanoTarget;
//                proxyEvent.constructor = event.constructor;

            }
            callback(event);
        };

        while (event = events.shift()) {
            list = calls[event];
            node = list ? list.tail : {};
            node.next = tail = {};
            node.callback = innerCallback;
            calls[event] = {tail: tail, next: list ? list.next : node};
            this._domElement.addEventListener(event, innerCallback);
        }
        return this;
    };

    /**
     * 이벤트 리스너를 제거 하는 함수로 Wrapper Div에 이벤트 리스너를 제거하는 Delegator 함수
     * IE8 이하는 지원하지 않는다.
     * @param {String} events
     * @param {Function} callback
     * @return {*}
     */
    p.removeEventListener = function (events, callback) {
        var event, calls, node, tail, cb;
        if (!(calls = this._callbacks)) return;
        if (!(events || callback)) return this;
        events = events.split(VObject._eventSplitter);

        while (event = events.shift()) {
            node = calls[event];
            delete calls[event];
            if (!node || !callback) continue;
            tail = node.tail;
            while ((node = node.next) !== tail) {
                cb = node.callback;
                this._domElement.removeEventListener(event, cb);
            }
        }
        return this;
    };

    /**
     * 이벤트를 발송하는 함수로 Wrapper Div에 이벤트를 발송 하는 Delegator 함수
     * 직접 custom 이벤트를 만들어서 전송하던가 아니면, 이벤트 타입만 넣어줘도 동작한다.
     * IE8 이하는 지원하지 않는다.
     * @param {String|Object} events
     * @param {Boolean} canBubble
     * @return {*}
     */
    p.dispatchEvent = function (events, canBubble) {
        var event, localEvt;

        if (_.isString(events)) {
            events = events.split(VObject._eventSplitter);

            while (event = events.shift()) {
                (canBubble) ? canBubble = true : canBubble = false;

                localEvt = document.createEvent('CustomEvent');
                localEvt.initCustomEvent(event, canBubble, false, {}); //4번째 파라미터는 ie9 오류방지를 위한 data
                this._domElement.dispatchEvent(localEvt);
            }
        } else if (_.isObject(events)) {
            this._domElement.dispatchEvent(events);
        }
        return this;
    };

    p._width = 0;
    /**
     * width 값을 설정하는 Getter/Setter
     * @param {Number} w
     * @return {*}
     */
    p.width = function (w) {
        if (arguments.length) {
            this._width = w;
            this._domElement.style.width = w+"px";
            return this;
        }else{
            this._width = this._domElement.style.width.toString().split("px")[0];
            if(this._width === ""){
                this._width = getComputedStyle(this._domElement).width.toString().split("px")[0];
            }
            return this._width;
        }
    };
    p._height = 0;
    /**
     * height 값을 설정하는 Getter/Setter
     * @param {Number} h
     * @return {*}
     */
    p.height = function (h) {
        if (arguments.length) {
            this._height = h;
            this._domElement.style.height = h+"px";
            return this;
        }else{
            this._height = this._domElement.style.height.toString().split("px")[0];
            if(this._height === ""){
                this._height = getComputedStyle(this._domElement).height.toString().split("px")[0];
            }
            return this._height;
        }

    };

    p._percentWidth = 0;
    /**
     * percent width 값을 설정하는 Getter/Setter
     * @param {Number} w
     * @return {*}
     */
    p.percentWidth = function (w) {
        if (arguments.length) {
            this._percentWidth = w;
            this._domElement.style.width = w+"%";
            return this;
        }else{
            if(this._percentWidth === ""){
                this._percentWidth = getComputedStyle(this._domElement).percentWidth;
            }
            return this._percentWidth;
        }
    };

    p._percentHeight = 0;
    /**
     * percent height 값을 설정하는 Getter/Setter
     * @param {Number} h
     * @return {*}
     */
    p.percentHeight = function (h) {
        if (arguments.length) {
            this._percentHeight = h;
            this._domElement.style.height = h+"%";
            return this;
        }else{
            if(this._percentHeight === ""){
                this._percentHeight = getComputedStyle(this._domElement).percentHeight;
            }
            return this._percentHeight;
        }
    };

    p.x = function(px) {
        if ( arguments.length ) {
            this._string[this._positions[0]] = px - this._ox;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[0]] + this._ox;
        }
    };

    p.y = function(py) {
        if ( arguments.length ) {
            this._string[this._positions[1]] = py - this._oy;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[1]] + this._oy;
        }
    };

    p._pz = 0;
    p.z =  function(pz) {
        if ( arguments.length ) {
            this._string[this._positions[2]] = pz - this._oz;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[2]] + this._oz;
        }
    };

//    p.position = function( px, py, pz) {
//        this._string[this._positions[0]] = px - this._ox;
//        this._string[this._positions[1]] = py - this._oy;
//        if ( arguments.length >= 3 ) this._string[this._positions[2]] = pz - this._oz;
//        if (this.isAutoUpdate) this.updateTransform();
//        return this;
//    };

    p.move = function(px,py,pz) {
        this._string[this._positions[0]] = px - this._ox;
        this._string[this._positions[1]] = py - this._oy;
        if ( arguments.length >= 3 ) this._string[this._positions[2]] = pz - this._oz;
//        this._string[this._positions[0]] += px;
//        this._string[this._positions[1]] += py;
//        if ( arguments.length >= 3 ) this._string[this._positions[2]] += pz;
        if (this.isAutoUpdate) this.updateTransform();

        return this;
    };

    p.rotationX = function(rx) {
        if ( arguments.length ) {
            this._string[this._positions[3]] = rx;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[3]];
        }
    };

    p.rotationY = function(ry) {
        if ( arguments.length ) {
            this._string[this._positions[4]] = ry;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[4]];
        }
    };

    p.rotationZ = function(rz) {
        if ( arguments.length ) {
            this._string[this._positions[5]] = rz;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[5]];
        }
    };

    p.rotation = function(rx,ry,rz) {
        this._string[this._positions[3]] = rx;
        this._string[this._positions[4]] = ry;
        this._string[this._positions[5]] = rz;
        if (this.isAutoUpdate) this.updateTransform();
        return this;
    };


    p.scaleX = function(sx) {
        if ( arguments.length ) {
            this._string[this._positions[6]] = sx;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[6]];
        }
    };

    p.scaleY = function(sy) {
        if ( arguments.length ) {
            this._string[this._positions[7]] = sy;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[7]];
        }
    };

    p.scaleZ = function(sz) {
        if ( arguments.length ) {
            this._string[this._positions[8]] = sz;
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        } else {
            return this._string[this._positions[8]];
        }
    };

    p.scale = function(sx,sy,sz) {
        switch(arguments.length){
            case 0:
                if (this.isAutoUpdate) this.updateTransform();
                return this._string[this._positions[6]];
            case 1:
                this._string[this._positions[6]] = sx;
                this._string[this._positions[7]] = sx;
                this._string[this._positions[8]] = sx;
                if (this.isAutoUpdate) this.updateTransform();
                return this;
            case 2:
                this._string[this._positions[6]] = sx;
                this._string[this._positions[7]] = sy;
                this._string[this._positions[8]] = 1;
                if (this.isAutoUpdate) this.updateTransform();
                return this;
            case 3:
                this._string[this._positions[6]] = sx;
                this._string[this._positions[7]] = sy;
                this._string[this._positions[8]] = sz;
                if (this.isAutoUpdate) this.updateTransform();
                return this;
        }
        return this;
    };

    p.origin = function(ox,oy,oz) {
        // failed attempt at auto-centering the registration point of the object
        if ( typeof(ox) === "string" ) {
            /*
             switch(ox){
             case "center":
             this._string[this._positions[0]] = -this.offsetWidth>>1;
             this._string[this._positions[1]] = -this.offsetHeight>>1;
             debugger
             console.log("centering");
             break;
             }
             */
            var cs = window.getComputedStyle(this,null);
            console.log(cs);
            console.log("w:"+ cs.getPropertyValue("width") + " || h: " + cs.height );
        } else {
            if (arguments.length<3) oz = 0;
            this._string[this._positions[0]] += this._ox - ox;
            this._string[this._positions[1]] += this._oy - oy;
            this._string[this._positions[2]] += this._oz - oz;
            this._ox = ox;
            this._oy = oy;
            this._oz = oz;
            if (this.isAutoUpdate) this.updateTransform();
        }
        return this;
    };

    p.transformOrigin = function(tx,ty) {
        if ( arguments.length ) {
            this._domElement.style[ volcano._browserPrefix + "TransformOrigin" ] = (Number(tx)?tx+"px":tx) + " " + (Number(ty)?ty+"px":ty);
            if (this.isAutoUpdate) this.updateTransform();
            return this;
        }else{
            return this._domElement.style[ volcano._browserPrefix + "TransformOrigin" ];
        }
    };

    p.transformString = function(s) {
        var parts = s.toLowerCase().split(" "),
            numParts = parts.length,
            i = 0,
            strings = [],
            positions = [ 0,0,0, 0,0,0, 0,0,0 ],
            n = 0;

        for(i;i<numParts;i++){
            switch( parts[i] ){
                case "p":
                case "position":
                case "translate":
                    // todo: use rx ry rz (regPoint) when re-defining transform order
                    n = strings.push( "translate3d(", this._string[this._positions[0]], "px,", this._string[this._positions[1]], "px,", this._string[this._positions[2]], "px) " );
                    positions[0] = n-6;
                    positions[1] = n-4;
                    positions[2] = n-2;
                    break;
                case "rx":
                case "rotatex":
                case "rotationx":
                    n = strings.push( "rotateX(", this._string[this._positions[3]], "deg) " );
                    positions[3] = n-2;
                    break;
                case "ry" :
                case "rotatey":
                case "rotationy":
                    n = strings.push( "rotateY(", this._string[this._positions[4]], "deg) " );
                    positions[4] = n-2;
                    break;
                case "rz":
                case "rotatez":
                case "rotationz":
                    n = strings.push( "rotateZ(", this._string[this._positions[5]], "deg) " );
                    positions[5] = n-2;
                    break;
                case "s":
                case "scale":
                    n = strings.push( "scale3d(", this._string[this._positions[6]], ",", this._string[this._positions[7]], ",", this._string[this._positions[8]], ") " );
                    positions[6] = n-6;
                    positions[7] = n-4;
                    positions[8] = n-2;
                    break;
            }
        }

        this._string = strings;
        this._positions = positions;

        if (this.isAutoUpdate) this.updateTransform();
        return this;
    };

    p.perspective = function(value) {
        if (arguments.length) {
            if (this.isAutoUpdate) this.updateTransform();
            this._domElement.style[volcano._browserPrefix + "Perspective"] = (typeof(value)==="string")?value:value+"px";
            return this;
        } else {
            return this._domElement.style[volcano._browserPrefix + "Perspective"];
        }
    };

    p.getStyle = function(name) {
        return this._domElement.style[name];
    };

    p.setStyle = function(name, value, prefix) {
        this._domElement.style[name] = value;
        if (arguments.length > 2) this._domElement.style[volcano._browserPrefix + name] = value;
        return this
    };

    p._styleName = "";
    p.styleName = function(value) {
        if (arguments.length){
            this._styleName = value;
            this._domElement.className = value;
            return this;
        }else{
            if (this._styleName !== "") return this._styleName;
            return this._domElement.className;
        }
    };

    p.html = function(value) {
        if (arguments.length){
            this.innerHTML = value;
            return this;
        }else{
            return this.innerHTML;
        }
    };

    /**
     * 3d transform
     * @return {*}
     */
    p.updateTransform = function() {
        var s = "";
        var cnt = 0;
//        console.log("this._string[0] : " , this._string[0]);
//        console.log("this._string[1] : " , this._string[1]);
//        console.log("this._string[2] : " , this._string[2]);
//        console.log("this._string[3] : " , this._string[3]);
//        console.log("this._string[4] : " , this._string[4]);
//        console.log("this._string[5] : " , this._string[5]);
//        console.log("this._string[6] : " , this._string[6]);
//        console.log("this._string[7] : " , this._string[7]);
//        console.log("this._string[8] : " , this._string[8]);
//        console.log("this._string[9] : " , this._string[9]);
//        console.log("this._string[10] : ", this._string[10]);
//        console.log("this._string[11] : ", this._string[11]);
//        console.log("this._string[12]: " , this._string[12]);
//        console.log("this._string[13] : ", this._string[13]);
//        console.log("this._string[14]: " , this._string[14]);
//        console.log("this._string[15]: " , this._string[15]);
//        console.log("this._string[16]: " , this._string[16]);
//        console.log("this._string[17]: " , this._string[17]);
//        console.log("this._string[18]: " , this._string[18]);
//        console.log("this._string[19]: " , this._string[19]);
//        console.log("this._string[20]: " , this._string[20]);
//        console.log("this._string[21]: " , this._string[21]);
//        console.log("this._string[22]: " , this._string[22]);
        _.all(this._string, function(value){
            if(volcano.has3d == true){
                s += value;
            }else{
                if(value === "translate3d("){
                    s += "translate(";
                }
                else if(volcano._browserPrefix == "ms"){
                    if(cnt == 4){
                        s += "px)"  // translate 값 y좌표 px 닫는 문구
                    }else if(cnt < 4){
                        s += value;
                    }else{
                        // 필요없는 속성 제거
                    }
                }else if(volcano._browserPrefix == "O"){
                    if(cnt == 4){
                        s += "px)"  // translate 값 y좌표 px 닫는 문구
                    }else if(cnt < 4){
                        s += value;
                    }else{
                        // 필요없는 속성 제거
                    }
                }else{
                    if(cnt == 5 || cnt == 6 || cnt == 13 || cnt == 14 || cnt == 15 || cnt == 20 || cnt == 21){
                        // 필요없는 속성을 제거한다.
                    }else{
                        if(cnt == 4){
                            s += "px)"  // translate 값 y좌표 px 닫는 문구
                        }else if(cnt == 16){
                            s += "scale(";
                        }else{
                            s += value;
                        }
                    }
                }
            }
            cnt++;
            return true;
        });
        this._domElement.style[volcano._transformProperty] = s;
        return this;
    };

    p._name = "";
    p.name = function(name) {
        if (arguments.length){
            this._name = name;
            return this;
        }else{
            return this._name;
        }
    };

    p._id = "";
    p.id = function(id) {
        if (arguments.length) {
            this._id = id;
            this._domElement.id = id;
            return this;
        }else{
            return this._id;
        }
    };

    p.alpha = function(v){
        if (arguments.length) {
            this._alpha = v;
            this._domElement.style.opacity = v;
            return this;
        }else{
            return this._alpha;
        }
    };

    p._visible = false;
    p.visible = function(v) {
        if (arguments.length) {
            var vstr;
            this._visible = v;
            (v === true) ? vstr = "visible" : vstr = "hidden"
            this._domElement.style.visibility = vstr;
            return this;
        }else{
            return this._visible;
        }
    };

    /**
     * 클레스 네임 추가
     * type Array
     * @return {*}
     */
    p.addClass = function(){
        var className = arguments;
        var len = className.length;
        for(var i = 0 ; i < len ; i++){
            if (!this.hasClass(className[i])) {
                this._domElement.className = this._domElement.className ? this._domElement.className + ' ' + className[i] : className[i];
            }
        }
        return this;
    };

    /**
     * 클레스 네임 삭제
     * type Array
     * @return {*}
     */
    p.removeClass = function(){
        var className = arguments;
        var len = className.length;
        for(var i = 0 ; i < len ; i++){
            if(this.hasClass(className[i])){
                this._domElement.className = this._domElement.className.replace(new RegExp('(^|\\s+)' + className[i] + '(\\s+|$)'), ' ');
            }
        }
        return this;
    };

    p.hasClass = function(className){
        return (" " + this._domElement.className + " ").replace(/[\n\t]/g, " ").indexOf(" " + className + " ") > -1;
    };


    window.volcano.VObject = VObject;

})(window);
/*
 * VSprite
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
(function (window) {

    /**
     * Sprite의 간단한 기능들을 가지고 있는 추상 클래스
     * DOM Event 처리와, 차일드 관리 기능을 포함하고 있다.
     * @class VSprite
     * @constructor
     * @author david yun
     **/
    var VSprite = function (element, options) {
        this.initialize(element, options);
    };

    var p = VSprite.prototype = new volcano.VObject();
    /**
     * 실제 화면에 display 될 래퍼 Div
     * @type {*}
     * @private
     */
    p._domElement = null;
    /**
     * 요소의 객체를 담아 두는 저장 공간
     * @type {Array}
     * @private
     */
    p._elementsContent = null;
    p.eventCallback = null;
    /**
     * parent 정보
     * @property parent
     * @final
     * @type VSprite
     * @default null
     */
    p.parent = null;

    p._alpha = 1.0;

    // transform 스타일 속성을 넣기 위한 스키마 배열
    p._string = [];

    // transform 스타일 속성을 넣는 값이 있는 위치의 배열
    p._positions = [];

    // transform 스타일 속성을 setter 호출시에 즉시 업데이트 할지의 여부
    p.isAutoUpdate = true;

    // OriginX 값
    p._ox = 0;

    // OriginY 값
    p._oy = 0;

    // OriginZ 값
    p._oz = 0;

    p.VObject_initialize = p.initialize;
    p.initialize = function (element, options) {
        // 변수 초기화
        this._domElement = {};
        this._elementsContent = [];
        this.parent = {};

        this.VObject_initialize(element, options); //call super
    };

    /**
     * Displaylist 의 범위계산 에러체크
     * @param {Number} index
     * @param {Boolean} isAddingElement
     * @private
     */
    p._checkRangeError = function (index, isAddingElement) {
        var maxIndex = this._elementsContent.length - 1;
        if (isAddingElement) {
            maxIndex++;
        }
        if (index < 0 || index > maxIndex) {
            throw "Elements Range Error";
        }
    };

    /**
     * addElement의 후처리 로직으로 Wrapper Div의 DOM 요소 추가를 한다.
     * @param {Object} element
     * @param {Number} index
     * @param {Boolean} notifyListeners
     * @private
     */
    p._elementAdded = function (element, index, notifyListeners) {
        element.parent = this;
        var host = this._domElement,
            elementDiv = element._domElement;

        // fixme 향후 Canvas 가 아닌 다른 Element 가 올 수 있으므로, 그 때 수정해야 함.
        var canvasNum = 0;
        if(host.children.length > 0) canvasNum = host.children[0].localName === "canvas" ? 1 : 0;

        if ((host.children.length - canvasNum) === index) {
            host.appendChild(elementDiv);
        } else {
            console.log(this.getElementAt(index)._domElement);
            host.insertBefore(elementDiv, this.getElementAt(index)._domElement);
        }

        if (notifyListeners) {
            this.dispatchEvent("elementAdded");
        }
    };
    /**
     * removeElement의 후처리 로직으로 Wrapper Div의 DOM 요소 제거를 한다.
     * @param {Object} element
     * @param {Number} index
     * @param {Boolean} notifyListeners
     * @private
     */
    p._elementRemoved = function (element, index, notifyListeners) {
        element.parent = null;
        this._domElement.removeChild(element._domElement);

        if (notifyListeners) {
            this.dispatchEvent("elementRemoved");
        }
    };

    /**
     * DisplayList의 전체 요소 갯수
     * @return {Number}
     */
    p.getNumElements = function () {
        return this._elementsContent.length;
    };

    /**
     * 해당 인덱스의 요소 반환
     * @param {Number} index
     * @return {*}
     */
    p.getElementAt = function (index) {
        this._checkRangeError(index, false);
        return this._elementsContent[index];
    };

    /**
     * DisplayList에 차일드 요소 추가
     * @param {Object} element
     * @return {*}
     */
    p.addElement = function (element) {
        var index = this.getNumElements();

        if (element.parent === this) {
            index = this.getNumElements() - 1;
        }
        return this.addElementAt(element, index);
    };
    /**
     * DisplayList의 원하는 인덱스에 차일드 요소 추가
     * @param {Object} element
     * @param {Number} index
     * @return {*}
     */
    p.addElementAt = function (element, index) {
        if (element === this) {
            throw "Cannot add yourself as your Child";
        }
        this._checkRangeError(index, true);

        var host = element.parent;
        if (host === this) {
            this.setElementIndex(element, index);
            return element;
        } else if (host instanceof VSprite){
            host.removeElement(element);
        }

        this._elementsContent.splice(index, 0, element);

        this._elementAdded(element, index);

        return element;
    };
    /**
     * 해당 요소를 DisplayList에서 제거
     * @param {Object} element
     * @return {*}
     */
    p.removeElement = function (element) {
        return this.removeElementAt(this.getElementIndex(element));
    };
    /**
     * DisplayList에서 해당 인덱스의 요소 제거
     * @param {Number} index
     */
    p.removeElementAt = function (index) {
        this._checkRangeError(index);

        var element = this._elementsContent[index];
        this._elementRemoved(element, index);
        this._elementsContent.splice(index, 1);
    };
    /**
     * DisplayList의 모든 요소를 제거
     */
    p.removeAllElements = function () {
        // DisplayList는 역순제거를 해야한다.
        for (var i = this.getNumElements() - 1; i >= 0; i--) {
            this.removeElementAt(i);
        }
    };
    /**
     * DisplayList에서 해당 요소의 인덱스를 반환
     * @param {Object} element
     * @return {*}
     */
    p.getElementIndex = function (element) {
        return _.indexOf(this._elementsContent, element);
        //TODO Element 발견 못할 시에 에러처리 할지 말지 결정.
//        var index = _.indexOf(this._elementsContent, element);
//        if (index === -1) {
//            throw "element not found in this DisplayList";
//        } else {
//            return index;
//        }
    };
    /**
     * 해당 요소의 인덱스를 변경한다.
     * @param {Object} element
     * @param {Number} index
     */
    p.setElementIndex = function (element, index) {
        this._checkRangeError(index);

        if (this.getElementIndex(element) === index) {
            return;
        }

        this.removeElement(element);
        this.addElementAt(element, index);
    };

    window.volcano.VSprite = VSprite;

})(window);
/*
 * SystemManager
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
(function (window) {
    /**
     * Volcano의 전체 System Start Point
     *
     * @class SystemManager
     * @extends VSprite
     * @author david yun
     **/
    var SystemManager = function (parent) {
        this.initialize(parent);
    };

    var p = SystemManager.prototype = new volcano.VSprite();
    p.VSprite_initialize = p.initialize;

    p.instance = null;
    p._nestLevel = 0;
    p._body = null;
    p._onEnterFrameItems = null;

    p.initialize = function (parent) {
        // 변수 초기화
        this.instance = {};
        this._body = {};
        this._onEnterFrameItems = [];

        this.VSprite_initialize("#systemManager");

        createjs.Ticker.setFPS(this._fps);
        createjs.Ticker.addListener(this);

        this._body = (_.isObject(parent)) ? parent : document.body;

        var pst = this._body.style;
        this.setSize(pst.width, pst.height);
//        this.width(_.isNumber(parent.style.width) ? parent.style.width : window.innerWidth ).height(_.isNumber(parent.style.height) ? parent.style.height : window.innerHeight);

        this._body.appendChild(this._domElement);
        this._domElement.style.overflow = "hidden";

        this._domElement.style[volcano._browserPrefix+"TransformOrigin"] = "0 0";
//        this._domElement.style.top = "50%";
//        this._domElement.style.left = "50%";
        if(volcano.has3d){
            this._domElement.style[volcano._browserPrefix+"Perspective"] = "800px";
            this._domElement.style[volcano._browserPrefix+"PerspectiveOrigin"] = "0 0";
            this._domElement.style[volcano._browserPrefix+"TransformStyle"] = "flat";
        }
        this._nestLevel = 1; // systemManager는 언제나 nestLevel 1

        volcano.LayoutManager.systemManager = this;

        var that = this.instance = this;
        var resizeHandler = function () {
            that.setSize(pst.width, pst.height);
            that.dispatchEvent("resize");
        };

        window.addEventListener("resize", resizeHandler);
    };

    p.setSize = function(w,h) {
        this.width(_.isNumber(w) ? w : window.innerWidth).height(_.isNumber(h) ? h : window.innerHeight);
        return this;
    }

    p.nestLevel = function(value){
        if(arguments.length){

        }else{
            return this._nestLevel;
        }
    }

    p._fps = 24;
    p.frameRate = function(fps){
        if(arguments.length){
            this._fps = fps;
            createjs.Ticker.setFPS(fps);
            return this;
        }else{
            return this._fps;
        }
    }

    p.VSprite__elementAdded = p._elementAdded;
    p._elementAdded = function (element, index, notifyListeners) {
        this.VSprite__elementAdded(element, index, notifyListeners); //super

        if (element.nestLevel)
            element.nestLevel(this.nestLevel() + 1); // nest level 추가
        //todo 스타일 캐시 재생성 element.regenerateStyleCache(true);
        //todo 스타일 변경 알림  element.styleChanged(null);
        //todo 차일드에게 스타일 변경 알림 element.notifyStyleChangeInChildren(null, true);
        //todo 테마 컬러 초기화 element.initThemeColor();
        //todo 스타일 초기화 element.stylesInitialized();
        if (element.getInitialized && element.getInitialized()) {
            element.initComponent();
        }
    };

    p.enterFrameEventMode = false;

    /**
     * 엔터프레임 이벤트를 구현한 이벤트 루프 핸들러이며 Override 하면 안됩니다.
     * @private
     */
    p.tick = function () {
        var len = this._onEnterFrameItems.length;
        if (this.enterFrameEventMode) {
            this.dispatchEvent("enterFrame");
        }

        for (var i = 0; i < len; i++) {
            if (_.isFunction(this._onEnterFrameItems[i])) {
                this._onEnterFrameItems[i]();
            }
        }
    };

    /**
     * 엔터프레임 이벤트 핸들러를 추가
     * @param callback 이벤트 마다 실행할 콜백
     * @param isFirst 첫번째 위치로 추가
     * @return {*}
     */
    p.addEnterFrameListener = function (callback, isFirst) {
        var index = _.indexOf(this._onEnterFrameItems, callback);
        if (index !== -1) {
            return this;
        }

        (isFirst) ? isFirst = true : isFirst = false;
        if (isFirst) {
            this._onEnterFrameItems.unshift(callback);
        } else {
            this._onEnterFrameItems.push(callback);
        }
        return this;
    };

    /**
     * 엔터프레임 이벤트에 콜백 핸들러 제거
     * @param callback
     * @return {*}
     */
    p.removeEnterFrameListener = function (callback) {
        var index = _.indexOf(this._onEnterFrameItems, callback);
        this._onEnterFrameItems.splice(index, 1);
        return this;
    };

    window.volcano.SystemManager = SystemManager;

})(window);/*
 * LayoutManager
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
    * Volcano의 레이아웃 관리 정책에 따른 레이아웃 생명주기 관리자 클래스이다.
    * Flex의 생명주기와 동일하게 가져가기 위해서 interface를 동일하게 구성했다.
    *
    * @class LayoutManager
    * @author david yun
    **/
    var LayoutManager = function() {
        throw "LayoutManager cannot be initialized.";
    };

    /**
     * PriorityQueue Class Function
     * @constructor
     */
    var PriorityQueue = function(){
        this._priorityBins = [];
        var minPriority = 0;
        var maxPriority = -1;

        this.addObject = function(obj, priority){
            if(maxPriority < minPriority){
                minPriority = maxPriority = priority;
            }else{
                if(priority < minPriority){
                    minPriority = priority;
                }
                if(priority > maxPriority){
                    maxPriority = priority;
                }
            }

            var bin = this._priorityBins[priority];

            if(!bin){
                bin = new PriorityBin();
                this._priorityBins[priority] = bin;
                bin.items.push(obj);
                bin.length++;
            }else{
                if(_.indexOf(bin.items,obj) !== 1){
                    bin.items.push(obj);
                    bin.length++;
                }
            }

        };

        this.removeLargest = function(){
            var obj = null;

            if(minPriority <= maxPriority){
                var bin = this._priorityBins[maxPriority];
                while(!bin || bin.length === 0){
                    maxPriority--;
                    if(maxPriority < minPriority){
                        return null;
                    }
                    bin = this._priorityBins[maxPriority];
                }

                for(var i = 0 ; i < bin.items.length ; i++){
                    obj = bin.items[i];
                    this.removeChild(bin.items[i], maxPriority);
                    break;
                }

                while(!bin || bin.length === 0){
                    maxPriority--;
                    if(maxPriority < minPriority){
                        break;
                    }
                    bin = this._priorityBins[maxPriority];
                }
            }
            return obj;
        };

        this.removeLargestChild = function(client){
            var max = maxPriority;
            var min = client.nestLevel();

            while(min <= max){
                var bin = this._priorityBins[max];
                if(bin && bin.length > 0){
                    if(max === client.nestLevel()){
                        for(var i = 0 ; i < bin.items.length ; i++){
                            if(client === bin.items[i]){
                                this.removeChild(bin.items[i], max);
                                return client;
                            }
                        }
                    }else{
                        for(var i = 0 ; i < bin.items.length ; i++){
                            if((bin.items[i] instanceof volcano.UIComponent) && contains(client, bin.items[i])){
                                this.removeChild(bin.items[i], max);
                                return bin.items[i];
                            }
                        }
                    }

                    max--;
                }else{
                    if(max === maxPriority){
                        maxPriority--;
                    }
                    max--;
                    if(max < min){
                        break;
                    }
                }
            }
            return null;
        };

        this.removeSmallest = function(){
            var obj = null;

            if(minPriority <= maxPriority){
                var bin = this._priorityBins[minPriority];
                while(!bin || bin.length === 0){
                    minPriority++;
                    if(minPriority > maxPriority){
                        return null;
                    }
                    bin = this._priorityBins[minPriority];
                }
                for(var i = 0 ; i < bin.items.length ; i++){
                    obj = bin.items[i];
                    this.removeChild(bin.items[i], minPriority);
                    break;
                }

                while(!bin || bin.length === 0){
                    minPriority++;
                    if(minPriority > maxPriority){
                        break;
                    }
                    bin = this._priorityBins[minPriority];
                }
            }
            return obj;
        };

        this.removeSmallestChild = function(client){
            var min = client.nestLevel();

            while(min <= maxPriority){
                var bin = this._priorityBins[min];
                if(bin && bin.length > 0){
                    if(min === client.nestLevel()){
                        for(var i = 0 ; i < bin.items.length ; i++){
                            if(client === bin.items[i]){
                                this.removeChild(client, min);
                            }
                        }
                    }else{
                        for(var key in bin.items){
                            for(var i = 0 ; i < bin.items.length ; i++){
                                if((bin.items[i] instanceof volcano.UIComponent) && contains(client, bin.items[i])){
                                    this.removeChild(bin.items[i], min);
                                    return bin.items[i];
                                }
                            }
                        }
                    }
                    min++;
                }else{
                    if(min === minPriority){
                        minPriority++;
                    }
                    min++;

                    if(min > maxPriority){
                        break;
                    }
                }
            }
            return null;
        };

        this.removeChild = function(client, level){
            var pri = (level >= 0) ? level : client.nestLevel();
            var bin = this._priorityBins[pri];
            for(var i = 0 ; i < bin.items.length ; i++){
                if(bin.items[i] === client){
                    bin.items.splice(i, 1);
                    bin.length--;
                    return client;
                }
            }
            return null;
        };

        this.removeAll = function(){
            this._priorityBins.length = 0;
            minPriority = 0;
            maxPriority = -1;
        };

        this.isEmpty = function(){
            return minPriority > maxPriority;
        };

        var contains = function(parent, child){
            // todo 타입 비교 조건 분기 문. cotnainer는 추후 제작
            return parent === child;
        };

        /**
         * PriorityBin
         * @constructor
         */
        var PriorityBin = function(){
            this.length = 0;
            this.items = [];
        }
    };

    LayoutManager.systemManager = null;  // systemManager를 생성하면 여기에 자동으로 잡힌다.

    LayoutManager._updateCompleteQueue = new PriorityQueue();
    LayoutManager._invalidatePropertiesQueue = new PriorityQueue();
    LayoutManager._invalidatePropertiesFlag = false;
    LayoutManager._invalidateClientPropertiesFlag = false;
    LayoutManager._invalidateSizeQueue = new PriorityQueue();
    LayoutManager._invalidateSizeFlag = false;
    LayoutManager._invalidateClientSizeFlag = false;
    LayoutManager._invalidateDisplayListQueue = new PriorityQueue();
    LayoutManager._invalidateDisplayListFlag = false;
    LayoutManager._waitAFrame = false;
    LayoutManager._listenersAttached = false;
    LayoutManager._originalFrameRate = NaN;
    LayoutManager._targetLevel = Number.MAX_VALUE; //2147483647
    LayoutManager._currentObject = {};
    LayoutManager._usePhasedInstantiation = false;

    LayoutManager.usePhasedInstantiation = function(value){
        if(arguments.length){
            if(LayoutManager._usePhasedInstantiation !== value){
                LayoutManager._usePhasedInstantiation = value;
            }
        }else{
            return LayoutManager._usePhasedInstantiation;
        }
    };


    LayoutManager.invalidateProperties = function (obj) {
        if(!LayoutManager._invalidatePropertiesFlag){
            LayoutManager._invalidatePropertiesFlag = true;
            if(!LayoutManager._listenersAttached){
                LayoutManager.attachListeners(LayoutManager.systemManager);
            }
        }
        if(LayoutManager._targetLevel <= obj.nestLevel()){
            LayoutManager._invalidateClientPropertiesFlag = true;
        }
        LayoutManager._invalidatePropertiesQueue.addObject(obj, obj.nestLevel());

    };

    LayoutManager.invalidateSize = function (obj) {
        if(!LayoutManager._invalidateSizeFlag){
            LayoutManager._invalidateSizeFlag = true;
            if(!LayoutManager._listenersAttached){
                LayoutManager.attachListeners(LayoutManager.systemManager);
            }
        }

        if(LayoutManager._targetLevel <= obj.nestLevel()){
            LayoutManager._invalidateClientSizeFlag = true;
        }
        LayoutManager._invalidateSizeQueue.addObject(obj, obj.nestLevel());
    };

    LayoutManager.invalidateDisplayList = function (obj) {
        if(!LayoutManager._invalidateDisplayListFlag){
            LayoutManager._invalidateDisplayListFlag = true;

            if(!LayoutManager._listenersAttached){
                LayoutManager.attachListeners(LayoutManager.systemManager);
            }
        }
        LayoutManager._invalidateDisplayListQueue.addObject(obj, obj.nestLevel());
    };

    LayoutManager._validateProperties = function() {
        var obj = LayoutManager._invalidatePropertiesQueue.removeSmallest();
        while(obj){
            if(obj.nestLevel()){
                LayoutManager._currentObject = obj;
                obj.validateProperties();
                if(!obj.updateCompletePendingFlag()){
                    LayoutManager._updateCompleteQueue.addObject(obj, obj.nestLevel());
                    obj.updateCompletePendingFlag(true);
                }
            }
            obj = LayoutManager._invalidatePropertiesQueue.removeSmallest();
        }

        if(LayoutManager._invalidatePropertiesQueue.isEmpty()){
            LayoutManager._invalidatePropertiesFlag = false;
        }
    };

    LayoutManager._validateSize = function() {
        var obj = LayoutManager._invalidateSizeQueue.removeLargest();
        while(obj){
            if(obj.nestLevel()){
                LayoutManager._currentObject = obj;
                obj.validateSize();
                if(!obj.updateCompletePendingFlag()){
                    LayoutManager._updateCompleteQueue.addObject(obj, obj.nestLevel());
                    obj.updateCompletePendingFlag(true);
                }
            }

            obj = LayoutManager._invalidateSizeQueue.removeLargest();
        }

        if(LayoutManager._invalidateSizeQueue.isEmpty()){
            LayoutManager._invalidateSizeFlag = false;
        }
    };

    LayoutManager._validateDisplayList = function() {
        obj = LayoutManager._invalidateDisplayListQueue.removeSmallest();
        while(obj){
            if(obj.nestLevel()){
                LayoutManager._currentObject = obj;
                obj.validateDisplayList();
                if(!obj.updateCompletePendingFlag()){
                    LayoutManager._updateCompleteQueue.addObject(obj, obj.nestLevel());
                    obj.updateCompletePendingFlag(true);
                }
            }

            obj = LayoutManager._invalidateDisplayListQueue.removeSmallest();
        }

        if(LayoutManager._invalidateDisplayListQueue.isEmpty()){
            LayoutManager._invalidateDisplayListFlag = false;
        }
    };

    LayoutManager._doPhasedInstantiation = function() {
        if(LayoutManager.usePhasedInstantiation()){
            if(LayoutManager._invalidatePropertiesFlag){
                LayoutManager._validateProperties();
                //XXX Flex API -> The Preloader listens for this event.
            }else if(LayoutManager._invalidateSizeFlag){
                LayoutManager._validateSize();
                //XXX Flex API -> The Preloader listens for this event.
            }else if(LayoutManager._invalidateDisplayListFlag){
                LayoutManager._validateDisplayList();
                //XXX Flex API -> The Preloader listens for this event.
            }
        }else{
            if(LayoutManager._invalidatePropertiesFlag){
                LayoutManager._validateProperties();
            }
            if(LayoutManager._invalidateSizeFlag){
                LayoutManager._validateSize();
            }
            if(LayoutManager._invalidateDisplayListFlag){
                LayoutManager._validateDisplayList();
            }
        }

        if(LayoutManager._invalidatePropertiesFlag || LayoutManager._invalidateSizeFlag || LayoutManager._invalidateDisplayListFlag){
            LayoutManager.attachListeners(LayoutManager.systemManager);
        }else{
            LayoutManager.usePhasedInstantiation(false);
            LayoutManager._listenersAttached = false;

            var obj = LayoutManager._updateCompleteQueue.removeLargest();
            while(obj){
                if(!obj.initialized() && obj.processedDescriptors()){
                    obj.initialized(true);
                }
                obj.dispatchEvent("updateComplete");
                obj.updateCompletePendingFlag(false);
                obj = LayoutManager._updateCompleteQueue.removeLargest();
            }
            //TODO effect Handler를 위한 updateComplete Event Dispatch host = LayoutManager

        }
    };

    LayoutManager._doPhasedInstantiationCallback = function(event) {
        if(volcano.UIComponent._callLaterDispatcherCount > 0){
            return;
        }

        LayoutManager.systemManager.removeEnterFrameListener(LayoutManager._doPhasedInstantiationCallback);

        if(!volcano.UIComponent._catchCallLaterExceptions){
            LayoutManager._doPhasedInstantiation();
        }else{
            try{
                LayoutManager._doPhasedInstantiation();
            }catch(e){
                throw "callLaterError LayoutManager";
            }
        }

        LayoutManager._currentObject = null;
    };

    LayoutManager.validateNow = function () {
        if(!LayoutManager.usePhasedInstantiation()){
            var infiniteLoopGuard = 0;
            while(LayoutManager._listenersAttached && infiniteLoopGuard++ < 100){
                LayoutManager._doPhasedInstantiation();
            }
        }
    };

    LayoutManager.validateClient = function (target, skipDisplayList) {
        var lastCurrentObject = LayoutManager._currentObject;
        var obj;
        var i = 0;
        var done = false;
        var oldTargetLevel = LayoutManager._targetLevel;

        if(LayoutManager._targetLevel === Number.MAX_VALUE){
            LayoutManager._targetLevel = target.nestLevel();
        }

        while(!done){
            done = true;

            obj = LayoutManager._invalidatePropertiesQueue.removeSmallestChild(target);
            while(obj){
                if(obj.nestLevel()){
                    LayoutManager._currentObject = obj;
                    obj.validateProperties();
                    if(!obj.updateCompletePendingFlag()){
                        LayoutManager._updateCompleteQueue.addObject(obj, obj.nestLevel());
                        obj.updateCompletePendingFlag(true);
                    }
                }

                obj = LayoutManager._invalidatePropertiesQueue.removeSmallestChild(target);
            }

            if(LayoutManager._invalidatePropertiesQueue.isEmpty()){
                LayoutManager._invalidatePropertiesFlag = false;
                LayoutManager._invalidateClientPropertiesFlag = false;
            }

            obj = LayoutManager._invalidateSizeQueue.removeLargestChild(target);

            while(obj){
                if(obj.nestLevel()){
                    LayoutManager._currentObject = obj;
                    obj.validateSize();
                    if(!obj.updateCompletePendingFlag()){
                        LayoutManager._updateCompleteQueue.addObject(obj, obj.nestLevel());
                        obj.updateCompletePendingFlag(true)
                    }
                }

                if(LayoutManager._invalidateClientPropertiesFlag){
                    obj = LayoutManager._invalidatePropertiesQueue.removeSmallestChild(target);
                    if(obj){
                        LayoutManager._invalidatePropertiesQueue.addObject(obj, obj.nestLevel());
                        done = false;
                        break;
                    }
                }

                obj = LayoutManager._invalidateSizeQueue.removeLargestChild(target);
            }

            if(LayoutManager._invalidateSizeQueue.isEmpty()){
                LayoutManager._invalidateSizeFlag = false;
                LayoutManager._invalidateClientSizeFlag = false;
            }

            if(!skipDisplayList){
                obj = LayoutManager._invalidateDisplayListQueue.removeSmallestChild(target);
                while(obj){
                    if(obj.nestLevel()){
                        LayoutManager._currentObject = obj;
                        obj.validateDisplayList();
                        if(!obj.updateCompletePendingFlag()){
                            LayoutManager._updateCompleteQueue.addObject(obj, obj.nestLevel());
                            obj.updateCompletePendingFlag(true);
                        }
                    }

                    if(LayoutManager._invalidateClientPropertiesFlag){
                        obj = LayoutManager._invalidatePropertiesQueue.removeSmallestChild(target);
                        if(obj){
                            LayoutManager._invalidatePropertiesQueue.addObject(obj, obj.nestLevel());
                            done = false;
                            break;
                        }
                    }

                    if(LayoutManager._invalidateClientSizeFlag){
                        obj = LayoutManager._invalidateSizeQueue.removeLargestChild(target);
                        if(obj){
                            LayoutManager._invalidateSizeQueue.addObject(obj, obj.nestLevel());
                            done = false;
                            break;
                        }
                    }

                    obj = LayoutManager._invalidateDisplayListQueue.removeSmallestChild(target);
                }

                if(LayoutManager._invalidateDisplayListQueue.isEmpty()){
                    LayoutManager._invalidateDisplayListFlag = false;
                }
            }
        }

        if(oldTargetLevel === Number.MAX_VALUE){
            LayoutManager._targetLevel = Number.MAX_VALUE;
            if(!skipDisplayList){
                obj = LayoutManager._updateCompleteQueue.removeLargestChild(target);
                while(obj){
                    if(!obj.initialized()){
                        obj.initialized(true);
                    }

                    // XXX obj의 hasEventListener이 있어야 한다.

                    obj.updateCompletePendingFlag(false);
                    obj = LayoutManager._updateCompleteQueue.removeLargestChild(target);
                }
            }
        }

        LayoutManager._currentObject = lastCurrentObject;
    };

    LayoutManager._waitFrame = function(){
        LayoutManager.systemManager.removeEnterFrameListener(LayoutManager._waitFrame);
        LayoutManager.systemManager.addEnterFrameListener(LayoutManager._doPhasedInstantiationCallback);
        LayoutManager._waitAFrame = true;
    };

    LayoutManager.attachListeners = function (systemManager) {
        if(!LayoutManager._waitAFrame){
            systemManager.addEnterFrameListener(LayoutManager._waitFrame);
        }else{
            systemManager.addEnterFrameListener(LayoutManager._doPhasedInstantiationCallback);
        }
        LayoutManager._listenersAttached = true;
    };

    window.volcano.LayoutManager = LayoutManager;

})(window);
/*
 * UIComponent
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
    * UIComponent 는 표현의 기초가 되는 컴포넌트 이며 객체 생명주기를 제공한다.
    * 생명주기는 Flex의 생명주기와 동일하게 제공하고 있으며 invalidate,validate 방식의 디스플레이 리스트 모델을 따른다.
    * @class UIComponent
    * @constructor
    * @author david yun
    **/
    var UIComponent = function() {
      this.initialize();
    };

    var p = UIComponent.prototype = new volcano.VSprite();

    var MethodQueElement = function(method, args) {
        this.method = method;
        this.args = args;
    };

    UIComponent._callLaterDispatcherCount = 0;
    UIComponent._catchCallLaterExceptions = false;
    p._methodQueue = null;
    p.systemManager = null;
    p._skin = null; //todo skin architecture 완성되면 코드삽입
    p.states = null; //todo state mechanism 완성되면 코드삽입
    p._deferredSetStyles = null;
    p._owner = null;
    p._updateCompletePendingFlag = false;
    p._processedDescriptiors = false;
    /**
     * 실제 화면에 display 될 래퍼 Div
     * @type {*}
     * @private
     */
    p._domElement = null;
    p.VSprite_initialize = p.initialize;

    p.initialize = function(element) {
        // 변수 초기화 (primitive 이외의 타입은 반드시 초기화 해야함)
        this._methodQueue = [];
        this.systemManager = volcano.LayoutManager.systemManager;
        this._skin = {}; //todo skin architecture 완성되면 코드삽입
        this.states = []; //todo state mechanism 완성되면 코드삽입
        this._deferredSetStyles = {};
        this._owner = {};
        this._domElement = {};

        this.VSprite_initialize(element); //super
    };

    p.owner = function(value){
      if(arguments.length){
          this._owner = value;
          return this;
      }else{
          return this._owner ? this._owner : this.parent;
      }
    };

    p._nestLevel = 0;
    /**
     * getter
   	 * 중첩레벨을 깊이(depth)를 정의하는 속성 게터이며, 레이아웃 코드에서 사용된다.
     * 만약 값이 0이라면 DisplayList에 포함되지 않은 것이다.
   	 * @method nestLevel
   	 **/
    /**
     * setter
     * 중첩레벨을 깊이(depth)를 정의하는 속성 게터세터이며, 레이아웃 코드에서 사용된다.
     * 만약 값이 0이라면 DisplayList에 포함되지 않은 것이다. SystemManager는 1, Appplication은 2 이다.
     * @method nestLevel
     * @param value
     **/
    p.nestLevel = function(value){
        if(arguments.length){
            if (value === 1) {
                return;
            }

            if (value > 1 && this._nestLevel !== value) {
                this._nestLevel = value;
                this._updateCallbacks();
                value++;
            } else if (value === 0) {
                this._nestLevel = value = 0;
            } else {
                value++;
            }

            var n = this.getNumElements();
            for (var i = 0; i<n; i++) {
                var ui = this.getElementAt(i);
                if (ui) {
                    ui.nestLevel(value);
                }
            }
        }else{
            return this._nestLevel;
        }
    };

    p.processedDescriptors = function(value){
        if(arguments.length){
            this._processedDescriptors = value;
        }else{
            return this._processedDescriptors;
        }
    }

    p._updateCallbacks = function() {
        if (this._invalidateDisplayListFlag) {
            volcano.LayoutManager.invalidateDisplayList(this);
        }

        if (this._invalidateSizeFlag) {
            volcano.LayoutManager.invalidateSize(this);
        }

        if (this._invalidatePropertiesFlag) {
            volcano.LayoutManager.invalidateProperties(this);
        }


        if (this.systemManager) {
            if (this._methodQueue.length > 0 && !this._listeningForRender) {
                this.systemManager.addEnterFrameListener(this._callLaterDispatcher);
                this._listeningForRender = true;
            }
        }
    };

    p.validateNow = function(){
        volcano.LayoutManager.validateClient(this);
    };

    /**
   	 * 컴포넌트의 스타일을 셋
   	 * @method getStyle
   	 * @param styleProp
   	 **/
    p.setStyle = function(name,value,prefix) {
        var isSetStyleChanged = false;
        if (_.isString(name)) {
            var sdata = (arguments.length > 2) ? {"value":value, "prefix":volcano._browserPrefix + name} : {value:value};
            this._deferredSetStyles[name] = sdata;
            isSetStyleChanged = true;
        }

        if (isSetStyleChanged) {
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        return this;
    };

    p._measuredWidth = 0;
    p.measuredWidth = function(w) {
        if (arguments.length) {
            this._measuredWidth = w;
            return this;
        }else{
            return this._measuredWidth;
        }
    };

    p._measuredHeight = 0;
    p.measuredHeight = function(h) {
        if (arguments.length) {
            this._measuredHeight = h;
            return this;
        }else{
            return this._measuredHeight;
        }
    };

    p._widthChanged = false;
    p._width = 0;
    p._height = 0;
    p._oldWidth = 0;
    p._oldHeight = 0;
    p.width = function(w) {
        if (arguments.length) {
            this._width = w;
            this._widthChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
            return this;
        }else{
            return this._width;
        }
    };

    p._percentWidth = 0;
    p._oldPercentWidth = 0;
    p._percentWidthChanged = false;
    p.percentWidth = function(w) {
        if (arguments.length) {
            this._percentWidth = w;
            this._percentWidthChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
            return this;
        }else{
            return this._percentWidth;
        }
    };

    p._heightChanged = false;
    p.height = function(h) {
        if (arguments.length) {
            this._height = h;
            this._heightChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
            return this;
        }else{
            return this._height;
        }
    };

    p._percentHeight = 0;
    p._oldPercentHeight = 0;
    p._percentHeightChanged = false;
    p.percentHeight = function(h) {
        if (arguments.length) {
            this._percentHeight = h;
            this._percentHeightChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
            return this;
        }else{
            return this._height;
        }
    };

    p._enabled = false;

    p.enabled = function (v) {
        if (arguments.length) {
            this._enabled = v;
            this.invalidateDisplayList();
            this.dispatchEvent("enabledChanged");
        }else{
            return this._enabled;
        }
    };

    p._initialized = false;
    p.initialized = function(value){
        if(arguments.length){
            this._initialized = arguments[0];

            if (arguments[0]) {
                this.dispatchEvent("creationComplete");
            }
        }else{
            return this._initialized;
        }
    };

    p.updateCompletePendingFlag = function(value){
        if(arguments.length){
            this._updateCompletePendingFlag = value;
        }else{
            return this._updateCompletePendingFlag;
        }
    };

    p.setActualSize = function(w,h) {
        var changed = false;
        if (this._width != w) {
            this._width = w;
            this._widthChanged = true;
            changed = true;
            this.dispatchEvent("widthChanged");
        }
        if (this._height != h) {
            this._height = h;
            this._heightChanged = true;
            changed = true;
            this.dispatchEvent("heightChanged");
        }
        if (changed) {
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
    };

    p._ox = 0;
    p._oy = 0;
    p._oz = 0;
    p._x = 0;
    p._y = 0;
    p._z = 0;
    p._oldX = 0;
    p._oldY = 0;
    p._oldZ = 0;

    p.x = function(px) {
        if ( arguments.length ) {
            if(this._x != px){
                this._x = px;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[0]] + this._ox;
        }
    };

    p.y = function(py) {
        if ( arguments.length ) {
            if(this._y != py){
                this._y = py;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[1]] + this._oy;
        }
    };

    p.z =  function(pz) {
        if ( arguments.length ) {
            if(this._z != pz){
                this._z = pz;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[2]] + this._oz;
        }
    };

    p.move = function(px,py,pz) {
        var changed = false;
        if (this._x != px) {
            this._x = px;
            changed = true;
        }
        if (this._y != py) {
            this._y = py;
            changed = true;
        }
        if(arguments.length >= 3){
            if (this._z != pz) {
                this._z = pz;
                changed = true;
            }
        }

        if (changed) {
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
    };
    
    p._rotationX = 0;
    p._rotationY = 0;
    p._rotationZ = 0;
    p._oldRotationX = 0;
    p._oldRotationY = 0;
    p._oldRotationZ = 0;
    
    p.rotationX = function(rx) {
        if ( arguments.length ) {
            if(rx != this._rotationX){
                this._rotationX = rx;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[3]];
        }
    };

    p.rotationY = function(ry) {
        if ( arguments.length ) {
            if(ry != this._rotationY){
                this._rotationY = ry;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[4]];
        }
    };

    p.rotationZ = function(rz) {
        if ( arguments.length ) {
            if(rz != this._rotationZ){
                this._rotationZ = rz;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[5]];
        }
    };

    p.rotation = function(rx,ry,rz) {
        var changed = false;
        
        if(rx != this._rotationX){
            this._rotationX = rx;
            changed = true;
        }
        if(ry != this._rotationY){
            this._rotationY = ry;
            changed = true;
        }
        if(rz != this._rotationZ){
            this._rotationZ = rz;
            changed = true;
        }
        
        if(changed){
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        return this;
    };

    p._scaleX = 1;
    p._scaleY = 1;
    p._scaleZ = 1;
    p._oldScaleX = 1;
    p._oldScaleY = 1;
    p._oldScaleZ = 1;

    p.scaleX = function(sx) {
        if ( arguments.length ) {
            if(this._scaleX != sx){
                this._scaleX = sx;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[6]];
        }
    };

    p.scaleY = function(sy) {
        if ( arguments.length ) {
            if(this._scaleY != sy){
                this._scaleY = sy;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[7]];
        }
    };

    p.scaleZ = function(sz) {
        if ( arguments.length ) {
            if(this._scaleZ != sz){
                this._scaleZ = sz;
                this.invalidateProperties();
                this.invalidateDisplayList();
            }
            return this;
        } else {
            return this._string[this._positions[8]];
        }
    };

    p.scale = function(sx,sy,sz) {
        var changed = false;
        switch(arguments.length){
            case 0:
                if (this.isAutoUpdate) this.updateTransform();
                return this._string[this._positions[6]];
            case 1:
                this._scaleZ = this._scaleY = this._scaleX = sx;
                this.invalidateProperties();
                this.invalidateDisplayList();
                break;
            case 2:
                this._scaleX = sx;
                this._scaleY = sy;
                this._scaleZ = 1;
                this.invalidateProperties();
                this.invalidateDisplayList();
                break;
            case 3:
                this._scaleX = sx;
                this._scaleY = sy;
                this._scaleZ = sz;
                this.invalidateProperties();
                this.invalidateDisplayList();
                break;
        }
        return this;
    };

    p._invalidatePropertiesFlag = false;
    p._invalidateSizeFlag = false;
    p._invalidateDisplayListFlag = false;
    /**
     * 속성의 다음 프레임 화면에 적용을 위한 invalidate 예약 명령어
     */
    p.invalidateProperties = function() {
        if (!this._invalidatePropertiesFlag) {
            this._invalidatePropertiesFlag = true;

            //todo call layout manager invalidateProperties
            volcano.LayoutManager.invalidateProperties(this);
        }
    };

    /**
     * 화면의 다음 프레임 크기 조절을 위한 invalidate 예약 명령어
     */
    p.invalidateSize = function() {
        if (!this._invalidateSizeFlag) {
            this._invalidateSizeFlag = true;

            volcano.LayoutManager.invalidateSize(this);
        }
    };

    /**
     * 화면의 다음 프레임에 업데이트를 하기 위한 invalidate 예약 명령어
     */
    p.invalidateDisplayList = function() {
        if (!this._invalidateDisplayListFlag) {
            this._invalidateDisplayListFlag = true;

            volcano.LayoutManager.invalidateDisplayList(this);
        }
    };

    p.validateProperties = function() {
        if (this._invalidatePropertiesFlag) {
            this.commitProperties();
            this._invalidatePropertiesFlag = false;
        }
    };

    p.validateSize = function() {
        var recursive = arguments[0];
        if(recursive === true){
            for(var i = 0 ; i < this.getNumElements ; i++){
                var child = this.getElementAt(i);
                child.validateSize(true);
            }
        }
        if (this._invalidateSizeFlag) {
            this.measure();
        }
    };

    p.validateDisplayList = function() {
        if (this._invalidateDisplayListFlag) {
            this.updateDisplayList(this.measuredWidth(), this.measuredHeight() );
            this._invalidateDisplayListFlag = false;
        }
    };

    p._listeningForRender = false;
    p._callLaterDispatcher = function() {
        UIComponent._callLaterDispatcherCount++;
        //EnterFrame 이벤트에 _callLaterDispatcher 제거;
        if (this._listeningForRender) {
            this.systemManager.removeEnterFrameListener(this._callLaterDispatcher);
            this._listeningForRender = false;
        }

        // methodQue 지우고..
        var queue = this._methodQueue;
        this._methodQueue = [];

        // methodQue 실행
        var n = queue.length;
        if (n > 0) {
            for (var i=0; i<n; i++) {
                var mqe = queue[i];
                mqe.method.apply(null, mqe.args);
            }
        }

        UIComponent._callLaterDispatcherCount--;
    };

    p.callLater = function(callback, args) {
        this._methodQueue.push(new MethodQueElement(callback, args));

        //EnterFrame 이벤트에 _callLaterDispatcher 호출;
        if (!this._listeningForRender) {
            this.systemManager.addEnterFrameListener(this._callLaterDispatcher);
            this._listeningForRender = true
        }
    };

    p.VSprite__elementAdded = p._elementAdded;
    p._elementAdded = function (element, index, notifyListeners) {
        this.VSprite__elementAdded(element, index, notifyListeners); //super

        element.parentChanged(this);
        element.nestLevel(this.nestLevel()+1); // nest level 추가
        //todo 스타일 캐시 재생성 element.regenerateStyleCache(true);
        //todo 스타일 변경 알림  element.styleChanged(null);
        //todo 차일드에게 스타일 변경 알림 element.notifyStyleChangeInChildren(null, true);
        //todo 테마 컬러 초기화 element.initThemeColor();
        //todo 스타일 초기화 element.stylesInitialized();
        if (!element.initialized()) {
            element.initComponent();
        }
    };

    p.VSprite__elementRemoved = p._elementRemoved;
    p._elementRemoved = function(element, index, notifyListeners){

        element.parentChanged(null);

        this.VSprite__elementRemoved(element, index, notifyListeners); //super
    };

    var parentChangedFlag = false;
    p.parentChanged = function(p){
        if(!p){
            this.parent = null;
            this.nestLevel(0);
        }else if(p.name === "systemManager"){
            this.parent = p;
        }else{
            this.parent = p.parent;
        }

        parentChangedFlag = true;
    };

    p.initComponent = function() {
        if (this.initialized()) {
            return;
        }

        this.dispatchEvent("preinitialize");

        this.createChildren();
        this.childrenCreated();

        this.initializationComplete();
    };

    // TODO Layout 적용 시 구현
    p.getLayoutBoundsX = function(postLayoutTransform){

    };

    // TODO Layout 적용 시 구현
    p.getLayoutBoundsY = function(postLayoutTransform){

    }

// protected Method
    /**
     * 객체 생성및 초기화를 위한 override 메소드
     * @protected
     */
    p.createChildren = function() {};

    /**
     * 객체 생성이 완료 되었을 때의 메소드
     * @protected
     */
    p.childrenCreated = function() {
        this.invalidateProperties();
        this.invalidateSize();
        this.invalidateDisplayList();
    };
    /**
     * 속성 변경을 하기위한 override용 메소드
     * @protected
     */
    p.commitProperties = function() {
//        console.log(this.name() +  "   -------------   " + "commitProperties");
        // x, y, z 속성
        var transformChanged = false;
        if(this._x != this._oldx || this._y != this._oldy || this._z != this._oldz){
            
            this._oldx = this._x;
            this._oldy = this._y;
            this._oldz = this._z;
            this._string[this._positions[0]] = this._x - this._ox;
            this._string[this._positions[1]] = this._y - this._oy;
            this._string[this._positions[2]] = this._z - this._oz;

            transformChanged = true;
        }

        if(this._rotationX != this._oldRotationX || this._rotationY != this._oldRotationY || this._rotationZ != this._oldRotationZ){
            this._oldRotationX = this._rotationX;
            this._oldRotationY = this._rotationY;
            this._oldRotationZ = this._rotationZ;
            this._string[this._positions[3]] = this._rotationX;
            this._string[this._positions[4]] = this._rotationY;
            this._string[this._positions[5]] = this._rotationZ;

            transformChanged = true;
        }

        if(this._scaleX != this._oldScaleX || this._scaleY != this._oldScaleY || this._scaleZ != this._oldScaleZ){
            this._oldScaleX = this._scaleX;
            this._oldScaleY = this._scaleY;
            this._oldScaleZ = this._scaleZ;
            this._string[this._positions[6]] = this._scaleX;
            this._string[this._positions[7]] = this._scaleY;
            this._string[this._positions[8]] = this._scaleZ;

            transformChanged = true;
        }

        if(transformChanged){
            this.updateTransform();
        }

        // width, height 속성

        var sizeWidthChanged = false;
        if(this._width != this._oldWidth){
            this._oldWidth = this._width;
            this._domElement.style.width = this._width + "px";
            sizeWidthChanged = true;
        }

        if(this._percentWidth != this._oldPercentWidth && !sizeWidthChanged){
            this._oldPercentWidth = this._percentWidth;
            this._domElement.style.width = this._percentWidth + "%";
        }

        var sizeHeightChanged = false;
        if(this._height != this._oldHeight){
            this._oldHeight = this._height;
            this._domElement.style.height = this._height + "px";
            sizeHeightChanged = true;
        }

        if(this._percentHeight != this._oldPercentHeight && !sizeHeightChanged){
            this._oldPercentHeight = this._percentHeight;
            this._domElement.style.height = this._percentHeight + "%";
        }
    };

    /**
     * 크기조절을 위한 override용 메소드
     * @protected
     */
    p.measure = function() {
//        console.log(this.name() +  "   -------------   " + "measure");
    };
    /**
     * 좌표 조절을 위한 override용 메소드
     * @param w
     * @param h
     * @protected
     */
    p.updateDisplayList = function(w,h) {
//        console.log(this.name() +  "   -------------   " + "updateDisplayList");
    };

    /**
     * 초기화 완료 메소드
     * @protected
     */
    p.initializationComplete = function() {
        this.dispatchEvent("initialize");
        this.processedDescriptors(true);
    };

    window.volcano.UIComponent = UIComponent;

})(window);/*
 * SkinnableComponent
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
(function (window) {
    /**
     * Skinnable Architecture 구현한 베이스 컴포넌트
     * You have to implement below method to make component
     * getSkinParts : defines skin parts
     * getCurrentSkinState : defines skin state
     * partAdded : add Event Handler or Initialize code
     * partRemoved : remove Event Handler or Initialize code
     *
     * @class SkinnableComponent
     * @constructor
     * @author David Yun
     */
    var SkinnableComponent = function () {
        this.initialize();
    };

    var p = SkinnableComponent.prototype = new volcano.UIComponent();

    p.UIComponent_initialize = p.initialize;

    p.initialize = function () {
        this.UIComponent_initialize(); //super
    };


// protected Method
    /**
     * 객체 생성및 초기화를 위한 override 메소드
     * @protected
     */
    p.createChildren = function () {
        this._validateSkinChange();
    };

    /**
     * Skinnable Component API
     *
     */

    p._skinStateIsDirty = false;
    /**
     * 스킨의 State 변경으로 인한 화면 업데이트를 위한 invalidate 예약 명령어
     * @public
     */
    p.invalidateSkinState = function () {
        if (!this._skinStateIsDirty) {
            this._skinStateIsDirty = true;
            this.invalidateProperties();
        }
    };

    /**
     * 스킨에서 사용할 스킨파트 정보를 객체로 담아놓는다.
     * 이 메소드는 직접 호출하는 함수가 아니고, findSkinParts, clearSkinParts 에 의해 자동으로 호출된다.
     * UIComponent의 서브클래스는 이 메소드를 재정의 해야한다.
     * @protected
     * @return {Object}
     */
    p.getSkinParts = function () {
        // {partName : required}
        //var ret = {"iconDisplay":false, "labelDisplay":false};
        var ret = null;
        return ret;
    };

    /**
     * 컴포넌트의 스킨을 만든다.
     * 이 메소드는 직접 호출하는 함수가 아니고, createChildren, commitProperties 에 의해 자동으로 호출된다.
     * @protected
     */
    p.attachSkin = function () {
        if (!this._skin) {
            var skinClass = this.getStyle("skinClass");

            if (skinClass) {
                this.setSkin(new this[skinClass]);
            }

            if (this._skin) {
                this._skin.setOwner(this);

                this._skin.setStyleName(this);

                this.addElement(this._skin);
            }

            this.findSkinParts();
            this.invalidateSkinState();
        }
    };

    /**
     * 스킨 파트에 대한 참조를 제거한다.
     * 이 메소드는 직접 호출하는 함수가 아니고, detachSkin() 에 의해 자동으로 호출된다.
     * @protected
     */
    p.clearSkinParts = function () {
        var skinParts = this.getSkinParts();
        if (skinParts) {
            for (var id in skinParts) {
                if (this[id] !== null) {
                    this.partRemoved(id, this[id]);
                    //XXX dynamic parts 구현할 시에 추가 구현
                }
            }
        }
    };

    /**
     * 컴포넌트의 스킨을 무시하고 삭제한다.
     * 이 메소드는 직접 호출하는 함수가 아니고, 런타임에 스킨이 변경될 때 자동으로 호출된다.
     * @protected
     */
    p.detachSkin = function () {
        this._skin.setStyleName(null);
        this.clearSkinParts();
        this.removeElement(this._skin);
        this.setSkin(null);
    };

    /**
     * 스킨파트 스킨 클래스에서 찾아 컴포넌트의 속성에 할당한다.
     * 이 메소드는 직접 호출하는 함수가 아니고, attachSkin() 에 의해 자동으로 호출된다.
     * @protected
     */
    p.findSkinParts = function () {
        var skinParts = this.getSkinParts();
        if (skinParts) {
            for (var id in skinParts) {
                if (skinParts[id] == true) { // 'skinpart required value' is true
                    if (!(id in this._skin)) {
                        throw "Required Skin Part Not Found";
                    }
                }

                if (id in this._skin) {
                    this[id] = this._skin[id];

                    if (this[id] !== null) {
                        this.partAdded(id, this[id]);
                    }
                }
            }
        }
    };

    /**
     * 스킨에 적용되는 상태의 이름을 반환한다.
     * 예를들어 Button 컴포넌트는 상태를 지정하기 위해 "up", "down", "over", "disabled" 라는 문자열을 반환할 수 있다.
     * UIComponent의 서브클래스는 이 메소드를 재정의 해야한다.
     * @protected
     */
    p.getCurrentSkinState = function () {
        return null;
    };

    /**
     * 스킨파트가 추가될 때 호출된다.
     * 이 메소드는 직접 호출하는 함수가 아니고, attachSkin() 에 의해 자동으로 호출된다.
     * UIComponent의 서브클래스는 이 메소드를 재정의 해야한다.
     * @protected
     */
    p.partAdded = function (partName, instance) {
    };

    /**
     * 스킨파트가 제거될 때 호출된다.
     * 이 메소드는 직접 호출하는 함수가 아니고, detachSkin() 에 의해 자동으로 호출된다.
     * UIComponent의 서브클래스는 이 메소드를 재정의 해야한다.
     * @protected
     */
    p.partRemoved = function (partName, instance) {
    };

    p._validateSkinChange = function () {
        var skinReload = false;

        //XXX 스킨 변경에 따른 skinReload flag 조절

        if (!skinReload) {
            if (this._skin) {
                this.detachSkin();
            }
            this.attachSkin();
        }
    };

    //XXX dynamic skinpart 관련 메소드 필요시 구현

    window.volcano.SkinnableComponent = SkinnableComponent;
})(window);(function (window) {
    /**
     * VolcanoJS Project
     * Skin 제작을 위한 기본 컴포넌트
     * You have to implement below method to make Skin
     * commitCurrentState : defines skin parts
     * layoutContents
     * drawBackground
     *
     * @class SkinBase
     * @constructor
     * @author David Yun
     *
     */
    var SkinBase = function () {
        this.initialize();
    };

    var p = SkinBase.prototype = new volcano.UIComponent();

    p._applicationDPI = 160;
    p.measuredDefaultHeight = 0;
    p.measuredDefaultWidth = 0;

    p.UIComponent_initialize = p.initialize;
    p.initialize = function () {
        this.UIComponent_initialize(); //super
    };

    p._currentState = "";
    p.getCurrentState = function () {
        return this._currentState;
    };

    p.setCurrentState = function (value) {
        if (value !== this._currentState) {
            this._currentState = value;
            this.commitCurrentState();
        }
    };

    p.beginHighlightBitmapCapture = function () {
        //XXX HighlightBitmapCapture 구현여부 결정하고 작업 해야함
    };
    p.endHighlightBitmapCapture = function () {
        //XXX HighlightBitmapCapture 구현여부 결정하고 작업 해야함
    };
    p.hasState = function (stateName) {
        return true;
    };

    p.applyColorTransform = function (uiComponent, originalColor, tintColor) {
        //XXX ColorTransform 구현여부 결정하고 작업 해야함
    };

    p.getElementPreferredHeight = function (element) {
        if (element instanceof volcano.LayoutBase) {
            return element.getPreffrredBoundsWidth();
        } else if (element instanceof volcano.UIComponent) {
            return element.getMeasuredWidth();
        } else {
            return element.getWidth();
        }
    };

    p.getElementPreferredWidth = function (element) {
        if (element instanceof volcano.LayoutBase) {
            return element.getPreffrredBoundsHeight();
        } else if (element instanceof volcano.UIComponent) {
            return element.getMeasuredHeight();
        } else {
            return element.getHeight();
        }
    };

    p.setElementPosition = function (element, x, y) {
        if (element instanceof volcano.LayoutBase) {
            element.setLayoutBoundPosition(x, y, false);
        } else if (element instanceof volcano.UIComponent) {
            element.move(x, y);
        } else {
            element.setX(x);
            element.setY(y);
        }
    };
    p.setElementSize = function (element, width, height) {
        if (element instanceof volcano.LayoutBase) {
            element.setLayoutBoundSize(width, height, false);
        } else if (element instanceof volcano.UIComponent) {
            element.setActualSize(width, height);
        } else {
            element.setWidth(width);
            element.setHeight(height);
        }
    };

    p.UIComponent_getMeasuredWidth = p.getMeasuredWidth;
    p.UIComponent_getMeasuredHeight = p.getMeasuredHeight;
    p.getMeasuredWidth = function () {
        return Math.max(this.UIComponent_getMeasuredWidth(), this.measuredDefaultWidth);
    };
    p.getMeasuredHeight = function () {
        return Math.max(this.UIComponent_getMeasuredHeight(), this.measuredDefaultHeight);
    };

    p.useSymbolColor = false;
    p.UIComponent_updateDisplayList = p.updateDisplayList;
    p.updateDisplayList = function (w, h) {
        //todo graphics.clear();

        this.UIComponent_updateDisplayList(w, h);

        this.layoutContents(w, h);

        if (this.useSymbolColor) {
            this.applySymbolColor();
        }

        if (useMinimumHitArea) {
            this.drawMinimumHitArea(w, h);
        }

        this.drawBackground(w, h);
    };

    p.commitCurrentState = function () {

    };

    p.layoutContents = function (unscaledWidth, unscaledHeight) {

    };

    p.drawBackground = function (unscaledWidth, unscaledHeight) {

    };

    this.window.volcano.SkinBase = SkinBase;

})(window);(function (window) {

    var ColorUtil = function () {
        throw "ColorUtil cannot be initialized.";
    };

    ColorUtil.getRandomColor = function() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    };


    window.volcano.ColorUtil = ColorUtil;

}(window));/*
 * Image
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
(function (window) {
    /**
     * VolcanoJS Project
     *
     * @class Image
     * @extends VSprite
     * @constructor
     * @author david yun
     *
     */
    var Image = function () {
        this.initialize();
    };

    var p = Image.prototype = new volcano.VObject();
    p.VObject_initialize = p.initialize;

    p._domElement;

    p.initialize = function () {
        var imgElement = document.createElement("img");
        this.VObject_initialize(imgElement); //super
        _.bindAll(this,"errHandler");
    };

    p.errHandler = function(event) {
        var condition1 = (this.errorImg() !== "");
        var condition2 = (this.errorImg() !== this._source);

        if (this.errorImg() !== "" && this.errorImg() !== this._source) {
            this._domElement.src = this.errorImg();
            console.log(this.errorImg() + this._source);
        }
    };

    p._source = "";
    p.source = function(value) {
        this._domElement.src = value;
        this._domElement.onerror = this.errHandler;
        this._source = value;
        return this;
    };

    p._errorImg = "";
    Image.DEFAULT_ERR_IMGAGE = "";
    p.errorImg = function(value) {
        if (arguments.length) {
            this._errorImg = value;
            return this;
        }else{
            return (this._errorImg === "") ? Image.DEFAULT_ERR_IMGAGE : this._errorImg;
        }
    };

    this.window.volcano.Image = Image;

})(window);(function (window) {

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

})(window);(function(window){

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
    var sysMgr, transViewPort, container;
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
        sysMgr = mgr;
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
//            var img = new volcano.LiImageForm(undefined, {default: "off"}).width(imageWidth).height(imageHeight).x(imageX).y(imageY).imageUrl(_dataProvider[i].filepath).titleName(_dataProvider[i].titlename).userLink(_dataProvider[i].userlink).onStart(_dataProvider[i].onstart).onEnd(_dataProvider[i].onend).channel(_dataProvider[i].channel).onDays(_dataProvider[i].onday).actors(_dataProvider[i].actor).sinario(_dataProvider[i].sinario).twitterQuery(_dataProvider[i].twitterquery);
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

        this.sysMgr = sysMgr;
        this.transViewPort = transViewPort;
        this.container = container;
        this.mainContainer = mainContainer;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.viewPortBack = viewPortBack;

        sysMgr.addEventListener(volcano.e.MOUSE_DOWN, onMouseDownHandler);
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