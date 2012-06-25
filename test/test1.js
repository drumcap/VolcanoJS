var bb = 2;

hoistMe();

function foo() {
    console.log("global foo");
}
function bar() {
    console.log("global bar");
}

function hoistMe() {
    var bar;
    foo();
//    bar();
//    chr();


    function foo() {
        console.log("local foo");
    }

    bar = function() {
        console.log("local bar");
    }

    chr = function() {
        console.log("local chr");
    }
}

