/**
 * Javascript Ajax
 * @author: Tom Flidr | tomflidr(at)gmail(dot)com
 * @url: https://github.com/tomFlidr/ajax.js
 * @version: 1.0
 * @date: 2015-10-11
 * @usage:
var xhr = Ajax.load({
	url: 'https://github.com/tomFlidr',
	method: 'post',
	data: { anything: ["to", "serialize"] },
	success: function (data, statusCode, xhr) {},
	type: 'json',
	error: function (responseText, statusCode, xhr) {},
	headers: {},
	async: true
});
*/
Ajax = function Ajax() {};
Ajax['handlers'] = {
	'before': [],
	'success': [],
	'abort': [],
	'error': []
};
Ajax['defaultHeaders'] = {
	'X-Requested-With': 'XmlHttpRequest',
	'Content-Type': 'application/x-www-form-urlencoded'
};
Ajax['jsonpCallbackParam'] = 'callback';
Ajax._scriptCallbackTmpl = 'JsonpCallback';
Ajax._requestCounter = 0;
Ajax['beforeLoad'] = function (fn) {
	Ajax['handlers']['before'].push(fn);
	return Ajax;
};
Ajax['onSuccess'] = function (fn) {
	Ajax['handlers']['success'].push(fn);
	return Ajax;
};
Ajax['onAbort'] = function (fn) {
	Ajax['handlers']['abort'].push(fn);
	return Ajax;
};
Ajax['onError'] = function (fn) {
	Ajax['handlers']['error'].push(fn);
	return Ajax;
};
Ajax['get'] = function () {
	var ajax = new Ajax();
	return ajax._init.apply(ajax, [].slice.apply(arguments))._processRequest();
};
Ajax['post'] = function () {
	var ajax = new Ajax();
	return ajax._init.apply(ajax, [].slice.apply(arguments))._processRequest('post');
};
Ajax['load'] = function (cfg) {
	var ajax = new Ajax();
	return ajax._init(
		cfg['url'], cfg['data'], cfg['success'], cfg['type'], cfg['error'], cfg['headers'], cfg['async']
	)._processRequest(cfg['method']);
};
Ajax['prototype'] = {
	'toString': function () {
		return '[object Ajax]';
	},
	_init: function (url, data, success, type, error, headers, async) {
		var fn = function () {}, scope = this;
		scope.url = url || '';
		scope.data = data || {};
		scope.success = success || fn;
		scope.type = (type === undefined ? '' : type).toLowerCase() || '';
		scope.error = error || fn;
		scope.headers = headers || {};
		scope.async = typeof(async) == 'undefined' ? !0 : async;
		scope.result = {
			success: !0, 
			data: {}
		};
		return scope;
	},
	_processRequest: function (method) {
		var scope = this;
		scope.oldIe = !!document.all;
		if (scope.type == 'jsonp') {
			return scope._processScriptRequest();
		} else {
			return scope._processXhrRequest(method).xhr;
		}
	},
	_processScriptRequest: function () {
		var scope = this,
			scriptElm = document['createElement']('script'),
			headElm = scope._getScriptContainerElement();
		scope.scriptElm = scriptElm;
		scope.requestId = Ajax._requestCounter++;
		scope.callbackName = Ajax._scriptCallbackTmpl + scope.requestId;
		Ajax[scope.callbackName] = function (data) {
			scope._handlerScriptRequestSuccess(data);
		};
		scope.data[Ajax['jsonpCallbackParam']] = this._getLibraryName() + '.' + scope.callbackName;
		scope._completeUriAndGetParams('get');
		scriptElm['setAttribute']('src', scope.url);
		scope._callBeforeHandlers();
		scope.result.success = !1;
		if (scope.oldIe) {
			scriptElm.attachEvent('onreadystatechange', scope._handlerProviderScriptRequestError());
			scriptElm = headElm['insertAdjacentElement']('beforeEnd', scriptElm);
		} else {
			scriptElm.setAttribute('async', 'async');
			scriptElm.addEventListener('error', scope._handlerProviderScriptRequestError(), true);
			scriptElm = headElm['appendChild'](scriptElm);
		}
		return {
			'url': scope.url,
			'id': scope.requestId,
			'abort': function () {
				scope._handlerScriptRequestCleanUp();
				scope._callAbortHandlers();
			}
		};
	},
	_handlerScriptRequestSuccess: function (data) {
		var scope = this;
		scope.result.success = !0;
		scope._handlerScriptRequestCleanUp();
		scope.result.data = data;
		scope._callSuccessHandlers();
		scope.success(data);
	},
	_handlerProviderScriptRequestError: function () {
		var scope = this,
			scriptElm = scope.scriptElm;
		if (scope.oldIe) {
			return function (e) {
				e = e || window.event;
				trace(scriptElm.readyState);
				if (scriptElm.readyState == 'loaded' && !scope.result.success) {
					scope._handlerScriptRequestError(e);
				}
			}
		} else {
			return function (e) {
				scope._handlerScriptRequestError(e);
			}
		}
	},
	_handlerScriptRequestError: function (e) {
		var scope = this,
			errorHandler = scope._handlerProviderScriptRequestError();
		if (scope.oldIe) {
			scope.scriptElm.detachEvent('onreadystatechange', errorHandler);
		} else {
			scope.scriptElm.removeEventListener('error', errorHandler, true);
		}
		scope._handlerScriptRequestCleanUp();
		scope.errorEvent = e;
		scope._logException();
		scope._callErrorHandlers();
		scope.error(scope.url, scope.requestId, e);
	},
	_handlerScriptRequestCleanUp: function () {
		var scope = this;
		scope.scriptElm['parentNode']['removeChild'](scope.scriptElm);
		if (scope.oldIe) {
			Ajax[scope.callbackName] = undefined;
		} else {
			delete Ajax[scope.callbackName];
		}
	},
	_processXhrRequest: function (method) {
		var method = (method === undefined ? 'get' : method).toLowerCase(),
			scope = this,
			paramsStr = scope._completeUriAndGetParams(method);
		scope.requestId = Ajax._requestCounter++;
		scope.xhr = scope._createXhrInstance();
		scope.xhr['open'](method, scope.url, scope.async);
		scope._setUpHeaders();
		scope._callBeforeHandlers();
		scope._processXhrRequestAddListener();
		scope._processXhrRequestSend(method, paramsStr);
		return scope;
	},
	_processXhrRequestAddListener: function () {
		var scope = this,
			eventName = 'readystatechange',
			handler = function (e) {
				scope._handlerXhrRequestReadyStatechange(e);
			};
		if (scope.oldIe) {
			scope.xhr['attachEvent']('on'+eventName, handler);
		} else {
			scope.xhr['addEventListener'](eventName, handler);
		}
	},
	_handlerXhrRequestReadyStatechange: function (e) {
		e = e || window.event,
			scope = this;
		if (scope.xhr['readyState'] == 4) {
			scope._processResponse(e);
		}
	},
	_processXhrRequestSend: function (method, paramsStr) {
		var xhr = this.xhr;
		if (method == 'get') {
			xhr['send']();
		} else if (method == 'post') {
			xhr['send'](paramsStr);
		}
	},
	_processResponse: function (e) {
		var scope = this, xhr = scope.xhr;
		if (xhr['status'] == 200){
			scope._processXhrResult();
		} else if (xhr['status'] === 0){
			scope._callAbortHandlers();
		} else {
			scope.result.success = !0;
			scope.errorEvent = e;
			scope.errorObject = new Error('Http Status Code: ' + xhr['status']);
			scope._logException();
			scope._callErrorHandlers();
		}
	},
	_processXhrResult: function () {
		var scope = this,
			xhr = scope.xhr;
		if (scope.type.length === 0) scope._determinateTypeByContentTypeHeader();
		// if parsing cause any error - call error handlers immediately
		scope._processXhrResultByType();
		// rest is only for successfully finished parsing:
		if (scope.result.success) {
			scope._callSuccessHandlers();
			scope.success(
				scope.result.data, 
				xhr['status'], 
				xhr
			);
		} else {
			scope._callErrorHandlers();
			scope.error(
				xhr['responseText'], 
				xhr['status'], 
				xhr
			);
		}
	},
	_processXhrResultByType: function () {
		var scope = this,
			xhr = scope.xhr;
		if (scope.type == 'json') {
			scope._createResultJson();
		} else if (scope.type == 'xml' || scope.type == 'html') {
			scope._createResultXml();
		} else if (scope.type == 'text') {
			scope.result.data = xhr['responseText'];
		}
	},
	_determinateTypeByContentTypeHeader: function () {
		var scope = this,
			ctSubject = this._getSubjectPartContentHeader();
		scope.type = 'text';
		if (ctSubject.indexOf('javascript') > -1 || ctSubject.indexOf('json') > -1) {
			// application/json,application/javascript,application/x-javascript,text/javascript,text/x-javascript,text/x-json
			scope.type = 'json';
		} else if (ctSubject.indexOf('html') > -1) {
			// application/xhtml+xml,text/html,application/vnd.ms-htmlhelp
			scope.type = 'html';
		} else if (ctSubject.indexOf('xml') > -1) {
			// application/xml,text/xml,	application/xml-dtd,application/rss+xml,application/atom+xml,application/vnd.google-earth.kml+xml,model/vnd.collada+xml and much more...
			scope.type = 'xml';
		}
	},
	_getSubjectPartContentHeader: function () {
		var contentType = this._getCompleteContentTypeHeader(),
			slashPos = contentType.indexOf('/');
		if (slashPos > -1) contentType = contentType.substr(slashPos + 1);
		return contentType;
	},
	_getCompleteContentTypeHeader: function () {
		var scope = this,
			contentType = scope.xhr['getResponseHeader']("Content-Type"),
			semicolPos = contentType.indexOf(';');
		contentType = contentType.length > 0 ? contentType.toLowerCase() : '';
		if (semicolPos > -1) contentType = contentType.substr(0, semicolPos);
		return contentType;
	},
	_createResultJson: function () {
		var win = window, scope = this;
		try {
			scope.result.data = (new Function('return '+scope.xhr['responseText']))();
		} catch (e) {
			scope.result.success = !0;
			scope.errorObject = e;
			scope._logException();
		}
	},
	_createResultXml: function () {
		var parser = {}, 
			win = window, 
			scope = this,
			responseText = scope.xhr['responseText'],
			DomParser = win['DOMParser'];
		try {
			if (DomParser) {
				parser = new DomParser();
				scope.result.data = parser['parseFromString'](responseText, "application/xml");
			} else {
				parser = new win['ActiveXObject']('Microsoft.XMLDOM');
				parser['async'] = !1;
				scope.result.data = parser['loadXML'](responseText);
			}
		} catch (e) {
			scope.result.success = !0;
			scope.errorObject = e;
			scope._logException();
		}
	},
	_createXhrInstance: function () {
		var xhrInstance,
			win = window,
			activeXObjTypes = ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'];
		if (win['XMLHttpRequest']) {
			xhrInstance = new win['XMLHttpRequest']();
		} else {
			for (var i = 0, l = activeXObjTypes.length; i < l; i += 1) {
				try{
					xhrInstance = new win['ActiveXObject'](activeXObjTypes[i]);
				} catch (e) {};
			};
		}
		return xhrInstance;
	},
	_setUpHeaders: function () {
		var scope = this,
			xhr = scope.xhr,
			configuredHeaders = scope.headers,
			defaultHeaders = Ajax['defaultHeaders'];
		for (var headerName in configuredHeaders) {
			xhr['setRequestHeader'](headerName, configuredHeaders[headerName]);
		}
		for (headerName in defaultHeaders) {
			if (configuredHeaders[headerName]) continue;
			xhr['setRequestHeader'](headerName, defaultHeaders[headerName]);
		}
	},
	_completeUriAndGetParams: function (method) {
		var scope = this,
			dataStr = '',
			delimiter = '?',
			url = scope.url,
			delimPos = url.indexOf(delimiter),
			method = method.toLowerCase();
		if (method == 'get') {
			scope.data._ = +new Date; // cache buster
			dataStr = scope._completeDataString();
			if (delimPos > -1) {
				delimiter = (delimPos == url.length - 1) ? '' : '&';
			}
			scope.url = url + delimiter + dataStr;
		} else {
			dataStr = scope._completeDataString();
		}
		return dataStr;
	},
	_completeDataString: function () {
		var scope = this,
			data = scope.data,
			w = window;
		if (typeof(data) == 'string') {
			return data;
		} else {
			if(!w['JSON']) scope._declareJson();
			return this._stringifyDataObject();
		}
	},
	_stringifyDataObject: function () {
		var scope = this,
			data = scope.data,
			dataArr = [], 
			dataStr = '',
			w = window;
		for (var key in data) {
			if (typeof(data[key]) == 'object') {
				dataStr = w['JSON']['stringify'](data[key])
			} else {
				dataStr = data[key].toString();
			}
			dataArr.push(key+'='+dataStr);
		}
		return dataArr.join('&');
	},
	_declareJson: function () {
		// include json2
		window['JSON']=function(){function f(n){return n<10?'0'+n:n;}
		Date.prototype.toJSON=function(){return this.getUTCFullYear()+'-'+
		f(this.getUTCMonth()+1)+'-'+
		f(this.getUTCDate())+'T'+
		f(this.getUTCHours())+':'+
		f(this.getUTCMinutes())+':'+
		f(this.getUTCSeconds())+'Z';};var m={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};function stringify(value,whitelist){var a,i,k,l,r=/["\\\x00-\x1f\x7f-\x9f]/g,v;switch(typeof value){case'string':return r.test(value)?'"'+value.replace(r,function(a){var c=m[a];if(c){return c;}
		c=a.charCodeAt();return'\\u00'+Math.floor(c/16).toString(16)+
		(c%16).toString(16);})+'"':'"'+value+'"';case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
		if(typeof value.toJSON==='function'){return stringify(value.toJSON());}
		a=[];if(typeof value.length==='number'&&!(value.propertyIsEnumerable('length'))){l=value.length;for(i=0;i<l;i+=1){a.push(stringify(value[i],whitelist)||'null');}
		return'['+a.join(',')+']';}
		if(whitelist){l=whitelist.length;for(i=0;i<l;i+=1){k=whitelist[i];if(typeof k==='string'){v=stringify(value[k],whitelist);if(v){a.push(stringify(k)+':'+v);}}}}else{for(k in value){if(typeof k==='string'){v=stringify(value[k],whitelist);if(v){a.push(stringify(k)+':'+v);}}}}
		return'{'+a.join(',')+'}';}}
		return{stringify:stringify,parse:function(text,filter){var j;function walk(k,v){var i,n;if(v&&typeof v==='object'){for(i in v){if(Object.prototype.hasOwnProperty.apply(v,[i])){n=walk(i,v[i]);if(n!==undefined){v[i]=n;}}}}
		return filter(k,v);}
		if(/^[\],:{}\s]*$/.test(text.replace(/\\./g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof filter==='function'?walk('',j):j;}
		throw new SyntaxError('parseJSON');}};}();
	},
	_getScriptContainerElement: function () {
		var headElm = document['body'];
		while (true) {
			if (headElm['previousSibling'] === null || headElm['previousSibling'] === undefined) break;
			headElm = headElm['previousSibling'];
			if (headElm['nodeName']['toLowerCase']() == 'head') break;
		}
		return headElm;
	},
	_callBeforeHandlers: function () {
		var scope = this;
		this._callHandlers('before', scope.type == 'jsonp' ? [null] : [scope.xhr]);
	},
	_callSuccessHandlers: function () {
		var scope = this,
			xhr = scope.xhr,
			data = scope.result.data;
		this._callHandlers('success', scope.type == 'jsonp' ? [null, 200, data] : [xhr, xhr['status'], data]);
	},
	_callAbortHandlers: function () {
		var scope = this;
		this._callHandlers('abort', scope.type == 'jsonp' ? [null] : [scope.xhr]);
	},
	_callErrorHandlers: function () {
		var scope = this, xhr = scope.xhr;
		this._callHandlers(
			'error', 
			scope.type == 'jsonp' ? [null, -1, '', scope.errorEvent] : [xhr, xhr['status'], xhr['responseText'], scope.errorObj]
		);
	},
	_callHandlers: function (handlersKey, additionalArgs) {
		var handlers = Ajax['handlers'][handlersKey],
			scope = this,
			handler = function () {},
			args = [scope.requestId, scope.url, scope.type];
		for (var i = 0, l = additionalArgs.length; i < l; i += 1) {
			args.push(additionalArgs[i]);
		}
		for (i = 0, l = handlers.length; i < l; i += 1) {
			handler = handlers[i];
			if (typeof(handler) != 'function') continue;
			handler.apply(null, args);
		}
	},
	_logException: function () {
		var win = window,
			scope = this,
			id = scope.requestId,
			url = scope.url,
			type = scope.type,
			jsonp = type == 'jsonp',
			errorObj = scope.errorObject,
			errorEvent = scope.errorEvent,
			xhr = scope.xhr;
		if (!win['console']) return;
		if (jsonp) {
			win['console']['log'](id, url, type, 0, errorEvent);
		} else {
			win['console']['log'](id, url, type, xhr, xhr['status'], xhr['responseText'], errorObj, errorObj['stack']);
		}
	},
	_getLibraryName: function () {
		var constructorStr = this.toString();
		return constructorStr.substr(8, constructorStr.length - 9);
	}
};