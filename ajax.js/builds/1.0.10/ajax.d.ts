/**
 * Ajax.JS
 * @author	Tom Flidr | tomflidr(at)gmail(dot)com
 * @url		https://github.com/tomFlidr/ajax.js
 * @licence	https://tomflidr.github.io/ajax.js/LICENCE.txt
 * @version	1.0.7
 * @date	2021-09-01
 * @example
 *
 *    var xhr = Ajax.load(<Ajax.cfg.Load>{
 *       url: 'https://tomflidr.github.io/ajax.js/books.json',
 *       method: 'POST', // GET|POST|OPTION|HEAD...
 *       data: { anything: ["to", "serialize"] },
 *       success: (data?: any, statusCode?: number, xhr?: XMLHttpRequest | null, requestId?: number, url?: string, type?: string) => {},
 *       type: 'json', // json|jsonp|xml|html|text
 *       error: (responseText?: string, statusCode?: number, xhr?: XMLHttpRequest | null, errorObj?: Error | null, errorEvent?: Event | null, requestId?: number, url?: string, type?: string) => {},
 *       headers: {},
 *       async: true
 *    });
 *
 */

/**
 * @summary	Ajax library definition.
 * @type	{Ajax}
 */
declare var Ajax: Ajax;
declare interface Ajax {
	/**
	 * @summary	Global handlers storrages, callbacks used before and after each request or in each request abort.
	 * @type	{object}
	 */
	handlers: {
		before: ((xhr?: XMLHttpRequest | null, requestId?: number, url?: string, type?: string) => void)[],
		success: ((data?: any, statusCode?: number, xhr?: XMLHttpRequest | null, requestId?: number, url?: string, type?: string) => void)[],
		abort: ((xhr?: XMLHttpRequest | null, requestId?: number, url?: string, type?: string) => void)[],
		error: ((responseText?: string, statusCode?: number, xhr?: XMLHttpRequest | null, errorObj?: Error | null, errorEvent?: Event | null, requestId?: number, url?: string, type?: string) => void)[]
	};
	/**
	 * @summary	Request HTTP headers sended by default with each request except JSONP request type.
	 * @type	{object}
	 */
	defaultHeaders: {
		'X-Requested-With': 'XmlHttpRequest',
		'Content-Type': 'application/x-www-form-urlencoded'
	};
	/**
	 * @summary	JSONP callback GET param default name with value: `'callback'`.
	 * @type	{string}
	 */
	jsonpCallbackParam: string;
	/**
	 * @summary	Add global custom callback before any Ajax request type is processed.
	 * @param	{Function}	callback	Required, custom callback called before any Ajax request type. First param is null only for JSONP requests.
	 * @return	{Ajax}					Ajax library definition.
	 */
	beforeLoad (
		callback: (
			xhr?: XMLHttpRequest | null, 
			requestId?: number, 
			url?: string, 
			type?: string
		) => void
	): Ajax;
	/**
	 * @summary	Add global custom callback after any Ajax request type is processed successfully.
	 * @param	{Function}	callback	Required, custom callback called after any Ajax request type is processed successfully. First param is null only for JSONP requests.
	 * @return	{Ajax}					Ajax library definition.
	 */
	onSuccess (
		callback: (
			data?: any,
			statusCode?: number, 
			xhr?: XMLHttpRequest | null, 
			requestId?: number, 
			url?: string, 
			type?: string
		) => void
	): Ajax;
	/**
	 * @summary	Add global custom callback after any Ajax request type is aborted.
	 * @param	{Function}	callback	Required, custom callback called after any Ajax request type is aborted. First param is null only for JSONP requests.
	 * @return	{Ajax}					Ajax library definition.
	 */
	onAbort (
		callback: (
			xhr?: XMLHttpRequest | null, 
			requestId?: number, 
			url?: string, 
			type?: string
		) => void
	): Ajax;
	/**
	 * @summary	Add global custom callback after any Ajax request type is processed with error.
	 * @param	{Function}	callback	Required, custom callback called after any Ajax request type is processed with error. First param is null only for JSONP requests.
	 * @return	{Ajax}					Ajax library definition.
	 */
	onError (
		callback: (
			responseText?: string, 
			statusCode?: number, 
			xhr?: XMLHttpRequest | null, 
			errorObj?: Error | null, 
			errorEvent?: Event | null,
			requestId?: number, 
			url?: string, 
			type?: string
		) => void
	): Ajax;
	/**
	 * @summary	Process background GET/POST/JSONP request by config.
	 * @param	{Ajax.LoadConfig|object}		cfg	Configuration object to process the request.
	 * @return	{XMLHttpRequest|JsonpRequest}		Build in browser request object or JsonpRequest if JSONP request.
	 */
	load (cfg: Ajax.LoadConfig | object): XMLHttpRequest | Ajax.JsonpRequest;
	/**
	 * @summary	Process background GET request with `window.XMLHttpRequest`.
	 * @param	{string}				url						Required. Url string to send the GET request, relative or absolute.
	 * @param	{object}				[data]					Optional, default: `{}`. Object with key/value data to be serialized into query string and sended in post request body, any complext value will be automaticly stringified by JSON.stringify(), (JSON shim is inclided in this Ajax.js library).
	 * @param	{Function}				[success]				Optional, custom callback after everything is done and if response HTTP code is bigger than 199 and lower than 300. Third param is null only for JSONP requests.
	 * @param	{any}					[success.data]			Response data already parsed by `JSON.parse();`.
	 * @param	{number}				[success.statusCode]	HTTP response status code.
	 * @param	{XMLHttpRequest|null}	[success.xhr]			Browser `window.XMLHttpRequest` or `null` if request type is `JSONP`.
	 * @param	{number}				[success.requestId]		Request sequence id.
	 * @param	{string}				[success.url]			Used request url.
	 * @param	{string}				[success.type]			Used request type.
	 * @param	{string}				[type]					Optional, default: `''`. Possible values: JSON, JSONP, XML, HTML, TEXT, if not set, result data will be processed/evaluated/parsed by response Content-Type HTTP header.
	 * @param	{Function}				[error]					Optional, custom callback after everything is done and if response HTTP code is bigger than 199 and lower than 300. Third param is null only for JSONP requests.
	 * @param	{string}				[error.responseText]	Raw response text from server.
	 * @param	{number}				[error.statusCode]		HTTP response status code.
	 * @param	{XMLHttpRequest|null}	[error.xhr]				Browser `window.XMLHttpRequest` or `null` if request type is `JSONP`.
	 * @param	{Error|null}			[error.errorObj]		Browser `Error` or `null` if request type is `JSONP`.
	 * @param	{Event|null}			[error.errorEvent]		`null` or `Event` if request type is `JSONP`.
	 * @param	{number}				[error.requestId]		Request sequence id.
	 * @param	{string}				[error.url]				Used request url.
	 * @param	{string}				[error.type]			Used request type.
	 * @param	{object}				[headers]				Optional, default: `{}`. Custom request HTTP headers to send in request.
	 * @param	{boolean}				[async]					Optional, default: `true`. Use old synchronized request only if you realy know what you are doing.
	 * @return	{XMLHttpRequest|JsonpRequest}					Build in browser request object or JsonpRequest if JSONP request.
	 */
	get (
		url: string,
		data?: object,
		success?: (data?: any, statusCode?: number, xhr?: XMLHttpRequest | null, requestId?: number, url?: string, type?: string) => void,
		type?: 'json' | 'jsonp' | 'xml' | 'html' | 'text',
		error?: (responseText?: string, statusCode?: number, xhr?: XMLHttpRequest | null, errorObj?: Error | null, errorEvent?: Event | null, requestId?: number, url?: string, type?: string) => void,
		headers?: object,
		async?: boolean
	): XMLHttpRequest | Ajax.JsonpRequest;
	/**
	 * @summary	Process background POST request with `window.XMLHttpRequest`.
	 * @param	{string}				url						Required. Url string to send the GET request, relative or absolute.
	 * @param	{object}				[data]					Optional, default: `{}`. Object with key/value data to be serialized into query string and sended in post request body, any complext value will be automaticly stringified by JSON.stringify(), (JSON shim is inclided in this Ajax.js library).
	 * @param	{Function}				[success]				Optional, custom callback after everything is done and if response HTTP code is bigger than 199 and lower than 300. Third param is null only for JSONP requests.
	 * @param	{any}					[success.data]			Response data already parsed by `JSON.parse();`.
	 * @param	{number}				[success.statusCode]	HTTP response status code.
	 * @param	{XMLHttpRequest|null}	[success.xhr]			Browser `window.XMLHttpRequest` or `null` if request type is `JSONP`.
	 * @param	{number}				[success.requestId]		Request sequence id.
	 * @param	{string}				[success.url]			Used request url.
	 * @param	{string}				[success.type]			Used request type.
	 * @param	{string}				[type]					Optional, default: `''`. Possible values: JSON, JSONP, XML, HTML, TEXT, if not set, result data will be processed/evaluated/parsed by response Content-Type HTTP header.
	 * @param	{Function}				[error]					Optional, custom callback after everything is done and if response HTTP code is bigger than 199 and lower than 300. Third param is null only for JSONP requests.
	 * @param	{string}				[error.responseText]	Raw response text from server.
	 * @param	{number}				[error.statusCode]		HTTP response status code.
	 * @param	{XMLHttpRequest|null}	[error.xhr]				Browser `window.XMLHttpRequest` or `null` if request type is `JSONP`.
	 * @param	{Error|null}			[error.errorObj]		Browser `Error` or `null` if request type is `JSONP`.
	 * @param	{Event|null}			[error.errorEvent]		`null` or `Event` if request type is `JSONP`.
	 * @param	{number}				[error.requestId]		Request sequence id.
	 * @param	{string}				[error.url]				Used request url.
	 * @param	{string}				[error.type]			Used request type.
	 * @param	{object}				[headers]				Optional, default: `{}`. Custom request HTTP headers to send in request.
	 * @param	{boolean}				[async]					Optional, default: `true`. Use old synchronized request only if you realy know what you are doing.
	 * @return	{XMLHttpRequest}								Build in browser request object.
	 */
	post (
		url: string,
		data?: object,
		success?: (data?: any, statusCode?: number, xhr?: XMLHttpRequest | null, requestId?: number, url?: string, type?: string) => void,
		type?: 'json' | 'jsonp' | 'xml' | 'html' | 'text',
		error?: (responseText?: string, statusCode?: number, xhr?: XMLHttpRequest | null, errorObj?: Error | null, errorEvent?: Event | null, requestId?: number, url?: string, type?: string) => void,
		headers?: object,
		async?: boolean
	): XMLHttpRequest;
}
declare namespace Ajax {
	/**
	 * JsonpRequest driving object.
	 */
	interface JsonpRequest {
		/**
		 * @summary	Full appended &lt;script&gt; tag src attribute value.
		 * @type	{string}
		 */
		url: string;
		/**
		 * @summary	Request id.
		 * @type	{number}
		 */
		id: number;
		/**
		 * @summary	Function to abort JSONP request.
		 * @return	{void}
		 */
		abort: () => void;
	}
	/**
	 * `Ajax.load(cfg);` method `cfg` param interface.
	 */
	interface LoadConfig {
		/**
		 * @summary	Required, url string to send the GET request, relative or absolute.
		 * @type	{string}
		 */
		url: string;
		/**
		 * @summary	HTTP request method - only if request type is not JSONP.
		 * @type	{string}
		 */
		method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
		/**
		 * @summary	Optional, default: `{}`. Object with key/value data to be serialized into query string and sended in url, any complext value will be automaticly stringified by `JSON.stringify();`, (JSON shim is inclided in this Ajax.js library).
		 * @type	{any}
		 */
		data?: any;
		/**
		 * @summary	Optional, custom callback after everything is done and if response HTTP code is bigger than 199 and lower than 300. Third param is null only for JSONP requests.
		 * @param	{any}					[data]			Response data already parsed by `JSON.parse();`.
		 * @param	{number}				[statusCode]	HTTP response status code.
		 * @param	{XMLHttpRequest|null}	[xhr]			Browser `window.XMLHttpRequest` or `null` if request type is `JSONP`.
		 * @param	{number}				[requestId]		Request sequence id.
		 * @param	{string}				[url]			Used request url.
		 * @param	{string}				[type]			Used request type.
		 * @return	{void}
		 */
		success?: (data?: any, statusCode?: number, xhr?: XMLHttpRequest | null, requestId?: number, url?: string, type?: string) => void;
		/**
		 * @summary	Optional, default: `''`. If not set, result data will be processed/evaluated/parsed by response Content-Type HTTP header.
		 * @type	{string}
		 */
		type?: 'json' | 'jsonp' | 'xml' | 'html' | 'text';
		/**
		 * @summary	Optional, custom callback after everything is done and if response HTTP code is bigger than 199 and lower than 300. Third param is null only for JSONP requests.
		 * @param	{string}				[responseText]	Raw response text from server.
		 * @param	{number}				[statusCode]	HTTP response status code.
		 * @param	{XMLHttpRequest|null}	[xhr]			Browser `window.XMLHttpRequest` or `null` if request type is `JSONP`.
		 * @param	{Error|null}			[errorObj]		Browser `Error` or `null` if request type is `JSONP`.
		 * @param	{Event|null}			[errorEvent]	`null` or `Event` if request type is `JSONP`.
		 * @param	{number}				[requestId]		Request sequence id.
		 * @param	{string}				[url]			Used request url.
		 * @param	{string}				[type]			Used request type.
		 * @return	{void}
		 */
		error?: (responseText?: string, statusCode?: number, xhr?: XMLHttpRequest | null, errorObj?: Error | null, errorEvent?: Event | null, requestId?: number, url?: string, type?: string) => void;
		/**
		 * @summary	Optional, default: `{}`. Custom request HTTP headers to send in request.
		 * @type	{object}
		 */
		headers: object;
		/**
		 * @summary	Optional, default: `true`. Use old synchronized request only if you realy know what you are doing.
		 * @type	{boolean}
		 */
		async: boolean;
	}
}