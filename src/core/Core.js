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

    var p = Core.prototype;
    p.initialize = function() {
        //todo : 코어에 기본으로 넣어줘야 할 init 추가
    };

    window.volcano.Core = Core;

})(window);
