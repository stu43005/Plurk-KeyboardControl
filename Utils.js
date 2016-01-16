var Utils = {

	arrayClone: function(arr) {
		if (typeof arr == "number" || typeof arr == "string")
			return arr;

		if (arr instanceof Array)
			return $.map(arr, function(obj) {
				return this.arrayClone(obj);
			}.bind(this));

		return $.extend(true, {}, arr);
	},

	/**
	 * 取得 manifest 的資料
	 * @param  {string} name 項目名稱
	 * @return {object}      項目內容
	 */
	getManifest: function(name) {
		return chrome.runtime.getManifest()[name];
	},

	/**
	 * 執行本地腳本
	 * @param  {Function} func     函數
	 * @param  {object}   args     參數
	 * @param  {Function} callback 回調函數
	 */
	localScript: function(func, args, callback) {
		var id = '__localScript__' + (new Date()).getTime();
		var jsonArgs = JSON.stringify(args);
		var scriptText = '(' + func + ')(' + jsonArgs + ');';

		if (typeof callback == 'function') {
			scriptText = "window[\"" + id + "\"] = " + scriptText;
		}

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.appendChild(document.createTextNode(scriptText));
		document.body.appendChild(script);

		setTimeout(function() {
			script.parentNode.removeChild(script);
		}, 1000);

		if (typeof callback == 'function') {
			this.getGlobalVariable(id, callback);
		}
	},

	/**
	 * 取得全域變數
	 * @param  {string}   variable 變數名稱
	 * @param  {Function} callback 回調函數
	 */
	getGlobalVariable: function(variable, callback) {
		if (typeof callback != 'function') return;
		var id = '__getGlobalVariable__' + (new Date()).getTime();
		this.localScript(function(args) {
			var text = JSON.stringify(window[args.variable]);
			var div = document.createElement('div');
			div.id = args.id;
			div.style.display = 'none';
			div.appendChild(document.createTextNode(text));
			document.body.appendChild(div);
		}, {
			variable: variable,
			id: id
		});

		function retrive() {
			var div = document.getElementById(id);
			if (div) {
				callback(JSON.parse(div.firstChild.nodeValue));
				div.parentNode.removeChild(div);
			} else {
				setTimeout(retrive, 500);
			}
		}
		setTimeout(retrive, 500);
	},

	/**
	 * 將CSS樣式表加到網頁中
	 * @param  {string} style CSS樣式表
	 */
	createStyle: function(styleText) {
		if (styleText.endsWith(".css")) {
			var link = document.createElement('link');
			link.rel = "stylesheet";
			link.href = chrome.extension.getURL(styleText);
			link.charset = "utf-8";
			document.head.appendChild(link);
		} else {
			var style = document.createElement('style');
			style.type = "text/css";
			style.appendChild(document.createTextNode(styleText));
			document.head.appendChild(style);
		}
	},

	Map: {

		/**
		 * 使用方式: $("*").map(Utils.Map.attr("id"))
		 * @param  {string}   arg1 要取得的屬性名稱
		 * @return {Function}      給map用的Curry函數
		 */
		attr: function(arg1) {
			var name = arg1;
			return function() {
				return $(this).attr(name);
			};
		}

	},

	Sort: {

		byOffectLeft: function() {
			return function(a, b) {
				return $(a).offset().left - $(b).offset().left;
			};
		}

	}

};
