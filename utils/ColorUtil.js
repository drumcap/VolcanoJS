(function (window) {

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

}(window));