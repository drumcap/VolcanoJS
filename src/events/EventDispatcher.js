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

    var p = EventDispatcher.prototype = new volcano.Core();
    p.Core_initialize = p.initialize;

    p.initialize = function() {
        this.Core_initialize(); //call super
    };

    p.addEventListener = p.on = p.bind = window.volcano.Events.on;
    p.removeEventListener = p.off = p.unbind = window.volcano.Events.off;
    p.dispatchEvent = p.trigger = window.volcano.Events.trigger;

    window.volcano.EventDispatcher = EventDispatcher;

})(window);