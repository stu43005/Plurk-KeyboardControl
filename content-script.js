var KeyboardControl = {
	target: null,
	isRenderedHelp: false,
	isShowHelp: false,
	isShowPoster: false,
	isGoto: false,

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
			keys: ["Esc"],
			original: true
		}, {
			label: "展開相片",
			keys: ["o"]
		}, {
			label: "搜尋",
			keys: ["/"]
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
		shortcuts: [{
			label: "所有訊息",
			keys: ["g", "a"]
		}, {
			label: "我發表的訊息",
			keys: ["g", "o"]
		}, {
			label: "私人訊息",
			keys: ["g", "p"]
		}, {
			label: "回應過的訊息",
			keys: ["g", "r"]
		}, {
			label: "喜歡/轉噗的訊息",
			keys: ["g", "l"]
		}]
	}],

	init: function() {
		if (!$("body").hasClass("timeline")) return;

		Utils.createStyle("style.css");

		$(document).bind("keydown", function(e) {
			if ($.inArray(e.target.nodeName.toLowerCase(), ["input", "textarea"]) == -1) {
				if (KeyboardControl.isGoto) {
					var gotoMatch = true;
					switch (e.keyCode) {
						case 65: // a
							KeyboardControl.filterTimeline("all", "all_plurks");
							break;
						case 79: // o
							KeyboardControl.filterTimeline("own", "own_plurks_tab_btn");
							break;
						case 80: // p
							KeyboardControl.filterTimeline("private", "private_plurks_tab_btn");
							break;
						case 82: // r
							KeyboardControl.filterTimeline("responded", "responded_plurks_tab_btn");
							break;
						case 70: // f
						case 76: // l
							KeyboardControl.filterTimeline("favorite", "favorite_plurks_tab_btn");
							break;
						default:
							gotoMatch = false;
							break;
					}
					if (gotoMatch) {
						KeyboardControl.isGoto = false;
						return;
					}
				}

				KeyboardControl.isGoto = (e.keyCode == 71);

				switch (e.keyCode) {
					case 13: // enter
					case 32: // space
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
							e.preventDefault();
							KeyboardControl.showPlurkPoster();
							$("#input_big").focus();
						}
						break;

					case 79: // o
						if (KeyboardControl.target === null) break;
						KeyboardControl.openCBox();
						break;

					case 191:
						if (e.shiftKey) { // ?
							KeyboardControl.showHelp();
						} else { // /
							e.preventDefault();
							$("#navbar_search_kw input").focus();
						}
						break;

					case 27: // esc
						KeyboardControl.closeHelp();
						break;
				}
			} else {
				switch (e.keyCode) {
					case 27: // esc
						KeyboardControl.closePlurkPoster();
						$("input, textarea").blur();
						break;
				}
			}
		}).on("submit", "#pane_plurk", function() {
			KeyboardControl.closePlurkPoster();
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
		if (typeof id === "number") return ($(window).width() - id) / 2;
		return ($(window).width() - $("#" + id).outerWidth()) / 2;
	},

	calcScrollPixels: function(id) {
		return this.calcPosition(id) - $("#" + id).offset().left;
	},

	highlightPlurk: function(id) {
		Utils.localScript(function(args) {
			Plurks.removeCurrentOpen();
			for (var i = 0; i < args.kbc.length; i++) {
				Plurks.__plurkMouseOut(AJS.$(args.kbc[i]));
			}
			Plurks._plurkMouseOver(AJS.$(args.id));
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
				Plurks._plurkMouseOver(AJS.$(args.id));
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
			Plurks.expand(AJS.$(args.id));
		}, {
			id: id || this.target
		});
	},

	filterTimeline: function(timeline, tabId) {
		Utils.localScript(function(args) {
			DisplayOptions.filterTimeline(args.timeline, AJS.$(args.tabId));
		}, {
			timeline: timeline,
			tabId: tabId
		});
	},

	openCBox: function(id) {
		Utils.localScript(function(args) {
			var classList = ["pictureservices", "videoservices", "ogvideo", "iframeembed", "plink"];
			jQuery("#" + args.id).find("." + classList.join(", .")).first().click();
		}, {
			id: id || this.target
		});
	},

	showPlurkPoster: function() {
		if (this.isShowPoster) return;

		this._showOverlay("poster", function() {
			KeyboardControl.closePlurkPoster();
		}, "#layout_body");

		$("#plurk_form").hide().css("left", this.calcPosition(610)).addClass("float_plurk_poster").fadeIn('fast');

		this.isShowPoster = true;
	},

	closePlurkPoster: function() {
		if (!this.isShowPoster) return;

		$("#plurk_form").fadeOut('fast', function() {
			$(this).removeClass("float_plurk_poster").css("left", "").show();
			KeyboardControl._removeOverlay("poster");
		});

		this.isShowPoster = false;
	},

	showHelp: function() {
		if (this.isShowHelp) return;
		if (!this.isRenderedHelp) this._renderHelp();

		this._showOverlay("help", function() {
			KeyboardControl.closeHelp();
		});

		$("#keyboardcontrol_help_dialog").css("left", this.calcPosition(610)).fadeIn('fast');

		this.isShowHelp = true;
	},

	closeHelp: function() {
		if (!this.isRenderedHelp || !this.isShowHelp) return;

		$("#keyboardcontrol_help_dialog").fadeOut('fast', function() {
			KeyboardControl._removeOverlay("help");
		});

		this.isShowHelp = false;
	},

	_renderHelp: function() {
		if (this.isRenderedHelp) return;

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
				html: shortcut.original ? $("<i/>").text(shortcut.label) : shortcut.label
			})]
		});
	},

	_showOverlay: function(overlayId, callback, appendTo) {
		return $("<div/>", {
			"class": "keyboardcontrol_overlay " + overlayId,
			click: callback
		}).appendTo(appendTo || "body");
	},

	_removeOverlay: function(overlayId) {
		$(".keyboardcontrol_overlay." + overlayId).remove();
	}
};

KeyboardControl.init();
