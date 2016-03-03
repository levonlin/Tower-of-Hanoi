//对于为兼容已修改或添加了Array.prototype.indexOf的浏览器，使用for-in遍历会把该属性也遍历到。
//所以要使用miniQuery就不可使用for-in遍历数组
Array.prototype.indexOf = Array.prototype.indexOf || function(item) {
	for (var i = 0 , len = this.length; i < len; i++) {
		if (this[i] === item) {
			return parseInt(i);
		}
	}
	return -1;
}

//也不可使用for-in遍历字符串
String.prototype.trim = String.prototype.trim || function() {
	return this.match(/^\s*$/) ?  '' : this.match(/\S.*\S/)[0];
}

// 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组，依赖：Array.prototype.indexOf
function uniqArray(arr) {
	var newArr = [];
	for (var i = 0 , len = arr.length; i < len; i++) {
		if (newArr.indexOf(arr[i]) === -1) {
			newArr.push(arr[i]);
		}
	}
	return newArr;
}



function queryByAttribute(target, key, value) {
	var targetArr = target.getElementsByTagName("*");
	for (var j = 0; j < targetArr.length; j++) {
		if (targetArr[j].hasAttribute(key) && (value === undefined ||
				targetArr[j].getAttribute(key).split(/\s+/).indexOf(value) !== -1)) {
			var newTarget = targetArr[j];
			break;
		}
	}
	return newTarget;
}

// 实现一个简单的Query，只返回第一个匹配元素，每层继承只支持一个条件，依赖：Array.prototype.indexOf、queryByAttribute
// 依照属性查询，依赖：Array.prototype.indexOf
function $(selector) {
	var selectArr = selector.split(/\s+/), //分割继承
		i = 0, //迭代继承元素
		target = document; //迭代父元素
	while (i < selectArr.length) {
		var firstChar = selectArr[i].charAt(0);
		switch (firstChar) { //依首字符选择DOM
			//返回匹配id的对象
			case "#":
				target = document.getElementById(selectArr[i].substring(1));
				break;
				//返回第一个匹配class的对象          
			case ".":
				target = queryByAttribute(target, "class", selectArr[i].substring(1));
				break;
				//返回第一个匹配属性的对象
			case "[":
				var lastChar = selectArr[i].charAt(selectArr[i].length - 1);
				if (lastChar === ']') {
					var flags = selectArr[i].indexOf("=");
					if (flags === -1) {
						target = queryByAttribute(target, selectArr[i].substring(1, selectArr[i].length - 1));
					} else {
						target = queryByAttribute(target, selectArr[i].substring(1, flags),
							selectArr[i].substring(flags + 1, selectArr[i].length - 1));
					}
					break;
				}
				//返回第一个匹配tag的对象
			default:
				target = target.getElementsByTagName(selectArr[i])[0];
		}
		if (target === document || target === null || target === undefined) { //处理匹配不到的情况
			console.log("Not Found!");
			return;
		}
		i++;
	}
	return target;
}



// 给一个element绑定一个针对event事件的响应，响应函数为handler
function addEvent(element, event, handler) {
	if (element.addEventListener) {
		element.addEventListener(event, handler, false);
	} else if (element.attachEvent) {
		element.attachEvent("on" + event, handler);
	}
}

// 移除element对象对于event事件发生时执行handler的响应
function removeEvent(element, event, handler) {
	if (element.removeEventListener) {
		element.removeEventListener(event, handler, false);
	} else if (element.detachEvent) {
		element.detachEvent("on" + event, handler);
	}
}

// 实现对click事件的绑定
function addClickEvent(element, handler) {
	addEvent(element, "click", handler);
}

// 实现对于按Enter键时的事件绑定
function addEnterEvent(element, handler) {
	addEvent(element, "keydown", function(event) { //是enter键才绑定
		if (event.keyCode === 13)
			return handler();
	});
}

function getEvent(event) {
	return event || window.event;
}

function getTarget(event) {
	return event.target || event.srcElement;
}

//实现事件代理
function delegateEvent(delegateElement, targetTag, eventName, handler) {
	addEvent(delegateElement, eventName, function(e) {
		e = getEvent(e);
		var target = getTarget(e);
		if (target.nodeName.toLowerCase() === targetTag.toLowerCase())
			return handler(e);
	});
}

$.on = addEvent;
$.un = removeEvent;
$.click = addClickEvent;
$.enter = addEnterEvent;
$.delegate = delegateEvent;



function hasClass(element, className) {
	return (new RegExp('(\\s|^)' + className + '(\\s|$)')).test(element.className);
}

// 为element增加一个样式名为newClassName的新样式
function addClass(element, newClassName) {
	if (!hasClass(element, newClassName)) {
		element.className = element.className ? (element.className + " " + newClassName) : newClassName;
	}
}

// 依赖：String.prototype.trim
function removeClass(element, oldClassName) {
	if (hasClass(element, oldClassName)) {
		element.className = element.className.replace(new RegExp('(\\s|^)' + oldClassName + '(\\s|$)'), " ").trim();
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

// 获取对元素实际作用的css
function getCSS(element) {
	return element.currentStyle ? element.currentStyle : window.getComputedStyle(element, null);
}

//获取元素中包含的文本内容
function getInnerText(element) {
	return (typeof element.textContent === 'string') ? element.textContent : element.innerText;
}

//设置元素中文本
function setInnerText(element, text) {
	if (typeof element.textContent === 'string') {
		element.textContent = text;
	} else {
		element.innerText = text;
	}
}

function convertToArray(nodes) {
	var array = null;
	try {
		array = Array.prototype.slice.call(nodes, 0);
	} catch (ex) { //兼容IE8
		array = new Array();
		for (var i = 0, len = nodes.length; i < len; i++) {
			array.push(nodes[i]);
		}
	}
	return array;
}