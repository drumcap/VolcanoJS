(function(window) {

    /**
    * EventDispatcher는 이벤트를 송수신 할 수 있는 메커니즘을 제공하며 Flash와 동일하게 동작한다.
    * Backbone.js 의 Events 클래스를 가져와 Event API 호환성을 유지한다.
    *
    * @class DisplayObject
    * @constructor
    **/
    var EventDispatcher = function() {
      this.initialize();
    }

    var slice = Array.prototype.slice;

    var p = EventDispatcher.prototype = new volcano.Core();

    EventDispatcher._eventSplitter = /\s+/;

    p.Core_initialize = p.initialize;

    p.initialize = function() {
        this.Core_initialize(); //call super
    };

    p.addEventListener = function(events, callback, context) {
        var calls, event, node, tail, list;
        if (!callback) return this;
        events = events.split(EventDispatcher._eventSplitter);
        calls = this._callbacks || (this._callbacks = {});

        while (event = events.shift()) {
          list = calls[event];
          node = list ? list.tail : {};
          node.next = tail = {};
          node.context = context;
          node.callback = callback;
          calls[event] = {tail: tail, next: list ? list.next : node};
        }
        return this;
    };

    p.removeEventListener = function(events, callback, context) {
        var event, calls, node, tail, cb, ctx;
        if (!(calls = this._callbacks)) return;
        if (!(events || callback || context)) {
          delete this._callbacks;
          return this;
        }
        events = events ? events.split(EventDispatcher._eventSplitter) : _.keys(calls);
        while (event = events.shift()) {
          node = calls[event];
          delete calls[event];
          if (!node || !(callback || context)) continue;
          tail = node.tail;
          while ((node = node.next) !== tail) {
            cb = node.callback;
            ctx = node.context;
            if ((callback && cb !== callback) || (context && ctx !== context)) {
              this.addEventListener(event, cb, ctx);
            }
          }
        }

        return this;
    };

    p.dispatchEvent = function(events) {
        var event, node, calls, tail, args, all, rest;
        if (!(calls = this._callbacks)) return this;
        all = calls.all;
        events = events.split(EventDispatcher._eventSplitter);
        rest = slice.call(arguments, 1);

        while (event = events.shift()) {
          if (node = calls[event]) {
            tail = node.tail;
            while ((node = node.next) !== tail) {
              node.callback.apply(node.context || this, rest);
            }
          }
          if (node = all) {
            tail = node.tail;
            args = [event].concat(rest);
            while ((node = node.next) !== tail) {
              node.callback.apply(node.context || this, args);
            }
          }
        }

        return this;
    };

    window.volcano.EventDispatcher = EventDispatcher;

})(window);
