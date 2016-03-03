//禁止用户选择文字
addClass(document.body, 'noTextSelect');
//IE6-9
document.body.onselectstart = document.body.ondrag = function() {
    return false;
};

// !!优化代码，步数统计，帮助，胜负，选盘
var isInit = true;

function popContent(content) {
    $('.hover').style.display = 'block';
    content.style.display = 'block';
}

function hideContent() {
    $('.hover').style.display = 'none';
    $('.result-content').style.display = 'none';
    $('.choose-content').style.display = 'none';
    $('.help-content').style.display = 'none';
}

function lose() {
	isInit = true;
    $('.result-content p').innerHTML = '---- Game Over ----';
    popContent($('.result-content'));
}

function win() {
	isInit = true;
    $('.result-content p').innerHTML = '---- You win, the steps is: ' + steps + ' ----';
    popContent($('.result-content'));
}

function newGame() {
	isInit = false;
    hideContent();
    initSteps();
    initDisk(initialStack);
}

function chooseDisk() {
    hideContent();
    if ($('.disk-choose').innerHTML === '') {
        for (var i = 1; i <= 12; i++) {
            var item = document.createElement('input');
            var itemLabel = document.createElement('label');
            item.className = 'disk-item';
            item.id = 'disk-item' + i;
            item.type = 'radio';
            item.name = 'disk-item';
            item.value = i;
            if (i === diskNum) {
                item.checked = true;
            }
            itemLabel.innerHTML = i;
            itemLabel.setAttribute('for', 'disk-item' + i);
            $('.disk-choose').appendChild(item);
            $('.disk-choose').appendChild(itemLabel);
        }
    }
    if ($('.stack-choose').innerHTML === '') {
    	var stackArr = ['left', 'middle', 'right'];
        for (i = 0; i < 3; i++) {
            item = document.createElement('input');
            itemLabel = document.createElement('label');
            item.className = 'stack-item';
            item.id = 'stack-item-' + stackArr[i];
            item.type = 'radio';
            item.name = 'stack-item';
            item.value = stackArr[i];
            if ($('.stack-' + stackArr[i]) === initialStack) {
                item.checked = true;
            }
            itemLabel.innerHTML = stackArr[i];
            itemLabel.setAttribute('for', 'stack-item-' + stackArr[i]);
            $('.stack-choose').appendChild(item);
            $('.stack-choose').appendChild(itemLabel);
        }
    }
    if (isInit) {
        $('.new-or-back-btn').innerHTML = 'Cancel and start';
    }
    else{
        $('.new-or-back-btn').innerHTML = 'Back to game';
    }
    popContent($('.choose-content'));
}

function setGame() {
    for (var i = 1; i <= 12; i++) {
        if ($('#disk-item' + i).checked) {
            diskNum = parseInt($('#disk-item' + i).value);
        }
    }
    var stackArr = ['left', 'middle', 'right'];
    for (i = 0; i < 3; i++) { 
    	if ($('#stack-item-' + stackArr[i]).checked) {
            initialStack = $('.stack-' + stackArr[i]);
        }
    }
    newGame();
}

function help() {
    hideContent();
	if (isInit) {
		$('.new-or-back-btn1').innerHTML = 'New game';
	}
	else{
		$('.new-or-back-btn1').innerHTML = 'Back to game';
	}
    popContent($('.help-content'));
}

function newOrBackToGame() {
	if (isInit) {
		newGame();
	}
	else{
		hideContent();
	}
}

help();
$.on($('#new-game'), 'click', newGame);
$.on($('#seting'), 'click', chooseDisk);
$.on($('#help'), 'click', help);
$.on($('.new-game-btn'), 'click', newGame);
$.on($('.set-game-btn'), 'click', setGame);
$.on($('.new-or-back-btn'), 'click', newOrBackToGame);
$.on($('.setting-btn'), 'click', chooseDisk);
$.on($('.new-or-back-btn1'), 'click', newOrBackToGame);
