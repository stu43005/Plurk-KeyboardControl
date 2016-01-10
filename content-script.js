var KeyboardControl = {
	target: null,
	isRenderedHelp: false,
	helpList: [{
		title: "動態",
		shortcuts: [{
			label: "新噗文",
			keys: ["n"]
		}, {
			label: "喜歡",
			keys: ["l"]
		}, {
			label: "消音",
			keys: ["b"]
		}, {
			label: "推文",
			keys: ["p"]
		}, {
			label: "轉噗",
			keys: ["r"]
		}, {
			label: "開啟噗文",
			keys: ["Enter"]
		}, {
			label: "關閉噗文",
			keys: ["Esc"]
		}]
	}, {
		title: "導航",
		shortcuts: [{
			label: "此選單",
			keys: ["?"]
		}, {
			label: "下一則噗文",
			keys: ["j"]
		}, {
			label: "之前的噗文",
			keys: ["k"]
		}, {
			label: "載入新噗文",
			keys: ["u"],
			original: true
		}, {
			label: "檢視未讀噗文",
			keys: ["v"],
			original: true
		}]
	}, {
		title: "時間軸",
		shortcuts: []
	}],

	init: function() {
		if (!$("body").hasClass("timeline")) return;

		Utils.createStyle("style.css");

		$(document).bind("keydown", function(e) {
			if ($.inArray(e.target.nodeName.toLowerCase(), ["input", "textarea"])) {
				switch (e.keyCode) {
					case 13: // enter
						if (KeyboardControl.target === null) break;
						e.preventDefault();
						KeyboardControl.expandPlurk();
						break;

					case 75: // k
						e.preventDefault();
						KeyboardControl.selectPrevious();
						break;
					case 74: // j
						e.preventDefault();
						KeyboardControl.selectNext();
						break;

					case 68: // d
						if (KeyboardControl.target === null) break;
						KeyboardControl.deletePlurk();
						break;
					case 69: // e
						if (KeyboardControl.target === null) break;
						KeyboardControl.editPlurk();
						break;
					case 76: // l
						if (KeyboardControl.target === null) break;
						KeyboardControl.likePlurk();
						break;
					case 66: // b
						if (KeyboardControl.target === null) break;
						KeyboardControl.mutePlurk();
						break;
					case 80: // p
						if (KeyboardControl.target === null) break;
						KeyboardControl.promotePlurk();
						break;
					case 82: // r
						if (KeyboardControl.target === null) break;
						KeyboardControl.rePlurk();
						break;

					case 78: // n
						if ($("#form_holder:visible").length < 1) {
							$("#input_big").focus();
							// TODO: 突出輸入區
						}
						break;

					case 191: // ?
						KeyboardControl.showHelp();
						break;
				}
			} else {
				switch (e.keyCode) {
					case 27: // esc
						$("#input_big, #input_small").blur();
						break;
				}
			}
		});
	},

	getPlurks: function() {
		return $("#timeline_cnt div.plurk").sort(Utils.Sort.byOffectLeft());
	},

	selectNext: function() {
		var plurks = this.getPlurks().map(Utils.Map.attr("id"));
		var index = $.inArray(this.target, plurks);
		if (index + 1 < plurks.length) {
			this.target = plurks[index + 1];
		} else {
			// 沒有下一個plurk
		}

		this.highlightPlurk(this.target);
		this.scrollTimeLine(this.calcScrollPixels(this.target));
	},

	selectPrevious: function() {
		var plurks = this.getPlurks().map(Utils.Map.attr("id"));
		var index = $.inArray(this.target, plurks);
		if (index == -1) {
			this.target = plurks[0];
		} else if (index - 1 >= 0) {
			this.target = plurks[index - 1];
		} else {
			// 沒有上一個plurk
		}

		this.highlightPlurk(this.target);
		this.scrollTimeLine(this.calcScrollPixels(this.target));
	},

	calcPosition: function(id) {
		return ($(window).width() - $("#" + id).outerWidth()) / 2;
	},

	calcScrollPixels: function(id) {
		return this.calcPosition(id) - $("#" + id).offset().left;
	},

	highlightPlurk: function(id) {
		Utils.localScript(function(args) {
			Plurks.removeCurrentOpen();
			for (var i = 0; i < args.kbc.length; i++) {
				Plurks.__plurkMouseOut(document.getElementById(args.kbc[i]));
			}
			Plurks._plurkMouseOver(document.getElementById(args.id));
		}, {
			id: id,
			kbc: $(".kbcontrol").map(Utils.Map.attr("id"))
		});

		$(".kbcontrol").removeClass("kbcontrol");
		$("#" + id).addClass("kbcontrol");
	},

	scrollTimeLine: function(pixels) {
		Utils.localScript(function(args) {
			TimeLine.scrollBack(args.pixels);
			TimeLine.prefetchCheck();
		}, {
			pixels: Math.floor(pixels)
		});
	},

	callPlurkFunction: function(func, id) {
		Utils.localScript(function(args) {
			if (args.id !== undefined) {
				Plurks._plurkMouseOver(document.getElementById(args.id));
			}
			Plurks[args.func]();
		}, {
			func: func,
			id: id
		});
	},

	editPlurk: function(id) {
		this.callPlurkFunction("_editPlurk", id);
	},

	deletePlurk: function(id) {
		this.callPlurkFunction("_deletePlurk", id);
	},

	likePlurk: function(id) {
		this.callPlurkFunction("_favoritePlurk", id);
	},

	mutePlurk: function(id) {
		this.callPlurkFunction("_mutePlurk", id);
	},

	promotePlurk: function(id) {
		this.callPlurkFunction("_showPromote", id);
	},

	rePlurk: function(id) {
		this.callPlurkFunction("_replurk", id);
	},

	expandPlurk: function(id) {
		Utils.localScript(function(args) {
			Plurks.expand(document.getElementById(args.id));
		}, {
			id: id || this.target
		});
	},

	showHelp: function() {
		if (!this.isRenderedHelp) this._renderHelp();

		$("#keyboardcontrol_help_overlay").show();
		$("#keyboardcontrol_help_dialog").css("left", ($(window).width() - 610) / 2).fadeIn('fast');
	},

	closeHelp: function() {
		if (!this.isRenderedHelp) return;

		$("#keyboardcontrol_help_dialog").fadeOut('fast', function() {
			$("#keyboardcontrol_help_overlay").hide();
		});
	},

	_renderHelp: function() {
		if (this.isRenderedHelp) return;

		$("<div/>", {
			id: "keyboardcontrol_help_overlay",
			click: function() {
				KeyboardControl.closeHelp();
			}
		}).appendTo("body");

		$("<div/>", {
			id: "keyboardcontrol_help_dialog",
			css: {
				left: ($(window).width() - 610) / 2
			},
			html: [$("<div/>", {
				id: "keyboardcontrol_help_header",
				html: $("<h3/>", {
					id: "keyboardcontrol_help_title",
					text: "鍵盤快速鍵"
				})
			}), $("<div/>", {
				id: "keyboardcontrol_help_body",
				"class": "clearfix",
				html: this.helpList.map(this._renderHelpTable.bind(this))
			})]
		}).appendTo("body");

		this.isRenderedHelp = true;
	},

	_renderHelpTable: function(list) {
		return $("<table/>", {
			html: ["<thead><tr><th colspan=\"2\">" + list.title + "</th></tr></thead>", $("<tbody/>", {
				html: list.shortcuts.map(this._renderHelpTableList.bind(this))
			})]
		});
	},

	_renderHelpTableList: function(shortcut) {
		return $("<tr/>", {
			html: [$("<td/>", {
				"class": "shortcut",
				html: shortcut.keys.map(function(key) {
					return $("<b/>", {
						"class": "sc-key",
						text: key
					});
				})
			}), $("<td/>", {
				"class": "shortcut-label",
				text: shortcut.label
			})]
		});
	}
};

KeyboardControl.init();
