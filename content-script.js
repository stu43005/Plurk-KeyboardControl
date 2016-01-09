var KeyboardControl = {
	target: null,

	init: function() {
		if (!$("body").hasClass("timeline")) return;

		Utils.createStyle(".plurk.kbcontrol .plurk_cnt { border: 1px solid rgba(255,100,0,0.5) !important; }");

		$(document).bind("keydown", function(e) {
			if (e.target.tagName != "TEXTAREA" && e.target.tagName != "INPUT") {
				switch (e.keyCode) {
					case 13: // enter
						// TODO: focus textarea
						break;
					case 27: // esc
						// TODO: focus timeline
						break;
					case 32: // space
						if (KeyboardControl.target === null) break;
						e.preventDefault();
						KeyboardControl.expandPlurk();
						break;
					case 37: // left
					case 38: // up
					case 75: // k
						e.preventDefault();
						KeyboardControl.selectPrevious();
						break;
					case 39: // right
					case 40: // down
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
					case 77: // m
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
	}
};

KeyboardControl.init();