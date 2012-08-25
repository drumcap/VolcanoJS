(function(window){

    var OnDemandEventDispatcher = function(){
        this.initialize();
    };

    var p = OnDemandEventDispatcher.prototype = new volcano.Core();

    p.Core_initialize = p.initialize();

    p.initialize = function(){
        this.Core_initialize();
    };

    window.volcano.OnDemandEventDispatcher = OnDemandEventDispatcher;

})(window);
