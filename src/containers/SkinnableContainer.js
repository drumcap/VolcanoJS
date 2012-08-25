(function (window) {
    /**
     * VolcanoJS Project
     *
     * @class SkinnableContainer
     * @constructor
     * @author drumcap
     *
     */
    var SkinnableContainer = function () {
        this.initialize();
    };

    var p = SkinnableContainer.prototype = new volcano.SkinnableComponent();
    p.SkinnableComponent_initialize = p.initialize;

    p.initialize = function () {
        this.SkinnableComponent_initialize(); //super
    };

    this.window.volcano.SkinnableContainer = SkinnableContainer;

})(window);