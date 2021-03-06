/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/modules/custom/dkms_contentcollection/dkms_contentcollection.js. */
(function ($) {
	$(document).ready(function () {
		/* FK-TODO: hier passiert das Aufklappen des WEITERLESEN-Textes */
		var $anchors = $('a.cc-learnmore'),
			$sections = $('.cc-section-learnmore');
		$anchors.click(function (event) {
			event.preventDefault();
			var $this = $(this),
				id = $this.attr("href"),
				placeholder_id = id + "_placeholder",
				$targetLearnMore = $(id),
				animationTime = 500,
				$placeholder = $(placeholder_id);
			if (!$placeholder.length) {
				$placeholder = $('<div/>', {
					id: placeholder_id.substring(1)
				});
				$targetLearnMore.after($placeholder)
			};
			var width = jQuery(window).width();
			if (width < 960) {
				$this.blur();
				$this.after($targetLearnMore)
			};
			if ($targetLearnMore.hasClass('open')) {
				$targetLearnMore.slideUp(animationTime).addClass('closed').removeClass('open');
				$this.removeClass('open').addClass('closed')
			} else {
				$sections.filter('.open').slideUp(animationTime).addClass('closed').removeClass('open');
				$anchors.filter('.open').addClass('closed').removeClass('open');
				$targetLearnMore.slideDown(animationTime, function () {
					if (width < 960) {
						var scrollPos = Math.round(jQuery(id).offset().top - 85);
						jQuery('html, body').animate({
							scrollTop: scrollPos
						}, 500)
					};
					bLazy.revalidate()
				}).addClass('open').removeClass('closed');
				$this.removeClass('closed').addClass('open')
			}
		});
		$(window).resize(function () {
			$sections.each(function () {
				var current = $(this),
					current_id = current.attr('id'),
					placeholder_id = current_id + '_placeholder',
					placeholder = $('#' + placeholder_id),
					width = $(window).width();
				if (placeholder.length && width > 959) {
					placeholder.after(current);
					placeholder.remove()
				} else if (!placeholder.length && width < 960) {
					$placeholder = $('<div/>', {
						id: placeholder_id
					});
					current.after($placeholder);
					var $link = $('a[href=#' + current_id + ']').first();
					$link.after(current)
				}
			})
		});
		var $anchor_menu = $('.cc-anchor-menu').first();
		$('#main-header').prepend($anchor_menu);
		if ($anchor_menu.length > 0) {
			function determineOverflow(content, container) {
				var containerMetrics = container.offset(),
					containerMetricsRight = Math.floor(containerMetrics.left + container.width()),
					containerMetricsLeft = Math.floor(containerMetrics.left),
					contentMetrics = content.offset(),
					contentMetricsRight = Math.floor(contentMetrics.left + content.width()),
					contentMetricsLeft = Math.floor(contentMetrics.left);
				if (containerMetricsLeft > contentMetricsLeft && containerMetricsRight < contentMetricsRight) {
					return "both"
				} else if (contentMetricsLeft < containerMetricsLeft) {
					return "left"
				} else if (contentMetricsRight > containerMetricsRight) {
					return "right"
				} else return "none"
			};
			$anchorMenuContent = $('.anchor-menu-content', $anchor_menu);
			$anchor_menu.attr("data-overflowing", determineOverflow($anchorMenuContent, $anchor_menu));
			$anchorNavLeft = $('.anchor-prev', $anchor_menu);
			$anchorNavRight = $('.anchor-next', $anchor_menu);
			$anchorNavLeft.on("click", function () {
				if (determineOverflow($anchorMenuContent, $anchor_menu) === "left" || determineOverflow($anchorMenuContent, $anchor_menu) === "both") {
					var availableScrollLeft = $anchor_menu.scrollLeft;
					$xtrans = $anchorMenuContent.attr('data-xtrans');
					$newxtrans = parseInt($xtrans) + 150;
					$anchorMenuContent.css({
						transform: 'translateX(' + $newxtrans + 'px)'
					});
					$anchorMenuContent.attr('data-xtrans', $newxtrans)
				};
				$anchor_menu.attr("data-overflowing", determineOverflow($anchorMenuContent, $anchor_menu))
			});
			$anchorNavRight.on("click", function () {
				if (determineOverflow($anchorMenuContent, $anchor_menu) === "right" || determineOverflow($anchorMenuContent, $anchor_menu) === "both") {
					$xtrans = $anchorMenuContent.attr('data-xtrans');
					$newxtrans = parseInt($xtrans) - 150;
					$anchorMenuContent.css({
						transform: 'translateX(' + $newxtrans + 'px)'
					});
					$anchorMenuContent.attr('data-xtrans', $newxtrans)
				};
				$anchor_menu.attr("data-overflowing", determineOverflow($anchorMenuContent, $anchor_menu))
			});
			var resizeTimeout, throttle = 50;
			$(window).resize(function () {
				if (!resizeTimeout) resizeTimeout = setTimeout(function () {
					$anchor_menu.attr("data-overflowing", determineOverflow($anchorMenuContent, $anchor_menu));
					resizeTimeout = null
				}, throttle)
			})
		}
	})
})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/modules/custom/dkms_contentcollection/dkms_contentcollection.js. */
; /*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/modules/custom/dkms_contentcollection/js/dkms_contentcollection_field_share.js. */
(function ($) {
	Drupal.behaviors.contentcollectionFieldShare = {
		attach: function (context, settings) {
			var $whatsapp = $('.field-type-dkms-contentcollection .sharing_icons .icon.whatsapp'),
				$instagram = $('.field-type-dkms-contentcollection .sharing_icons .icon.instagram');
			if (navigator.userAgent.match(/Android|iPhone|windows phone/i) && !navigator.userAgent.match(/iPod|iPad/i)) {
				if (navigator.userAgent.match(/Android/i) && (!navigator.userAgent.match(/Mobile/i)));
				else if (navigator.userAgent.match(/Tablet/i));
				else $whatsapp.each(function () {
					$(this).show()
				});
				$instagram.each(function () {
					$(this).show()
				})
			} else {
				$whatsapp.each(function () {
					$(this).remove()
				});
				$instagram.each(function () {
					$(this).remove()
				})
			};
			$('.field-type-dkms-contentcollection .privacy-message .information').each(function () {
				var $this = $(this),
					$message = $('.message', $this),
					$icon = $('.icon', $this);
				$icon.mouseenter(function () {
					$message.show()
				});
				$icon.mouseout(function () {
					$message.hide()
				});
				$icon.click(function () {
					document.location.href = $icon.data("href")
				})
			})
		}
	}
})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/modules/custom/dkms_contentcollection/js/dkms_contentcollection_field_share.js. */
; /*})'"*/
/* Font Face Observer v2.1.0 - © Bram Stein. License: BSD-3-Clause */
(function () {
	'use strict';
	var f, g = [];

	function l(a) {
		g.push(a);
		1 == g.length && f()
	}

	function m() {
		for (; g.length;) g[0](), g.shift()
	}
	f = function () {
		setTimeout(m)
	};

	function n(a) {
		this.a = p;
		this.b = void 0;
		this.f = [];
		var b = this;
		try {
			a(function (a) {
				q(b, a)
			}, function (a) {
				r(b, a)
			})
		} catch (c) {
			r(b, c)
		}
	}
	var p = 2;

	function t(a) {
		return new n(function (b, c) {
			c(a)
		})
	}

	function u(a) {
		return new n(function (b) {
			b(a)
		})
	}

	function q(a, b) {
		if (a.a == p) {
			if (b == a) throw new TypeError;
			var c = !1;
			try {
				var d = b && b.then;
				if (null != b && "object" == typeof b && "function" == typeof d) {
					d.call(b, function (b) {
						c || q(a, b);
						c = !0
					}, function (b) {
						c || r(a, b);
						c = !0
					});
					return
				}
			} catch (e) {
				c || r(a, e);
				return
			}
			a.a = 0;
			a.b = b;
			v(a)
		}
	}

	function r(a, b) {
		if (a.a == p) {
			if (b == a) throw new TypeError;
			a.a = 1;
			a.b = b;
			v(a)
		}
	}

	function v(a) {
		l(function () {
			if (a.a != p)
				for (; a.f.length;) {
					var b = a.f.shift(),
						c = b[0],
						d = b[1],
						e = b[2],
						b = b[3];
					try {
						0 == a.a ? "function" == typeof c ? e(c.call(void 0, a.b)) : e(a.b) : 1 == a.a && ("function" == typeof d ? e(d.call(void 0, a.b)) : b(a.b))
					} catch (h) {
						b(h)
					}
				}
		})
	}
	n.prototype.g = function (a) {
		return this.c(void 0, a)
	};
	n.prototype.c = function (a, b) {
		var c = this;
		return new n(function (d, e) {
			c.f.push([a, b, d, e]);
			v(c)
		})
	};

	function w(a) {
		return new n(function (b, c) {
			function d(c) {
				return function (d) {
					h[c] = d;
					e += 1;
					e == a.length && b(h)
				}
			}
			var e = 0,
				h = [];
			0 == a.length && b(h);
			for (var k = 0; k < a.length; k += 1) u(a[k]).c(d(k), c)
		})
	}

	function x(a) {
		return new n(function (b, c) {
			for (var d = 0; d < a.length; d += 1) u(a[d]).c(b, c)
		})
	};
	window.Promise || (window.Promise = n, window.Promise.resolve = u, window.Promise.reject = t, window.Promise.race = x, window.Promise.all = w, window.Promise.prototype.then = n.prototype.c, window.Promise.prototype["catch"] = n.prototype.g);
}());

(function () {
	function l(a, b) {
		document.addEventListener ? a.addEventListener("scroll", b, !1) : a.attachEvent("scroll", b)
	}

	function m(a) {
		document.body ? a() : document.addEventListener ? document.addEventListener("DOMContentLoaded", function c() {
			document.removeEventListener("DOMContentLoaded", c);
			a()
		}) : document.attachEvent("onreadystatechange", function k() {
			if ("interactive" == document.readyState || "complete" == document.readyState) document.detachEvent("onreadystatechange", k), a()
		})
	};

	function t(a) {
		this.a = document.createElement("div");
		this.a.setAttribute("aria-hidden", "true");
		this.a.appendChild(document.createTextNode(a));
		this.b = document.createElement("span");
		this.c = document.createElement("span");
		this.h = document.createElement("span");
		this.f = document.createElement("span");
		this.g = -1;
		this.b.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
		this.c.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
		this.f.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
		this.h.style.cssText = "display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";
		this.b.appendChild(this.h);
		this.c.appendChild(this.f);
		this.a.appendChild(this.b);
		this.a.appendChild(this.c)
	}

	function u(a, b) {
		a.a.style.cssText = "max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;white-space:nowrap;font-synthesis:none;font:" + b + ";"
	}

	function z(a) {
		var b = a.a.offsetWidth,
			c = b + 100;
		a.f.style.width = c + "px";
		a.c.scrollLeft = c;
		a.b.scrollLeft = a.b.scrollWidth + 100;
		return a.g !== b ? (a.g = b, !0) : !1
	}

	function A(a, b) {
		function c() {
			var a = k;
			z(a) && a.a.parentNode && b(a.g)
		}
		var k = a;
		l(a.b, c);
		l(a.c, c);
		z(a)
	};

	function B(a, b) {
		var c = b || {};
		this.family = a;
		this.style = c.style || "normal";
		this.weight = c.weight || "normal";
		this.stretch = c.stretch || "normal"
	}
	var C = null,
		D = null,
		E = null,
		F = null;

	function G() {
		if (null === D)
			if (J() && /Apple/.test(window.navigator.vendor)) {
				var a = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent);
				D = !!a && 603 > parseInt(a[1], 10)
			} else D = !1;
		return D
	}

	function J() {
		null === F && (F = !!document.fonts);
		return F
	}

	function K() {
		if (null === E) {
			var a = document.createElement("div");
			try {
				a.style.font = "condensed 100px sans-serif"
			} catch (b) {}
			E = "" !== a.style.font
		}
		return E
	}

	function L(a, b) {
		return [a.style, a.weight, K() ? a.stretch : "", "100px", b].join(" ")
	}
	B.prototype.load = function (a, b) {
		var c = this,
			k = a || "BESbswy",
			r = 0,
			n = b || 3E3,
			H = (new Date).getTime();
		return new Promise(function (a, b) {
			if (J() && !G()) {
				var M = new Promise(function (a, b) {
						function e() {
							(new Date).getTime() - H >= n ? b(Error("" + n + "ms timeout exceeded")) : document.fonts.load(L(c, '"' + c.family + '"'), k).then(function (c) {
								1 <= c.length ? a() : setTimeout(e, 25)
							}, b)
						}
						e()
					}),
					N = new Promise(function (a, c) {
						r = setTimeout(function () {
							c(Error("" + n + "ms timeout exceeded"))
						}, n)
					});
				Promise.race([N, M]).then(function () {
						clearTimeout(r);
						a(c)
					},
					b)
			} else m(function () {
				function v() {
					var b;
					if (b = -1 != f && -1 != g || -1 != f && -1 != h || -1 != g && -1 != h)(b = f != g && f != h && g != h) || (null === C && (b = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent), C = !!b && (536 > parseInt(b[1], 10) || 536 === parseInt(b[1], 10) && 11 >= parseInt(b[2], 10))), b = C && (f == w && g == w && h == w || f == x && g == x && h == x || f == y && g == y && h == y)), b = !b;
					b && (d.parentNode && d.parentNode.removeChild(d), clearTimeout(r), a(c))
				}

				function I() {
					if ((new Date).getTime() - H >= n) d.parentNode && d.parentNode.removeChild(d), b(Error(""
						+ n + "ms timeout exceeded"));
					else {
						var a = document.hidden;
						if (!0 === a || void 0 === a) f = e.a.offsetWidth, g = p.a.offsetWidth, h = q.a.offsetWidth, v();
						r = setTimeout(I, 50)
					}
				}
				var e = new t(k),
					p = new t(k),
					q = new t(k),
					f = -1,
					g = -1,
					h = -1,
					w = -1,
					x = -1,
					y = -1,
					d = document.createElement("div");
				d.dir = "ltr";
				u(e, L(c, "sans-serif"));
				u(p, L(c, "serif"));
				u(q, L(c, "monospace"));
				d.appendChild(e.a);
				d.appendChild(p.a);
				d.appendChild(q.a);
				document.body.appendChild(d);
				w = e.a.offsetWidth;
				x = p.a.offsetWidth;
				y = q.a.offsetWidth;
				I();
				A(e, function (a) {
					f = a;
					v()
				});
				u(e,
					L(c, '"' + c.family + '",sans-serif'));
				A(p, function (a) {
					g = a;
					v()
				});
				u(p, L(c, '"' + c.family + '",serif'));
				A(q, function (a) {
					h = a;
					v()
				});
				u(q, L(c, '"' + c.family + '",monospace'))
			})
		})
	};
	"object" === typeof module ? module.exports = B : (window.FontFaceObserver = B, window.FontFaceObserver.prototype.load = B.prototype.load);
}());

; /*})'"*/ ; /*})'"*/
