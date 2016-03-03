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
    for (var i = disk.length-1; i > 0; i--) {
        var width = 50 + i * 10;
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
        addClass(newDisk, 'disk');
        setInnerText(newDisk, i);
        stack.appendChild(newDisk);
    }
    setDiskWidth(stack);
    setDiskPosition(stack);
}

function initSteps() {
    steps = 0;
    setInnerText($('#steps span'), 0);
}



function check(disk, stack) {
    setInnerText($('#steps span'), ++steps);
    // 柱子上盘数大于一且存在大压小则输了
    if (stack.children[2] && getInnerText(disk) > getInnerText(stack.children[2])) {
        lose();
    }
    // 没有大压小且全部盘移动到另外柱子则赢
    else if (stack.children.length-1 === diskNum && stack !== initialStack) {
        win();
    }   
}

function putDisk(disk, stack, originStack) {
    stack.insertBefore(disk, stack.children[1] || null);
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

// 自定义事件
function EventTarget() {
    this.handlers = {};
}

EventTarget.prototype = {
    constructor: EventTarget,
    addHandler: function(type, handler) {
        if (typeof this.handlers[type] == 'undefined') {
            this.handlers[type] = [];
        }
        this.handlers[type].push(handler);
    },

    fire: function(event) {
        if (!event.target) {
            event.target = this;
        }
        if (this.handlers[event.type] instanceof Array) {
            var handlers = this.handlers[event.type];
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i](event);
            }
        }
    },

    removeHandler: function(type, handler) {
        if (this.handlers[type] instanceof Array) {
            var handlers = this.handlers[type];
            for (var i = 0, len = handlers.length; i < len; i++) {
                if (handlers[i] === handler) {
                    break;
                }
            }
            handlers.splice(i, 1);
        }
    }
};

// 拖动效果的单例对象，全局绑定，封装拖动，只留接口
var DragDrop = function () {
    var dragdrop = new EventTarget(),
        dragTarget = null,
        canMove = true,
        diffX = 0,
        diffY = 0;

    function handleEvent (event) {
        var event = getEvent(event);
        var target = getTarget(event);

        switch(event.type) {
            case 'mousedown' :
                if (target.className.indexOf('draggable') > -1) {
                    dragTarget = target;
                    diffX = event.clientX - dragTarget.offsetLeft;
                    diffY = event.clientY - dragTarget.offsetTop;
                    dragdrop.fire({
                        type: 'dragstart',
                        target: dragTarget,
                        x: event.clientX,
                        y: event.clientY,
                    });
                }
                break;
            case 'mousemove' :
                if (dragTarget !== null) {
                    dragdrop.fire({
                        type: 'drag',
                        target: dragTarget,
                        x: event.clientX,
                        y: event.clientY
                    });
                    if (canMove) {
                        dragTarget.style.left = (event.clientX - diffX) + 'px';
                        dragTarget.style.top = (event.clientY - diffY) + 'px';
                    }
                }
                break;
            case 'mouseup' :
                    // 因拖放结束也需要事件处理程序，所以需加对象存在性判断以避免空对象报错
                    if (dragTarget !== null) {
                        dragdrop.fire({
                            type: 'dragend',
                            target: dragTarget,
                            x: event.clientX,
                            y: event.clientY
                        });
                        dragTarget = null;
                    }
                break;
        }
    };

    dragdrop.enable = function () {
                $.on(document, 'mousedown', handleEvent);
                $.on(document, 'mousemove', handleEvent);
                $.on(document, 'mouseup', handleEvent);
            };

    dragdrop.disable = function () {
                $.un(document, 'mousedown', handleEvent);
                $.un(document, 'mousemove', handleEvent);
                $.un(document, 'mouseup', handleEvent);
            };

    // 增加暂停拖动效果的接口，防止出界
    dragdrop.pause = function () {
        canMove = false;
    }

    dragdrop.move = function () {
        canMove = true;
    }

    return dragdrop;
}();

function judgeDraggable(event) {
    var event = getEvent(event);
    var target = getTarget(event);
    var originStack = target.parentNode;
    if (target === originStack.children[1]) {
        addClass(target, 'draggable');
        console.log('can move!');
    } else {
        removeClass(target, 'draggable');
        console.log('can not move!');
    }
}

initDisk($('.stack-left'));
$.delegate($('.container'), 'li', 'mousedown', judgeDraggable);

DragDrop.enable();
DragDrop.addHandler('dragstart', function(event) {
    var target = event.target;
    addClass(target, "active");
});
DragDrop.addHandler('drag', function(event) {
    var target = event.target;
    if (target.style.marginLeft !== '0px') {
        target.style.marginLeft = 0 +'px';
    }

    // 出界则暂停拖动并提示禁止
    if (isOutOfContainer(event.x, event.y, $('.container'))) {
        DragDrop.pause();
        console.log('out');
    } else {
        DragDrop.move();
    }
});
DragDrop.addHandler('dragend', function(event) {
        var target = event.target;
        var originStack = target.parentNode;
        removeClass(target, "active");

        // 依照释放位置释放盘子
        if (isInContainer(event.x, event.y, $('.stack-left'))) {
            putDisk(target, $('.stack-left'));
            // 刷新原来的堆叠区
            setDiskPosition(originStack);
        }
        else if (isInContainer(event.x, event.y, $('.stack-middle'))) {
            putDisk(target, $('.stack-middle'));
            setDiskPosition(originStack);
        } 
        else if (isInContainer(event.x, event.y, $('.stack-right'))) {
            putDisk(target, $('.stack-right'));
            setDiskPosition(originStack);
        } 
        else {
            putDisk(target, originStack);
        }
});
