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
})(window);