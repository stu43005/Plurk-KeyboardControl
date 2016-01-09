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
	 * @param  {Function} scriptText 函數
	 * @param  {object}   args       參數
	 */
	localScript: function(scriptText, args) {
		var args = JSON.stringify(args);
		if (typeof scriptText == 'function')
			scriptText = '(' + scriptText + ')(' + args + ');';

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.appendChild(document.createTextNode(scriptText));
		document.body.appendChild(script);

		setTimeout(function() {
			script.parentNode.removeChild(script);
		}, 1000);
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
			var e = document.createElement('div');
			var t = document.createTextNode(JSON.stringify(window[args.variable]));
			e.id = args.id;
			e.style.display = 'none';
			e.appendChild(t);
			document.body.appendChild(e);
		}, {
			variable: variable,
			id: id
		});

		function retrive() {
			var e = document.getElementById(id);
			if (e) {
				callback(JSON.parse(e.firstChild.nodeValue));
				e.parentNode.removeChild(e);
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
		var style = document.createElement('style');
		style.type = "text/css";
		style.appendChild(document.createTextNode(styleText));
		document.head.appendChild(style);
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
