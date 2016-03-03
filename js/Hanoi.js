var steps = 0;
var diskNum = 5;
var initialStack = $('.stack-left');

function clearDisk(stack) {
    var disk = stack.children;
    for (var i = disk.length - 1; i > 0; i--) {
        stack.removeChild(disk[i]);
    };
}

function setDiskWidth(stack) {
    var disk = stack.children;
    // !!耦合过大
    for (var i = disk.length-1; i > 0; i--) {
        var width = 50 + i * 10;
        // 设置style的属性必须严格匹配为带单位的字符串
        disk[i].style.width = width + 'px'; 
    }
}

function setDiskPosition(stack) {
    var disk = stack.children;
    for (var i = disk.length-1; i > 0; i--) {
        disk[i].style.marginLeft = disk[i].offsetWidth / -2 + 'px';
        disk[i].style.bottom = disk[i].offsetHeight * (disk.length - 1 - i) + 'px';
    }
}

function initDisk(stack) {
    clearDisk($('.stack-left'));
    clearDisk($('.stack-middle'));
    clearDisk($('.stack-right'))
    for (var i = 1; i <= diskNum; i++) {
        var newDisk = document.createElement('li');
        newDisk.className = 'disk';
        newDisk.innerHTML = i;
        stack.appendChild(newDisk);
    }
    setDiskWidth(stack);
    setDiskPosition(stack);
}

function initSteps() {
    steps = 0;
    $('#steps span').innerHTML = 0;
}



function check(disk, stack) {
    $('#steps span').innerHTML = ++steps;
    // 柱子上盘数大于一且存在大压小则输了
    if (stack.children[2] && disk.innerHTML > stack.children[2].innerHTML) {
        lose();
    }
    // 没有大压小且全部盘移动到另外柱子则赢
    else if (stack.children.length-1 === diskNum && stack !== initialStack) {
        win();
    }   
}

function putDisk(disk, stack, originStack) {
    stack.insertBefore(disk, stack.children[1]);
    disk.style.left = 50 + '%';
    disk.style.top = '';
    setDiskPosition(stack);
    if (stack !== originStack) {
        check(disk, stack);
    }
}

function isOutOfContainer(x, y, container) {
    var xMin = getPosition(container).x;
    var xMax = getPosition(container).x + container.offsetWidth;
    var yMin = getPosition(container).y;
    var yMax = getPosition(container).y + container.offsetHeight;
    return x <= xMin || x >= xMax || y <= yMin || y >= yMax;
}

function isInContainer(x, y, Container) {
    var xMin = getPosition(Container).x;
    var xMax = getPosition(Container).x + Container.offsetWidth;
    var yMin = getPosition(Container).y;
    var yMax = getPosition(Container).y + Container.offsetHeight;
    return x > xMin && x < xMax && y > yMin && y < yMax; 
}

function drag(target, ev) {
    // 记录鼠标点在盘内位置
    var mouseDownX = ev.clientX;
    var mouseDownY = ev.clientY;
    //console.log('mouseDownX'+mouseDownX);

    // 当前盘的初始位置
    var diskInitLeft = target.offsetLeft;
    var diskInitTop = target.offsetTop;
    //console.log('diskInitLeft'+diskInitLeft);
    //console.log('diskInitTop'+diskInitTop);

    // 当前盘所在区域的位置
    var originStack = target.parentNode;
    var originStackLeft = originStack.offsetLeft;
    var originStackTop = originStack.offsetTop;
    //console.log('originStackLeft' + originStackLeft);

    // 只能最上面的盘移动
    if (target !== originStack.children[1]) {
        console.log('unable to move!');
        return;
    }

    // 点击时防止就脱离
    var isFree = false;
    addClass(target, "active");

    function onMouseMove(e) {
        var ev = e || window.event;

        // 记录移动时鼠标位置
        var mouseMoveX = ev.clientX;
        var mouseMoveY = ev.clientY;
        //console.log('mouseMoveX'+mouseMoveX);

        // 移动时保证脱离
        if (!isFree) {
            originStack.removeChild(target);
            $('.container').appendChild(target);
            isFree = true;
        }

        // 不出界则可移动
        if (!isOutOfContainer(mouseMoveX, mouseMoveY, $('.container'))) {
            target.style.left = originStackLeft + diskInitLeft + (mouseMoveX - mouseDownX) + 'px';
            target.style.top = originStackTop + diskInitTop + (mouseMoveY - mouseDownY) + 'px';
            // 消除为了居中设置的margin影响
            target.style.marginLeft = 0 +'px';
            // 刷新原来的堆叠区
            setDiskPosition(originStack);
        }
    }

    function onMouseUp(e) {
        var ev = e || window.event;

        // 记录鼠标释放时位置
        var mouseUpX = ev.clientX;
        var mouseUpY = ev.clientY;
        //console.log('mouseUpX'+mouseUpX);

        removeClass(target, "active");

        // 解除原来的移动和释放事件
        $.un(document, 'mousemove', onMouseMove);
        $.un(document, 'mouseup', onMouseUp);

        // 释放时还原回脱离前
        if (isFree) {
            $('.container').removeChild(target);
            isFree = false;
        }

        // 依照释放位置释放盘子
        if (isInContainer(mouseUpX, mouseUpY, $('.stack-left'))) {
            putDisk(target, $('.stack-left'), originStack);
        }
        else if (isInContainer(mouseUpX, mouseUpY, $('.stack-middle'))) {
            putDisk(target, $('.stack-middle'), originStack);
        } 
        else if (isInContainer(mouseUpX, mouseUpY, $('.stack-right'))) {
            putDisk(target, $('.stack-right'), originStack);
        } 
        else {
            putDisk(target, originStack, originStack);
        }
    }

    // mousedown中再绑定鼠标移动和释放事件
    $.on(document, 'mousemove', onMouseMove);
    $.on(document, 'mouseup', onMouseUp);
}

// 只要父元素不变事件代理使用一次就可保持下去，所以监听的子元素改变时无需再使用代理
$.delegate($('.stack-left'), 'li', 'mousedown', drag);
$.delegate($('.stack-middle'), 'li', 'mousedown', drag);
$.delegate($('.stack-right'), 'li', 'mousedown', drag);