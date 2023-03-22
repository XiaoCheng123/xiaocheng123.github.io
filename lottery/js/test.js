var data = ['iphone7', 'ipad', '三星', '谢谢参与']
    timer = null;
    flag = 0;

window.onload = function() {
    var title = document.getElementById('title');
    var play = document.getElementById('play');
    var stop = document.getElementById('stop');

    //抽奖
    play.onclick = playFun;
    stop.onclick = stopFun;

    document.onkeyup = function(event) {
        event = event || window.event;
        if(event.keyCode == 13) {
            if(flag == 0){
                playFun();
                flag = 1;
            } else {
                stopFun();
                flag = 0;
            }
        }
    }
}

function playFun() {
    timer = setInterval(function() {
        var random = Math.floor(Math.random() * data.length);
        title.innerHTML = data[random];
    }, 50);
    play.style.background = '#999';
}

function stopFun() {
    clearInterval(timer);
    play.style.background = '#036';
}