/*!
 * Ajax.JS
 * @author	Tom Flidr | tomflidr(at)gmail(dot)com
 * @url		https://github.com/tomFlidr/ajax.js
 * @licence	https://tomflidr.github.io/ajax.js/LICENSE.md
 * @version	1.0.12
 * @date	2022-31-10
 * @example
 *
 *    var xhr = Ajax.load(<Ajax.cfg.Load>{
 *       url: 'https://tomflidr.github.io/ajax.js/books.json',
 *       method: 'POST', // GET|POST|OPTION|HEAD...
 *       data: { anything: ["to", "serialize"] },
 *       success: (data?: any, statusCode?: number, xhr?: XMLHttpRequest|null, requestId?: number, url?: string, type?: string) => {},
 *       type: 'json', // json|jsonp|xml|html|text
 *       error: (responseText?: string, statusCode?: number, xhr?: XMLHttpRequest|null, errorObj?: Error|null, errorEvent?: Event|null, requestId?: number, url?: string, type?: string) => {},
 *       headers: {},
 *       cache: false,
 *       async: true
 *    });
 *
 */
 
/**
 * @suppress {checkTypes}
 */

(function(globalVar){
	globalVar['Ajax'] = globalVar['Ajax'] || (function(){
		/**
		 * @typedef		JsonpRequest			JsonpRequest driving object.
		 * @property	{string}	url			Full appended &lt;script&gt; tag src attribute value.
		 * @property	{number}	id			Request id.
		 * @property	{Function}	abort		Function to abort JSONP request.
		*/
		
		/**
		 * @typedef		Ajax
		 * @access		public
		 * @description	Ajax library definition.
		*/
		var Ajax = function Ajax() { };
		/**
		 * @summary		Global handlers storrages, callbacks used before and after each request or in each request abort.
		 * @access		public
		 * @type		{object}
		*/
		Ajax['handlers'] = {
			'before': [],
			'success': [],
			'abort': [],
			'error': []
		};
		/**
		 * @summary		Request HTTP headers sended by default with each request except JSONP request type.
		 * @access		public
		 * @type		{object}
		*/
		Ajax['defaultHeaders'] = {
			'X-Requested-With': 'XmlHttpRequest',
			'Content-Type': 'application/x-www-form-urlencoded'
		};
		/**
		 * @summary		JSONP callback GET param default name with value: 'callback'.
		 * @access		public
		 * @type		{string}
		*/
		Ajax['jsonpCallbackParam'] = 'callback';
		/**
		 * @summary		Cache buster param name, default `_`.
		 * @access		public
		 * @type		{string}
		*/
		Ajax['cacheBusterParamName'] = '_';
		Ajax._scriptCallbackTmpl = 'JsonpCallback';
		Ajax._requestCounter = 0;
		/**
		 * @summary					Static method to add global custom callback before any Ajax request type is processed.
		 * @access		public
		 * 
		 * @param		{Function}	callback	Required, default: function (xhr:XMLHttpRequest|null, requestId:number, url:string, type:string) {}. Custom callback called before any Ajax request type. First param is null only for JSONP requests.
		 * 
		 * @return		{Ajax}		Ajax library definition.
		*/
		Ajax['beforeLoad'] = function (callback) {
			Ajax['handlers']['before'].push(callback);
			return Ajax;
		};
		/**
		 * @summary					Static method to add global custom callback after any Ajax request type is processed successfully.
		 * @access		public
		 * 
		 * @param		{Function}	callback	Required, default: function (data:object|null, statusCode:number, xhr:XMLHttpRequest|null, requestId:number, url:string, type:string) {}. Custom callback called after any Ajax request type is processed successfully. First param is null only for JSONP requests.
		 * 
		 * @return		{Ajax}		Ajax library definition.
		*/
		Ajax['onSuccess'] = function (callback) {
			Ajax['handlers']['success'].push(callback);
			return Ajax;
		};
		/**
		 * @summary					Static method to add global custom callback after any Ajax request type is aborted.
		 * @access		public
		 * 
		 * @param		{Function}	callback	Required, default: function (xhr:XMLHttpRequest|null, requestId:number, url:string, type:string) {}. Custom callback called after any Ajax request type is aborted. First param is null only for JSONP requests.
		 * 
		 * @return		{Ajax}		Ajax library definition.
		*/
		Ajax['onAbort'] = function (callback) {
			Ajax['handlers']['abort'].push(callback);
			return Ajax;
		};
		/**
		 * @summary					Static method to add global custom callback after any Ajax request type is processed with error.
		 * @access		public
		 * 
		 * @param		{Function}	callback	Required, default: function (xhr:XMLHttpRequest|null, errorObj: Error|null, errorEvent: Event|null, requestId:number, url:string, type:string) {}. Custom callback called after any Ajax request type is processed with error. First param is null only for JSONP requests.
		 * 
		 * @return		{Ajax}		Ajax library definition.
		*/
		Ajax['onError'] = function (callback) {
			Ajax['handlers']['error'].push(callback);
			return Ajax;
		};
		/**
		 * @summary					Static method to process background GET request with window.XMLHttpRequest. Required param: url:string.
		 * @access		public
		 * 
		 * @param		{string}	url				Required. Url string to send the GET request, relative or absolute.
		 * @param		{object}	data			Not required, default: {}. Object with key/value data to be serialized into query string and sended in url, any complext value will be automaticly stringified by JSON.stringify(), (JSON shim is inclided in this Ajax.js library).
		 * @param		{Function}	successCallback	Not required, default: function (data:object, statusCode:number, xhr:XMLHttpRequest|null, requestId:number, url:string, type:string) {}. Custom callback after everything is done and if response HTTP code is bigger than 199 and lower than 300. Third param is null only for JSONP requests.
		 * @param		{string}	type			Not required, default: ''. Possible values: JSON, JSONP, XML, HTML, TEXT, if not set, result data will be processed/evaluated/parsed by response Content-Type HTTP header.
		 * @param		{Function}	errorCallback	Not required, default: function (responseText:string, statusCode:number, xhr:XMLHttpRequest|null, errorObj: Error|null, errorEvent: Event|null, requestId:number, url:string, type:string) {}. Custom callback after everything is done and if response HTTP code is bigger than 299.
		 * @param		{object}	headers			Not required, default: {}. Custom request HTTP headers to send in request.
		 * @property	{boolean}	cache			Not required, default: false. Use `true` if you don't want to add `_` cache buster param into url.
		 * @param		{boolean}	async			Not required, default: true. Use old synchronized request only if you realy know what you are doing.
		 * 
		 * @return		{XMLHttpRequest|JsonpRequest}		Build in browser request object or JsonpRequest if JSONP request.
		*/
		Ajax['get'] = function () {
			var ajax = new Ajax();
			return ajax._init.apply(ajax, [].slice.apply(arguments))._processRequest();
		};
		/**
		 * @summary					Static method to process background POST request with window.XMLHttpRequest. Required param: url:string.
		 * @access		public
		 * 
		 * @param		{string}	url				Required. Url string to send the GET request, relative or absolute.
		 * @param		{object}	data			Not required, default: {}. Object with key/value data to be serialized into query string and sended in post request body, any complext value will be automaticly stringified by JSON.stringify(), (JSON shim is inclided in this Ajax.js library).
		 * @param		{Function}	successCallback	Not required, default: function (data:object|null, statusCode:number, xhr:XMLHttpRequest, requestId:number, url:string, type:string) {}. Custom callback after everything is done and if response HTTP code is bigger than 199 and lower than 300.
		 * @param		{string}	type			Not required, default: ''. Possible values: JSON, JSONP, XML, HTML, TEXT, if not set, result data will be processed/evaluated/parsed by response Content-Type HTTP header.
		 * @param		{Function}	errorCallback	Not required, default: function (responseText:string, statusCode:number, xhr:XMLHttpRequest, errorObj: Error|null, errorEvent: Event|null, requestId:number, url:string, type:string) {}. Custom callback after everything is done and if response HTTP code is bigger than 299.
		 * @param		{object}	headers			Not required, default: {}. Custom request HTTP headers to send in request.
		 * @property	{boolean}	cache			Not required, default: false. Use `true` if you don't want to add `_` cache buster param into url.
		 * @param		{boolean}	async			Not required, default: true. Use old synchronized request only if you realy know what you are doing.
		 * 
		 * @return		{XMLHttpRequest}			Build in browser request object.
		*/
		Ajax['post'] = function () {
			var ajax = new Ajax();
			return ajax._init.apply(ajax, [].slice.apply(arguments))._processRequest('post');
		};

		/**
		 * @typedef		RequestConfig			Config to process background GET/POST/JSONP request. Required property: url:string.
		 *
		 * @property	{string}	url			Required. Url string to send the GET request, relative or absolute.
		 * @property	{object}	data		Not required, default: {}. Object with key/value data to be serialized into query string and sended in post request body, any complext value will be automaticly stringified by JSON.stringify(), (JSON shim is inclided in this Ajax.js library).
		 * @property	{Function}	success		Not required, default: function (data:object|null, statusCode:number, xhr:XMLHttpRequest|null, requestId:number, url:string, type:string) {}. Custom callback after everything is done and if response HTTP code is bigger than 199 and lower than 300. Third param is null only for JSONP requests.
		 * @property	{string}	type		Not required, default: ''. Possible values: JSON, JSONP, XML, HTML, TEXT, if not set, result data will be processed/evaluated/parsed by response Content-Type HTTP header.
		 * @property	{Function}	error		Not required, default: function (responseText:string, statusCode:number, xhr:XMLHttpRequest|null, errorObj: Error|null, errorEvent: Event|null, requestId:number, url:string, type:string) {}. Custom callback after everything is done and if response HTTP code is bigger than 299.
		 * @property	{object}	headers		Not required, default: {}. Custom request HTTP headers to send in request.
		 * @property	{boolean}	cache		Not required, default: false. Use `true` if you don't want to add `_` cache buster param into url.
		 * @property	{boolean}	async		Not required, default: true. Use old synchronized request only if you realy know what you are doing.
		*/

		/**
		 * @summary										Process background GET/POST/JSONP request by config. Required param: url:string.
		 * @type		{Ajax}
		 * @access		public
		 *
		 * @param		{RequestConfig}			cfg		Class body definition or nothing. Not required. Empty object by default. Class body definition is plain object and it should containes properties: 'Extend', 'Constructor', 'Static' and anything else to define dynamic element in your class.
		 *
		 * @return		{XMLHttpRequest|JsonpRequest}	Build in browser request object or JsonpRequest if JSONP request.
		*/
		Ajax['load'] = function (cfg) {
			/// <signature>
			///		<summary>Process background request by config.</summary>
			///		<param name="cfg" type="RequestConfig">Put JS object to process background GET/POST/JSONP request by config. Required property: url:string.</param>
			///		<returns type="XMLHttpRequest|JsonpRequest">Build in browser request object or object if JSONP request.</returns>
			/// </signature>
			var ajax = new Ajax();
			return ajax._init(
				cfg['url'], cfg['data'], cfg['success'], cfg['type'], cfg['error'], cfg['headers'], cfg['cache'], cfg['async']
			)._processRequest(cfg['method']);
		};
		Ajax['prototype'] = {
			'toString': function () {
				return '[object Ajax]';
			},
			_init: function (url, data, success, type, error, headers, cache, async) {
				var fn = function () {}, scope = this;
				scope.url = url || '';
				scope.data = data || {};
				scope.success = success || fn;
				scope.type = (type === undefined ? '' : type).toLowerCase() || 'auto';
				scope.error = error || fn;
				scope.headers = headers || {};
				scope.cache = cache == null ? !1 : cache;
				scope.async = async == null ? !0 : async;
				scope.result = {
					success: !1, 
					data: {}
				};
				scope.errorEvent = null;
				scope.errorObject = null;
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
			/**
			 * @summary							Process background JSONP request through script tag.
			 * @type		{Ajax}
			 * @access		private
			 *
			 * @return		{JsonpRequest}		JSONP driving object.
			*/
			_processScriptRequest: function () {
				/// <signature>
				///		<summary>Process background JSONP request through script tag.</summary>
				///		<returns type="JsonpRequest">JSONP driving object.</returns>
				/// </signature>
				var scope = this,
					scriptElm = document['createElement']('script'),
					headElm = scope._getScriptContainerElement();
				scope.scriptElm = scriptElm;
				scope.requestId = Ajax._requestCounter++;
				scope.callbackName = Ajax._scriptCallbackTmpl + scope.requestId;
				Ajax[scope.callbackName] = function (data) {
					scope._handlerScriptRequestSuccess(data);
				};
				scope._completeUriAndGetParams('get', !0);
				scriptElm['setAttribute']('src', scope.url);
				scope._callBeforeHandlers();
				if (scope.oldIe) {
					scriptElm.attachEvent('onreadystatechange', scope._handlerProviderScriptRequestError());
					scriptElm = headElm['insertAdjacentElement']('beforeEnd', scriptElm);
				} else {
					scriptElm.setAttribute('async', 'async');
					scriptElm.addEventListener('error', scope._handlerProviderScriptRequestError(), !0);
					scriptElm = headElm['appendChild'](scriptElm);
				}
				var result = {
					/**
					 * @property	{string}	url			Full appended &lt;script&gt; tag src attribute value.
					*/
					'url': scope.url,
					/**
					 * @property	{number}	id			Ajax request id.
					*/
					'id': scope.requestId,
					/**
					 * @property	{Function}	abort		Function to abort JSONP request.
					*/
					'abort': function () {
						scope._handlerScriptRequestCleanUp();
						scope._callAbortHandlers();
					}
				};
				return result;
			},
			_handlerScriptRequestSuccess: function (data) {
				var scope = this;
				scope.result.success = !0;
				scope._handlerScriptRequestCleanUp();
				scope.result.data = data;
				scope.success(data, 200, null, scope.requestId, scope.url, scope.type);
				scope._callSuccessHandlers();
			},
			_handlerProviderScriptRequestError: function () {
				var scope = this,
					scriptElm = scope.scriptElm;
				if (scope.oldIe) {
					return function (e) {
						e = e || window.event;
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
				scope.error('', 0, null, null, e, scope.requestId, scope.url, scope.type);
				scope._callErrorHandlers();
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
				method = (method === undefined ? 'get' : method).toLowerCase();
				var scope = this,
					paramsStr = scope._completeUriAndGetParams(method, !1);
				scope.requestId = Ajax._requestCounter++;
				scope.xhr = scope._createXhrInstance();
				scope._processXhrRequestAddListener();
				scope.xhr['open'](method, scope.url, scope.async);
				scope._setUpHeaders();
				scope._callBeforeHandlers();
				scope._processXhrRequestSend(method, paramsStr);
				return scope;
			},
			_processXhrRequestAddListener: function () {
				var scope = this,
					xhr = scope.xhr,
					eventName = 'readystatechange',
					handler = function (e) {
						if (xhr['readyState'] == 4) {
							scope._handlerXhrRequestReadyStatechange(e);
						}
					};
				if (scope.oldIe) {
					scope.xhr['attachEvent']('on'+eventName, handler);
				} else {
					scope.xhr['addEventListener'](eventName, handler);
				}
			},
			_handlerXhrRequestReadyStatechange: function (e) {
				e = e || window.event;
				var scope = this,
					statusCode = scope.xhr['status'];
				if (statusCode > 199 && statusCode < 300){
					scope._processXhrResult();
					scope._processXhrCallbacks();
				} else if (statusCode === 0){
					scope._callAbortHandlers();
				} else {
					scope.result.success = !1;
					scope.errorEvent = e;
					scope.errorObject = new Error('Http Status Code: ' + statusCode);
					scope._processXhrCallbacks();
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
			_processXhrCallbacks: function (e) {
				var scope = this, 
					xhr = scope.xhr,
					args = [];
				if (scope.result.success) {
					args = [
						scope.result.data, xhr['status'], xhr, 
						scope.requestId, scope.url, scope.type
					];
					scope.success.apply(null, args);
					scope._callSuccessHandlers();
				} else {
					args = [
						xhr['responseText'], xhr['status'], xhr, 
						scope.errorEvent, scope.errorObject, 
						scope.requestId, scope.url, scope.type
					];
					scope.error.apply(null, args);
					scope._callErrorHandlers();
					scope._logException();
				}
			},
			_processXhrResult: function () {
				var scope = this;
				if (scope.type == 'auto') scope._processXhrResultDeterminateType();
				scope._processXhrResultByType();
			},
			_processXhrResultByType: function () {
				var scope = this,
					xhr = scope.xhr;
				if (scope.type == 'json') {
					scope._processXhrResultJson();
				} else if (scope.type == 'xml' || scope.type == 'html') {
					scope._processXhrResultXml();
				} else if (scope.type == 'text') {
					scope.result.data = xhr['responseText'];
					scope.result.success = !0;
				}
			},
			_processXhrResultDeterminateType: function () {
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
			_processXhrResultJson: function () {
				var win = window, 
					scope = this,
					responseText = scope.xhr['responseText'];
				if(!win['JSON']) scope._declareJson();
				try {
					scope.result.data = win['JSON']['parse'](responseText);
					scope.result.success = !0;
				} catch (e1) {
					try {
						scope.result.data = (new Function('return '+responseText))();
						scope.result.success = !0;
					} catch (e2) {}
					scope.errorObject = e1;
				}
			},
			_processXhrResultXml: function () {
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
					scope.result.success = !0;
				} catch (e) {
					scope.errorObject = e;
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
			_completeUriAndGetParams: function (method, jsonp) {
				var scope = this,
					dataStr = '',
					qsMark = '?',
					amp = '&',
					eq = '=',
					delimiter = qsMark,
					url = scope.url,
					delimPos = url.indexOf(delimiter);
				method = method.toLowerCase();
				if (method == 'get') {
					dataStr = scope._completeDataString(!0);
					if (delimPos > -1)
						delimiter = (delimPos == url.length - 1) ? '' : amp;
					url += delimiter + dataStr;
					dataStr = '';
				} else {
					dataStr = scope._completeDataString(!1);
				}
				if (!scope.cache)
					url += amp + Ajax['cacheBusterParamName'] + eq + (+new Date);
				if (jsonp)
					url += amp + Ajax['jsonpCallbackParam'] + eq + scope._getLibraryName() + '.' + scope.callbackName;
				scope.url = url;
				return dataStr;
			},
			_completeDataString: function (isGet) {
				var scope = this,
					data = scope.data,
					w = window
				if (typeof(data) == 'string') {
					return data;
				} else {
					if(!w['JSON']) scope._declareJson();
					return this._stringifyDataObject(isGet);
				}
			},
			_stringifyDataObject: function (isGet) {
				var scope = this,
					data = scope.data,
					dataArr = [], 
					dataStr = '',
					w = window,
					encoder = w['encodeURIComponent'];
				for (var key in data) {
					if (typeof(data[key]) == 'object') {
						dataStr = encoder(w['JSON']['stringify'](data[key]))
					} else {
						dataStr = encoder(data[key].toString());
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
				return{'stringify':stringify,'parse':function(text,filter){var j;function walk(k,v){var i,n;if(v&&typeof v==='object'){for(i in v){if(Object.prototype.hasOwnProperty.apply(v,[i])){n=walk(i,v[i]);if(n!==undefined){v[i]=n;}}}}
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
				this._callHandlers(
					'before', 
					scope.type == 'jsonp' 
						? [null] 
						: [scope.xhr]
				);
			},
			_callSuccessHandlers: function () {
				var scope = this,
					xhr = scope.xhr,
					data = scope.result.data;
				this._callHandlers(
					'success', 
					scope.type == 'jsonp' 
						? [data, 200, null] 
						: [data, xhr['status'], xhr]
				);
			},
			_callAbortHandlers: function () {
				var scope = this;
				this._callHandlers(
					'abort', 
					scope.type == 'jsonp' 
						? [null] 
						: [scope.xhr]
				);
			},
			_callErrorHandlers: function () {
				var scope = this, xhr = scope.xhr;
				this._callHandlers(
					'error', 
					scope.type == 'jsonp' 
						? ['', 0, null, null, scope.errorEvent] 
						: [xhr['responseText'], xhr['status'], xhr, scope.errorObj, null]
				);
			},
			_callHandlers: function (handlersKey, args) {
				var handlers = Ajax['handlers'][handlersKey],
					scope = this,
					handler = function () {},
					additionalArgs = [];
				args.push(scope.requestId, scope.url, scope.type);
				for (var i = 0, l = handlers.length; i < l; i += 1) {
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
		return Ajax;
	})();
})(
	typeof(window) !== 'undefined' 
		? window 
		: (
			typeof(global) !== 'undefined'
				? global
				: this
		)
);