// 实现一个简单的Query
function $(selector) {
    var selectArr = selector.split(/\s+/), //分割继承
        i = 0, //迭代继承元素
        target = document, //迭代父元素
        targetArr, //父元素的所有子元素数组
        oldTarget,//缓存父元素以检查是否在子元素数组内找到元素
        firstChar,
        lastChar,
        j;
    while (i < selectArr.length) {
        firstChar = selectArr[i].charAt(0);
        switch (firstChar) { //依首字符选择DOM
            //返回匹配id的对象，只能通过document调用
            case "#": target = document.getElementById(selectArr[i].substring(1));
                      break;
            //返回第一个匹配class的对象          
            case ".": targetArr = target.getElementsByTagName("*");
                      oldTarget = target;
                      for (j = 0; j < targetArr.length; j++) {
                          if (targetArr[j].getAttribute("class")) {
                            var classArr = targetArr[j].getAttribute("class").split(/\s+/);
                            for (var k = 0; k < classArr.length; k++) {
                              if (classArr[k] === selectArr[i].substring(1)) {
                                target = targetArr[j];
                                break;
                              }
                            };
                            if (target === targetArr[j]) break;
                          }
                          /*
                          if (targetArr[j].getAttribute("class") === selectArr[i].substring(1)) {
                              target = targetArr[j];
                              break;
                          }*/
                      }
                      if (target === oldTarget){
                        target = undefined;
                      }
                      break;
            //返回第一个匹配属性的对象
            case "[" : lastChar = selectArr[i].charAt(selectArr[i].length-1);
                       if (lastChar === ']') {
                           var flags = selectArr[i].indexOf("=");
                           targetArr = target.getElementsByTagName("*");
                           oldTarget = target;
                           if ( flags === -1) {
                               for ( j = 0; j < targetArr.length; j++) {
                                   if (targetArr[j].getAttribute(selectArr[i].substring(1, selectArr[i].length-1))) {
                                   target = targetArr[j];
                                   break;
                                   }
                               }
                           }
                           else {
                               var key = selectArr[i].substring(1,flags)
                                   value = selectArr[i].substring(flags+1, selectArr[i].length-1);
                               for (j = 0; j < targetArr.length; j++) {
                                   if (targetArr[j].getAttribute(key) === value) {
                                       target = targetArr[j];
                                       break;
                                   }
                               }
                           }
                           if (target === oldTarget){
                              target = undefined;
                           }
                           break;
                       }
            //返回第一个匹配tag的对象
            default: target = target.getElementsByTagName(selectArr[i])[0];
        }
        if (target === document || target === null || target === undefined) { //处理匹配不到的情况
          console.log("Not Found!");
          return;
        }
        i++;
    }
    return target;
}

// 给一个element绑定一个针对event事件的响应，响应函数为listener
function addEvent(element, event, listener) {
  if (element.addEventListener) {
    element.addEventListener(event, listener);
  }
  else if (element.attachEvent) {
    element.attachEvent("on"+event, listener);
  }
}

// 移除element对象对于event事件发生时执行listener的响应
function removeEvent(element, event, listener) {
  if (element.removeEventListener) {
    element.removeEventListener(event, listener);
  }
  else if (element.detachEvent) {
    element.detachEvent("on"+event, listener);
  }
}

// 实现对click事件的绑定
function addClickEvent(element, listener) {
    addEvent(element, "click", listener);
}

// 实现对于按Enter键时的事件绑定
function addEnterEvent(element, listener) {
    addEvent(element, "keydown", function (event) { //是enter键才绑定
      if (event.keyCode === 13) listener();
    });
}

//实现事件代理
function delegateEvent(element, tag, eventName, listener) {
    addEvent(element, eventName, function (e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        if (target.nodeName.toLowerCase() === tag.toLowerCase()) listener(target, e);
    });
}

$.on = addEvent;
$.un = removeEvent;
$.click = addClickEvent;
$.enter = addEnterEvent;
$.delegate = delegateEvent;

// 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
function uniqArray(arr) {
  var newArr = [];
  for (var i in arr) {
    if (arr[i] !== "" && newArr.indexOf(arr[i]) === -1) {
      newArr.push(arr[i]);
    }
  }
  return newArr;
}

function hasClass(element, className) {
    return element.className.split(/\s+/).indexOf(className) !== -1; //分割class字符，存入数组
}

// 为element增加一个样式名为newClassName的新样式
function addClass(element, newClassName) {
    if (!hasClass(element, newClassName)) { //不重则拼接
        element.className = element.className ? (element.className + " " + newClassName)  : newClassName; 
    }
}

// 移除element中的样式oldClassName
function removeClass(element, oldClassName) {
    if (hasClass(element, oldClassName)) { //含有则删除
        element.className = element.className.replace(new RegExp("\\b"+oldClassName+"\\b"), "");  //使用\b来确定单词边界
    }
}

// 获取element相对于浏览器窗口的位置，返回一个对象{x, y}
function getPosition(element) {
    var box = element.getBoundingClientRect();
    return {
            x: box.left,
            y: box.top
    };
}

// 获取元素css
function getCSS(element) {
  return element.currentStyle? element.currentStyle : window.getComputedStyle(element, null);
}