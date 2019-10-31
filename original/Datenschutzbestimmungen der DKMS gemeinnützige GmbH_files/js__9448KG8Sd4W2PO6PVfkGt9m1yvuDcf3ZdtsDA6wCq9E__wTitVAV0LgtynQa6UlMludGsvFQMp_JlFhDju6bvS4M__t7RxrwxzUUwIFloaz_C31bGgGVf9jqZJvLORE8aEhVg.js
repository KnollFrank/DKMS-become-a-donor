/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/modules/contrib/epsacrop/js/epsacrop.js. */
(function($) {
  Drupal.EPSACrop = {
    api: null,
    preset: null,
    delta: null,
    presets: {},
    init: false,
    dialog: function(type_name, field_name, bundle, delta, img, trueSize) {
      $('body').find('#EPSACropDialog').remove().end().append('<div title="' + Drupal.t("Cropping Image") + '" id="EPSACropDialog"></div>');
      var buttons = {},
        saveLabel = Drupal.t("Apply crop"),
        cancelLabel = Drupal.t("Cancel"),
        pathPrefix = '?q=';
      if (Drupal.settings.pathPrefix !== undefined && Drupal.settings.pathPrefix != '')
        pathPrefix = Drupal.settings.pathPrefix;
      buttons[saveLabel] = function() {
        var token = $('.epsacrop-global').data('token');
        $.post(Drupal.settings.basePath + pathPrefix + 'crop/ajax/put/' + delta + '/' + token, {
          coords: JSON.stringify(Drupal.EPSACrop.presets)
        });
        var field = field_name.replace(/_/g, '-'),
          welem = $('div[id*="' + field + '"]').eq(0);
        if (welem.find('.warning').size() == 0)
          welem.prepend('<div class="tabledrag-changed-warning messages warning">' + Drupal.t("Changes made in image crops will not be saved until the form is submitted.") + '</div>');
        $(this).dialog('close');
        $('#EPSACropDialog').remove()
      };
      buttons[cancelLabel] = function() {
        $(this).dialog('close');
        $('#EPSACropDialog').remove()
      };
      $('#EPSACropDialog').dialog({
        bgiframe: true,
        height: 600,
        width: 850,
        modal: true,
        draggable: false,
        resizable: false,
        overlay: {
          backgroundColor: '#000',
          opacity: 0.6
        },
        buttons: buttons,
        close: function() {
          $('#EPSACropDialog').remove()
        }
      }).load(Drupal.settings.basePath + pathPrefix + 'crop/dialog/' + type_name + '/' + field_name + '/' + bundle + '/' + delta, function() {
        try {
          var item = $('.epsacrop-presets-menu a[class=selected]'),
            preset = item.attr('id'),
            coords = item.attr('rel').split('x'),
            aspectRatio = item.attr('data-aspect-ratio'),
            bgcolor = item.attr('data-bgcolor'),
            bgopacity = parseFloat(item.attr('data-bgopacity')),
            coordinates_data = decodeURIComponent($('.epsacrop-global').data('coordinates')),
            w = parseInt(coords[0]),
            h = parseInt(coords[1]);
          Drupal.EPSACrop.preset = preset;
          if (Drupal.EPSACrop.delta === null || Drupal.EPSACrop.delta !== delta)
            Drupal.EPSACrop.init = false;
          Drupal.EPSACrop.delta = delta;
          presets = Drupal.EPSACrop.presets || {};
          if (Drupal.EPSACrop.init === false && coordinates_data.length > 0) {
            presets = JSON.parse(coordinates_data) || {};
            Drupal.EPSACrop.init = true
          };
          if ((typeof presets[delta] == 'object') && (typeof presets[delta][preset] == 'object'))
            var c = presets[delta][preset];
          if (aspectRatio.length > 0)
            if (aspectRatio.split('/').length == 0) {
              ratios = aspectRatio.split('/');
              aspectRatio = parseInt(ratios[0]) / parseInt(ratios[1])
            } else
              aspectRatio = parseFloat(aspectRatio);
        var target = $('#epsacrop-target');
          target.attr({src: img});
          var targetWait = $('<p>loading...</p>');
          target.parent().append(targetWait);
          target.load(function() {
            targetWait.hide();
            Drupal.EPSACrop.api = $.Jcrop('#' + target.attr('id'), {
              aspectRatio: (aspectRatio.length > 0)
                ? aspectRatio
                : (w / h),
              trueSize: trueSize,
              onSelect: Drupal.EPSACrop.update,
              bgColor: bgcolor,
              bgOpacity: bgopacity,
              keySupport: false
            });
            Drupal.EPSACrop.api.animateTo((
              (typeof c == 'object')
              ? [c.x, c.y, c.x2, c.y2]
              : [0, 0, w, h]), function() {
              if (typeof presets[delta] == 'undefined')
                presets[delta] = {};
              if (typeof presets[delta][preset] == 'undefined')
                presets[delta][preset] = Drupal.EPSACrop.api.tellSelect()
            })
          });
          Drupal.EPSACrop.presets = presets || {}
        } catch (err) {
          alert(Drupal.t("Error on load : @error", {'@error': err.message}))
        }
      })
    },
    crop: function(preset) {
      $('.epsacrop-presets-menu a').removeClass('selected');
      $('.epsacrop-presets-menu a#' + preset).addClass('selected');
      var item = $('.epsacrop-presets-menu a[class=selected]'),
        coords = item.attr('rel').split('x'),
        aspectRatio = item.attr('data-aspect-ratio'),
        bgcolor = item.attr('data-bgcolor'),
        bgopacity = parseFloat(item.attr('data-bgopacity')),
        presets = Drupal.EPSACrop.presets || {},
        delta = Drupal.EPSACrop.delta,
        w = parseInt(coords[0]),
        h = parseInt(coords[1]);
      if (aspectRatio.length > 0)
        if (aspectRatio.split('/').length == 0) {
          ratios = aspectRatio.split('/');
          aspectRatio = parseInt(ratios[0]) / parseInt(ratios[1])
        } else
          aspectRatio = parseFloat(aspectRatio);
    Drupal.EPSACrop.preset = preset;
      if (typeof presets[delta] == 'object' && typeof presets[delta][preset] == 'object') {
        var c = presets[delta][preset];
        Drupal.EPSACrop.api.animateTo([c.x, c.y, c.x2, c.y2])
      } else
        Drupal.EPSACrop.api.animateTo([
          0, 0, w, h
        ], function() {
          if (typeof presets[delta] == 'undefined')
            presets[delta] = {};
          if (typeof presets[delta][preset] == 'undefined')
            presets[delta][preset] = Drupal.EPSACrop.api.tellSelect()
        });
      Drupal.EPSACrop.api.setOptions({
        aspectRatio: (aspectRatio.length > 0)
          ? aspectRatio
          : (w / h),
        bgColor: bgcolor,
        bgOpacity: bgopacity
      })
    },
    update: function(c) {
      var preset = Drupal.EPSACrop.preset,
        delta = Drupal.EPSACrop.delta,
        presets = Drupal.EPSACrop.presets || {};
      if (typeof presets[delta] != 'object')
        presets[delta] = {};
      presets[delta][preset] = c;
      Drupal.EPSACrop.presets = presets
    }
  }
})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/modules/contrib/epsacrop/js/epsacrop.js. */;/* })'" */
/* Font Face Observer v2.1.0 - © Bram Stein. License: BSD-3-Clause */
(function() {
  'use strict';
  var f,
    g = [];
  function l(a) {
    g.push(a);
    1 == g.length && f()
  }
  function m() {
    for (; g.length;)
      g[0](),
      g.shift()
  }
  f = function() {
    setTimeout(m)
  };
  function n(a) {
    this.a = p;
    this.b = void 0;
    this.f = [];
    var b = this;
    try {
      a(function(a) {
        q(b, a)
      }, function(a) {
        r(b, a)
      })
    } catch (c) {
      r(b, c)
    }
  }
  var p = 2;
  function t(a) {
    return new n(function(b, c) {
      c(a)
    })
  }
  function u(a) {
    return new n(function(b) {
      b(a)
    })
  }
  function q(a, b) {
    if (a.a == p) {
      if (b == a)
        throw new TypeError;
      var c = !1;
      try {
        var d = b && b.then;
        if (null != b && "object" == typeof b && "function" == typeof d) {
          d.call(b, function(b) {
            c || q(a, b);
            c = !0
          }, function(b) {
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
      if (b == a)
        throw new TypeError;
      a.a = 1;
      a.b = b;
      v(a)
    }
  }
  function v(a) {
    l(function() {
      if (a.a != p)
        for (; a.f.length;) {
          var b = a.f.shift(),
            c = b[0],
            d = b[1],
            e = b[2],
            b = b[3];
          try {
            0 == a.a
              ? "function" == typeof c
                ? e(c.call(void 0, a.b))
                : e(a.b)
              : 1 == a.a && (
                "function" == typeof d
                ? e(d.call(void 0, a.b))
                : b(a.b))
          } catch (h) {
            b(h)
          }
        }
      })
  }
  n.prototype.g = function(a) {
    return this.c(void 0, a)
  };
  n.prototype.c = function(a, b) {
    var c = this;
    return new n(function(d, e) {
      c.f.push([a, b, d, e]);
      v(c)
    })
  };
  function w(a) {
    return new n(function(b, c) {
      function d(c) {
        return function(d) {
          h[c] = d;
          e += 1;
          e == a.length && b(h)
        }
      }
      var e = 0,
        h = [];
      0 == a.length && b(h);
      for (var k = 0; k < a.length; k += 1)
        u(a[k]).c(d(k), c)
    })
  }
  function x(a) {
    return new n(function(b, c) {
      for (var d = 0; d < a.length; d += 1)
        u(a[d]).c(b, c)
    })
  };
  window.Promise || (window.Promise = n, window.Promise.resolve = u, window.Promise.reject = t, window.Promise.race = x, window.Promise.all = w, window.Promise.prototype.then = n.prototype.c, window.Promise.prototype["catch"] = n.prototype.g);
}());

(function() {
  function l(a, b) {
    document.addEventListener
      ? a.addEventListener("scroll", b, !1)
      : a.attachEvent("scroll", b)
  }
  function m(a) {
    document.body
      ? a()
      : document.addEventListener
        ? document.addEventListener("DOMContentLoaded", function c() {
          document.removeEventListener("DOMContentLoaded", c);
          a()
        })
        : document.attachEvent("onreadystatechange", function k() {
          if ("interactive" == document.readyState || "complete" == document.readyState)
            document.detachEvent("onreadystatechange", k),
            a()
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
    return a.g !== b
      ? (a.g = b, !0)
      : !1
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
      } else
        D = !1;
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
    return [
      a.style, a.weight, K()
        ? a.stretch
        : "",
      "100px",
      b
    ].join(" ")
  }
  B.prototype.load = function(a, b) {
    var c = this,
      k = a || "BESbswy",
      r = 0,
      n = b || 3E3,
      H = (new Date).getTime();
    return new Promise(function(a, b) {
      if (J() && !G()) {
        var M = new Promise(function(a, b) {
            function e() {
              (new Date).getTime() - H >= n
                ? b(Error("" + n + "ms timeout exceeded"))
                : document.fonts.load(L(c, '"' + c.family + '"'), k).then(function(c) {
                  1 <= c.length
                    ? a()
                    : setTimeout(e, 25)
                }, b)
            }
            e()
          }),
          N = new Promise(function(a, c) {
            r = setTimeout(function() {
              c(Error("" + n + "ms timeout exceeded"))
            }, n)
          });
        Promise.race([N, M]).then(function() {
          clearTimeout(r);
          a(c)
        }, b)
      } else
        m(function() {
          function v() {
            var b;
            if (b = -1 != f && -1 != g || -1 != f && -1 != h || -1 != g && -1 != h)
              (b = f != g && f != h && g != h) || (null === C && (b = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent), C = !!b && (536 > parseInt(b[1], 10) || 536 === parseInt(b[1], 10) && 11 >= parseInt(b[2], 10))), b = C && (f == w && g == w && h == w || f == x && g == x && h == x || f == y && g == y && h == y)),
              b = !b;
            b && (d.parentNode && d.parentNode.removeChild(d), clearTimeout(r), a(c))
          }
          function I() {
            if ((new Date).getTime() - H >= n)
              d.parentNode && d.parentNode.removeChild(d),
              b(Error("" + n + "ms timeout exceeded"));
            else {
              var a = document.hidden;
              if (!0 === a || void 0 === a)
                f = e.a.offsetWidth,
                g = p.a.offsetWidth,
                h = q.a.offsetWidth,
                v();
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
          A(e, function(a) {
            f = a;
            v()
          });
          u(e, L(c, '"' + c.family + '",sans-serif'));
          A(p, function(a) {
            g = a;
            v()
          });
          u(p, L(c, '"' + c.family + '",serif'));
          A(q, function(a) {
            h = a;
            v()
          });
          u(q, L(c, '"' + c.family + '",monospace'))
        })
    })
  };
  "object" === typeof module
    ? module.exports = B
    : (window.FontFaceObserver = B, window.FontFaceObserver.prototype.load = B.prototype.load);
}());;/* })'" */;/* })'" */
!function(a, b) {
  function l(a, b) {
    var c = a.createElement("p"),
      d = a.getElementsByTagName("head")[0] || a.documentElement;
    return c.innerHTML = "x<style>" + b + "</style>",
    d.insertBefore(c.lastChild, d.firstChild)
  }
  function m() {
    var a = s.elements;
    return "string" == typeof a
      ? a.split(" ")
      : a
  }
  function n(a) {
    var b = j[a[h]];
    return b || (b = {}, i++, a[h] = i, j[i] = b),
    b
  }
  function o(a, c, d) {
    if (c || (c = b), k)
      return c.createElement(a);
    d || (d = n(c));
    var g;
    return g = d.cache[a]
      ? d.cache[a].cloneNode()
      : f.test(a)
        ? (d.cache[a] = d.createElem(a)).cloneNode()
        : d.createElem(a),
    g.canHaveChildren && !e.test(a)
      ? d.frag.appendChild(g)
      : g
  }
  function p(a, c) {
    if (a || (a = b), k)
      return a.createDocumentFragment();
    c = c || n(a);
    for (var d = c.frag.cloneNode(), e = 0, f = m(), g = f.length; g > e; e++)
      d.createElement(f[e]);
    return d
  }
  function q(a, b) {
    b.cache || (b.cache = {}, b.createElem = a.createElement, b.createFrag = a.createDocumentFragment, b.frag = b.createFrag()),
    a.createElement = function(c) {
      return s.shivMethods
        ? o(c, a, b)
        : b.createElem(c)
    },
    a.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + m().join().replace(/\w+/g, function(a) {
      return b.createElem(a),
      b.frag.createElement(a),
      'c("' + a + '")'
    }) + ");return n}")(s, b.frag)
  }
  function r(a) {
    a || (a = b);
    var c = n(a);
    return !s.shivCSS || g || c.hasCSS || (c.hasCSS = !!l(a, "article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),
    k || q(a, c),
    a
  }
  var g,
    k,
    c = "3.6.2",
    d = a.html5 || {},
    e = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
    f = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
    h = "_html5shiv",
    i = 0,
    j = {};
  !function() {
    try {
      var a = b.createElement("a");
      a.innerHTML = "<xyz></xyz>",
      g = "hidden" in a,
      k = 1 == a.childNodes.length || function() {
        b.createElement("a");
        var a = b.createDocumentFragment();
        return "undefined" == typeof a.cloneNode || "undefined" == typeof a.createDocumentFragment || "undefined" == typeof a.createElement
      }()
    } catch (c) {
      g = !0,
      k = !0
    }
  }();
  var s = {
    elements: d.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",
    version: c,
    shivCSS: d.shivCSS !== !1,
    supportsUnknownElements: k,
    shivMethods: d.shivMethods !== !1,
    type: "default",
    shivDocument: r,
    createElement: o,
    createDocumentFragment: p
  };
  a.html5 = s,
  r(b)
}(this, document);;/* })'" */;/* })'" */
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
/*! NOTE: If you're already including a window.matchMedia polyfill via Modernizr or otherwise, you don't need this part */
window.matchMedia = window.matchMedia || function(a) {
  "use strict";
  var c,
    d = a.documentElement,
    e = d.firstElementChild || d.firstChild,
    f = a.createElement("body"),
    g = a.createElement("div");
  return g.id = "mq-test-1",
  g.style.cssText = "position:absolute;top:-100em",
  f.style.background = "none",
  f.appendChild(g),
  function(a) {
    return g.innerHTML = '&shy;<style media="' + a + '"> #mq-test-1 { width: 42px; }</style>',
    d.insertBefore(f, e),
    c = 42 === g.offsetWidth,
    d.removeChild(f), {
      matches: c,
      media: a
    }
  }
}(document);

/* ! Respond.js v1.1.0: min/max-width media query polyfill. (c) Scott Jehl. MIT/GPLv2 Lic. j.mp/respondjs */
(function(a) {
  "use strict";
  function x() {
    u(!0)
  }
  var b = {};
  if (a.respond = b, b.update = function() {}, b.mediaQueriesSupported = a.matchMedia && a.matchMedia("only all").matches, !b.mediaQueriesSupported) {
    var q,
      r,
      t,
      c = a.document,
      d = c.documentElement,
      e = [],
      f = [],
      g = [],
      h = {},
      i = 30,
      j = c.getElementsByTagName("head")[0] || d,
      k = c.getElementsByTagName("base")[0],
      l = j.getElementsByTagName("link"),
      m = [],
      n = function() {
        for (var b = 0; l.length > b; b++) {
          var c = l[b],
            d = c.href,
            e = c.media,
            f = c.rel && "stylesheet" === c.rel.toLowerCase();
          d && f && !h[d] && (
            c.styleSheet && c.styleSheet.rawCssText
            ? (p(c.styleSheet.rawCssText, d, e), h[d] = !0)
            : (!/^([a-zA-Z:]*\/\/)/.test(d) && !k || d.replace(RegExp.$1, "").split("/")[0] === a.location.host) && m.push({href: d, media: e}))
        }
        o()
      },
      o = function() {
        if (m.length) {
          var b = m.shift();
          v(b.href, function(c) {
            p(c, b.href, b.media),
            h[b.href] = !0,
            a.setTimeout(function() {
              o()
            }, 0)
          })
        }
      },
      p = function(a, b, c) {
        var d = a.match(/@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi),
          g = d && d.length || 0;
        b = b.substring(0, b.lastIndexOf("/"));
        var h = function(a) {
            return a.replace(/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g, "$1" + b + "$2$3")
          },
          i = !g && c;
        b.length && (b += "/"),
        i && (g = 1);
        for (var j = 0; g > j; j++) {
          var k,
            l,
            m,
            n;
          i
            ? (k = c, f.push(h(a)))
            : (k = d[j].match(/@media *([^\{]+)\{([\S\s]+?)$/) && RegExp.$1, f.push(RegExp.$2 && h(RegExp.$2))),
          m = k.split(","),
          n = m.length;
          for (var o = 0; n > o; o++)
            l = m[o],
            e.push({
              media: l.split("(")[0].match(/(only\s+)?([a-zA-Z]+)\s?/) && RegExp.$2 || "all",
              rules: f.length - 1,
              hasquery: l.indexOf("(") > -1,
              minw: l.match(/\(\s*min\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/) && parseFloat(RegExp.$1) + (RegExp.$2 || ""),
              maxw: l.match(/\(\s*max\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/) && parseFloat(RegExp.$1) + (RegExp.$2 || "")
            })
        }
        u()
      },
      s = function() {
        var a,
          b = c.createElement("div"),
          e = c.body,
          f = !1;
        return b.style.cssText = "position:absolute;font-size:1em;width:1em",
        e || (e = f = c.createElement("body"), e.style.background = "none"),
        e.appendChild(b),
        d.insertBefore(e, d.firstChild),
        a = b.offsetWidth,
        f
          ? d.removeChild(e)
          : e.removeChild(b),
        a = t = parseFloat(a)
      },
      u = function(b) {
        var h = "clientWidth",
          k = d[h],
          m = "CSS1Compat" === c.compatMode && k || c.body[h] || k,
          n = {},
          o = l[l.length - 1],
          p = (new Date).getTime();
        if (b && q && i > p - q)
          return a.clearTimeout(r),
          r = a.setTimeout(u, i),
          void 0;
        q = p;
        for (var v in e)
          if (e.hasOwnProperty(v)) {
            var w = e[v],
              x = w.minw,
              y = w.maxw,
              z = null === x,
              A = null === y,
              B = "em";
            x && (x = parseFloat(x) * (
              x.indexOf(B) > -1
              ? t || s()
              : 1)),
            y && (y = parseFloat(y) * (
              y.indexOf(B) > -1
              ? t || s()
              : 1)),
            w.hasquery && (z && A || !(z || m >= x) || !(A || y >= m)) || (n[w.media] || (n[w.media] = []), n[w.media].push(f[w.rules]))
          }
        for (var C in g)
          g.hasOwnProperty(C) && g[C] && g[C].parentNode === j && j.removeChild(g[C]);
        for (var D in n)
          if (n.hasOwnProperty(D)) {
            var E = c.createElement("style"),
              F = n[D].join("\n");
            E.type = "text/css",
            E.media = D,
            j.insertBefore(E, o.nextSibling),
            E.styleSheet
              ? E.styleSheet.cssText = F
              : E.appendChild(c.createTextNode(F)),
            g.push(E)
          }
        },
      v = function(a, b) {
        var c = w();
        c && (c.open("GET", a, !0), c.onreadystatechange = function() {
          4 !== c.readyState || 200 !== c.status && 304 !== c.status || b(c.responseText)
        }, 4 !== c.readyState && c.send(null))
      },
      w = function() {
        var b = !1;
        try {
          b = new a.XMLHttpRequest
        } catch (c) {
          b = new a.ActiveXObject("Microsoft.XMLHTTP")
        }
        return function() {
          return b
        }
      }();
    n(),
    b.update = n,
    a.addEventListener
      ? a.addEventListener("resize", x, !1)
      : a.attachEvent && a.attachEvent("onresize", x)
  }
})(this);;/* })'" */;/* })'" */
var FORMALIZE = function(e, t, n, r) {
  function i(e) {
    var t = n.createElement("b");
    return t.innerHTML = "<!--[if IE " + e + "]><br><![endif]-->",
    !!t.getElementsByTagName("br").length
  }
  var s = "placeholder" in n.createElement("input"),
    o = "autofocus" in n.createElement("input"),
    u = i(6),
    a = i(7);
  return {
    go: function() {
      var e,
        t = this.init;
      for (e in t)
        t.hasOwnProperty(e) && t[e]()
    },
    init: {
      disable_link_button: function() {
        e(n.documentElement).on("click", "a.button_disabled", function() {
          return !1
        })
      },
      full_input_size: function() {
        if (!a || !e("textarea, input.input_full").length)
          return;
        e("textarea, input.input_full").wrap('<span class="input_full_wrap"></span>')
      },
      ie6_skin_inputs: function() {
        if (!u || !e("input, select, textarea").length)
          return;
        var t = /button|submit|reset/,
          n = /date|datetime|datetime-local|email|month|number|password|range|search|tel|text|time|url|week/;
        e("input").each(function() {
          var r = e(this);
          this.getAttribute("type").match(t)
            ? (r.addClass("ie6_button"), this.disabled && r.addClass("ie6_button_disabled"))
            : this.getAttribute("type").match(n) && (r.addClass("ie6_input"), this.disabled && r.addClass("ie6_input_disabled"))
        }),
        e("textarea, select").each(function() {
          this.disabled && e(this).addClass("ie6_input_disabled")
        })
      },
      autofocus: function() {
        if (o || !e(":input[autofocus]").length)
          return;
        var t = e("[autofocus]")[0];
        t.disabled || t.focus()
      },
      placeholder: function() {
        if (s || !e(":input[placeholder]").length)
          return;
        FORMALIZE.misc.add_placeholder(),
        e(":input[placeholder]").each(function() {
          if (this.type === "password")
            return;
          var t = e(this),
            n = t.attr("placeholder");
          t.focus(function() {
            t.val() === n && t.val("").removeClass("placeholder_text")
          }).blur(function() {
            FORMALIZE.misc.add_placeholder()
          }),
          t.closest("form").submit(function() {
            t.val() === n && t.val("").removeClass("placeholder_text")
          }).on("reset", function() {
            setTimeout(FORMALIZE.misc.add_placeholder, 50)
          })
        })
      }
    },
    misc: {
      add_placeholder: function() {
        if (s || !e(":input[placeholder]").length)
          return;
        e(":input[placeholder]").each(function() {
          if (this.type === "password")
            return;
          var t = e(this),
            n = t.attr("placeholder");
          (!t.val() || t.val() === n) && t.val(n).addClass("placeholder_text")
        })
      }
    }
  }
}(jQuery, this, this.document);
jQuery(document).ready(function() {
  FORMALIZE.go()
});/* })'" */;/* })'" */
!function(a, b) {
  "use strict";
  function d(b) {
    a.fn.cycle.debug && e(b)
  }
  function e() {
    window.console && console.log && console.log("[cycle] " + Array.prototype.join.call(arguments, " "))
  }
  function f(b, c, d) {
    var e = a(b).data("cycle.opts");
    if (e) {
      var f = !!b.cyclePause;
      f && e.paused
        ? e.paused(b, e, c, d)
        : !f && e.resumed && e.resumed(b, e, c, d)
    }
  }
  function g(c, d, g) {
    function k(b, c, d) {
      if (!b && c === !0) {
        var f = a(d).data("cycle.opts");
        if (!f)
          return e("options not found, can not resume"),
          !1;
        d.cycleTimeout && (clearTimeout(d.cycleTimeout), d.cycleTimeout = 0),
        n(f.elements, f, 1, !f.backwards)
      }
    }
    if (c.cycleStop === b && (c.cycleStop = 0), (d === b || null === d) && (d = {}), d.constructor == String) {
      switch (d) {
        case "destroy":
        case "stop":
          var h = a(c).data("cycle.opts");
          return h
            ? (c.cycleStop++, c.cycleTimeout && clearTimeout(c.cycleTimeout), c.cycleTimeout = 0, h.elements && a(h.elements).stop(), a(c).removeData("cycle.opts"), "destroy" == d && i(c, h), !1)
            : !1;
        case "toggle":
          return c.cyclePause = 1 === c.cyclePause
            ? 0
            : 1,
          k(c.cyclePause, g, c),
          f(c),
          !1;
        case "pause":
          return c.cyclePause = 1,
          f(c),
          !1;
        case "resume":
          return c.cyclePause = 0,
          k(!1, g, c),
          f(c),
          !1;
        case "prev":
        case "next":
          return (h = a(c).data("cycle.opts"))
            ? ("string" == typeof g && (h.oneTimeFx = g), a.fn.cycle[d](h), !1)
            : (e('options not found, "prev/next" ignored'), !1);
        default:
          d = {
            fx: d
          }
      }
      return d
    }
    if (d.constructor == Number) {
      var j = d;
      return (d = a(c).data("cycle.opts"))
        ? 0 > j || j >= d.elements.length
          ? (e("invalid slide index: " + j), !1)
          : (d.nextSlide = j, c.cycleTimeout && (clearTimeout(c.cycleTimeout), c.cycleTimeout = 0), "string" == typeof g && (d.oneTimeFx = g), n(d.elements, d, 1, j >= d.currSlide), !1)
        : (e("options not found, can not advance slide"), !1)
    }
    return d
  }
  function h(b, c) {
    if (!a.support.opacity && c.cleartype && b.style.filter)
      try {
        b.style.removeAttribute("filter")
      } catch (d) {}
    }
  function i(b, c) {
    c.next && a(c.next).unbind(c.prevNextEvent),
    c.prev && a(c.prev).unbind(c.prevNextEvent),
    (c.pager || c.pagerAnchorBuilder) && a.each(c.pagerAnchors || [], function() {
      this.unbind().remove()
    }),
    c.pagerAnchors = null,
    a(b).unbind("mouseenter.cycle mouseleave.cycle"),
    c.destroy && c.destroy(c)
  }
  function j(c, d, g, i, j) {
    var o,
      s = a.extend(
        {}, a.fn.cycle.defaults, i || {}, a.metadata
        ? c.metadata()
        : a.meta
          ? c.data()
          : {}),
      t = a.isFunction(c.data)
        ? c.data(s.metaAttr)
        : null;
    t && (s = a.extend(s, t)),
    s.autostop && (s.countdown = s.autostopCount || g.length);
    var u = c[0];
    if (
      c.data("cycle.opts", s), s.$cont = c, s.stopCount = u.cycleStop, s.elements = g, s.before = s.before
      ? [s.before]
      : [],
    s.after = s.after
      ? [s.after]
      : [],
    !a.support.opacity && s.cleartype && s.after.push(function() {
      h(this, s)
    }),
    s.continuous && s.after.push(function() {
      n(g, s, 0, !s.backwards)
    }),
    k(s),
    a.support.opacity || !s.cleartype || s.cleartypeNoBg || r(d),
    "static" == c.css("position") && c.css("position", "relative"),
    s.width && c.width(s.width),
    s.height && "auto" != s.height && c.height(s.height),
    s.startingSlide !== b
      ? (
        s.startingSlide = parseInt(s.startingSlide, 10), s.startingSlide >= g.length || s.startSlide < 0
        ? s.startingSlide = 0
        : o = !0)
      : s.startingSlide = s.backwards
        ? g.length - 1
        : 0,
    s.random) {
      s.randomMap = [];
      for (var v = 0; v < g.length; v++)
        s.randomMap.push(v);
      if (s.randomMap.sort(function() {
        return Math.random() - .5
      }), o)
        for (var w = 0; w < g.length; w++)
          s.startingSlide == s.randomMap[w] && (s.randomIndex = w);
    else
        s.randomIndex = 1,
        s.startingSlide = s.randomMap[1]
    } else
      s.startingSlide >= g.length && (s.startingSlide = 0);
    s.currSlide = s.startingSlide || 0;
    var x = s.startingSlide;
    d.css({position: "absolute", top: 0, left: 0}).hide().each(function(b) {
      var c;
      c = s.backwards
        ? x
          ? x >= b
            ? g.length + (b - x)
            : x - b
          : g.length - b
        : x
          ? b >= x
            ? g.length - (b - x)
            : x - b
          : g.length - b,
      a(this).css("z-index", c)
    }),
    a(g[x]).css("opacity", 1).show(),
    h(g[x], s),
    s.fit && (
      s.aspect
      ? d.each(function() {
        var b = a(this),
          c = s.aspect === !0
            ? b.width() / b.height()
            : s.aspect;
        s.width && b.width() != s.width && (b.width(s.width), b.height(s.width / c)),
        s.height && b.height() < s.height && (b.height(s.height), b.width(s.height * c))
      })
      : (s.width && d.width(s.width), s.height && "auto" != s.height && d.height(s.height))),
    !s.center || s.fit && !s.aspect || d.each(function() {
      var b = a(this);
      b.css({
        "margin-left": s.width
          ? (s.width - b.width()) / 2 + "px"
          : 0,
        "margin-top": s.height
          ? (s.height - b.height()) / 2 + "px"
          : 0
      })
    }),
    !s.center || s.fit || s.slideResize || d.each(function() {
      var b = a(this);
      b.css({
        "margin-left": s.width
          ? (s.width - b.width()) / 2 + "px"
          : 0,
        "margin-top": s.height
          ? (s.height - b.height()) / 2 + "px"
          : 0
      })
    });
    var y = (s.containerResize || s.containerResizeHeight) && c.innerHeight() < 1;
    if (y) {
      for (var z = 0, A = 0, B = 0; B < g.length; B++) {
        var C = a(g[B]),
          D = C[0],
          E = C.outerWidth(),
          F = C.outerHeight();
        E || (E = D.offsetWidth || D.width || C.attr("width")),
        F || (F = D.offsetHeight || D.height || C.attr("height")),
        z = E > z
          ? E
          : z,
        A = F > A
          ? F
          : A
      }
      s.containerResize && z > 0 && A > 0 && c.css({
        width: z + "px",
        height: A + "px"
      }),
      s.containerResizeHeight && A > 0 && c.css({
        height: A + "px"
      })
    }
    var G = !1;
    if (s.pause && c.bind("mouseenter.cycle", function() {
      G = !0,
      this.cyclePause++,
      f(u, !0)
    }).bind("mouseleave.cycle", function() {
      G && this.cyclePause--,
      f(u, !0)
    }), l(s) === !1)
      return !1;
    var H = !1;
    if (i.requeueAttempts = i.requeueAttempts || 0, d.each(function() {
      var b = a(this);
      if (
        this.cycleH = s.fit && s.height
        ? s.height
        : b.height() || this.offsetHeight || this.height || b.attr("height") || 0,
      this.cycleW = s.fit && s.width
        ? s.width
        : b.width() || this.offsetWidth || this.width || b.attr("width") || 0,
      b.is("img")) {
        var c = 0 === this.cycleH && 0 === this.cycleW && !this.complete;
        if (c) {
          if (j.s && s.requeueOnImageNotLoaded && ++i.requeueAttempts < 100)
            return e(i.requeueAttempts, " - img slide not loaded, requeuing slideshow: ", this.src, this.cycleW, this.cycleH),
            setTimeout(function() {
              a(j.s, j.c).cycle(i)
            }, s.requeueTimeout),
            H = !0,
            !1;
          e("could not determine size of image: " + this.src, this.cycleW, this.cycleH)
        }
      }
      return !0
    }), H)
      return !1;
    if (s.cssBefore = s.cssBefore || {}, s.cssAfter = s.cssAfter || {}, s.cssFirst = s.cssFirst || {}, s.animIn = s.animIn || {}, s.animOut = s.animOut || {}, d.not(":eq(" + x + ")").css(s.cssBefore), a(d[x]).css(s.cssFirst), s.timeout) {
      s.timeout = parseInt(s.timeout, 10),
      s.speed.constructor == String && (s.speed = a.fx.speeds[s.speed] || parseInt(s.speed, 10)),
      s.sync || (s.speed = s.speed / 2);
      for (
        var I = "none" == s.fx
        ? 0
        : "shuffle" == s.fx
          ? 500
          : 250; s.timeout - s.speed < I;)
        s.timeout += s.speed
    }
    if (
      s.easing && (s.easeIn = s.easeOut = s.easing), s.speedIn || (s.speedIn = s.speed), s.speedOut || (s.speedOut = s.speed), s.slideCount = g.length, s.currSlide = s.lastSlide = x, s.random
      ? (++s.randomIndex == g.length && (s.randomIndex = 0), s.nextSlide = s.randomMap[s.randomIndex])
      : s.nextSlide = s.backwards
        ? 0 === s.startingSlide
          ? g.length - 1
          : s.startingSlide - 1
        : s.startingSlide >= g.length - 1
          ? 0
          : s.startingSlide + 1,
    !s.multiFx) {
      var J = a.fn.cycle.transitions[s.fx];
      if (a.isFunction(J))
        J(c, d, s);
      else if ("custom" != s.fx && !s.multiFx)
        return e("unknown transition: " + s.fx, "; slideshow terminating"),
        !1
    }
    var K = d[x];
    return s.skipInitializationCallbacks || (s.before.length && s.before[0].apply(K, [
      K, K, s, !0
    ]), s.after.length && s.after[0].apply(K, [
      K, K, s, !0
    ])),
    s.next && a(s.next).bind(s.prevNextEvent, function() {
      return p(s, 1)
    }),
    s.prev && a(s.prev).bind(s.prevNextEvent, function() {
      return p(s, 0)
    }),
    (s.pager || s.pagerAnchorBuilder) && q(g, s),
    m(s, g),
    s
  }
  function k(b) {
    b.original = {
      before: [],
      after: []
    },
    b.original.cssBefore = a.extend({}, b.cssBefore),
    b.original.cssAfter = a.extend({}, b.cssAfter),
    b.original.animIn = a.extend({}, b.animIn),
    b.original.animOut = a.extend({}, b.animOut),
    a.each(b.before, function() {
      b.original.before.push(this)
    }),
    a.each(b.after, function() {
      b.original.after.push(this)
    })
  }
  function l(b) {
    var c,
      f,
      g = a.fn.cycle.transitions;
    if (b.fx.indexOf(",") > 0) {
      for (b.multiFx = !0, b.fxs = b.fx.replace(/\s*/g, "").split(","), c = 0; c < b.fxs.length; c++) {
        var h = b.fxs[c];
        f = g[h],
        f && g.hasOwnProperty(h) && a.isFunction(f) || (e("discarding unknown transition: ", h), b.fxs.splice(c, 1), c--)
      }
      if (!b.fxs.length)
        return e("No valid transitions named; slideshow terminating."),
        !1
    } else if ("all" == b.fx) {
      b.multiFx = !0,
      b.fxs = [];
      for (var i in g)
        g.hasOwnProperty(i) && (f = g[i], g.hasOwnProperty(i) && a.isFunction(f) && b.fxs.push(i))
    }
    if (b.multiFx && b.randomizeEffects) {
      var j = Math.floor(20 * Math.random()) + 30;
      for (c = 0; j > c; c++) {
        var k = Math.floor(Math.random() * b.fxs.length);
        b.fxs.push(b.fxs.splice(k, 1)[0])
      }
      d("randomized fx sequence: ", b.fxs)
    }
    return !0
  }
  function m(b, c) {
    b.addSlide = function(d, e) {
      var f = a(d),
        g = f[0];
      b.autostopCount || b.countdown++,
      c[
        e
          ? "unshift"
          : "push"
      ](g),
      b.els && b.els[
        e
          ? "unshift"
          : "push"
      ](g),
      b.slideCount = c.length,
      b.random && (b.randomMap.push(b.slideCount - 1), b.randomMap.sort(function() {
        return Math.random() - .5
      })),
      f.css("position", "absolute"),
      f[
        e
          ? "prependTo"
          : "appendTo"
      ](b.$cont),
      e && (b.currSlide++, b.nextSlide++),
      a.support.opacity || !b.cleartype || b.cleartypeNoBg || r(f),
      b.fit && b.width && f.width(b.width),
      b.fit && b.height && "auto" != b.height && f.height(b.height),
      g.cycleH = b.fit && b.height
        ? b.height
        : f.height(),
      g.cycleW = b.fit && b.width
        ? b.width
        : f.width(),
      f.css(b.cssBefore),
      (b.pager || b.pagerAnchorBuilder) && a.fn.cycle.createPagerAnchor(c.length - 1, g, a(b.pager), c, b),
      a.isFunction(b.onAddSlide)
        ? b.onAddSlide(f)
        : f.hide()
    }
  }
  function n(c, e, f, g) {
    function q() {
      var a = 0;
      e.timeout,
      e.timeout && !e.continuous
        ? (a = o(c[e.currSlide], c[e.nextSlide], e, g), "shuffle" == e.fx && (a -= e.speedOut))
        : e.continuous && h.cyclePause && (a = 10),
      a > 0 && (h.cycleTimeout = setTimeout(function() {
        n(c, e, 0, !e.backwards)
      }, a))
    }
    var h = e.$cont[0],
      i = c[e.currSlide],
      j = c[e.nextSlide];
    if (f && e.busy && e.manualTrump && (d("manualTrump in go(), stopping active transition"), a(c).stop(!0, !0), e.busy = 0, clearTimeout(h.cycleTimeout)), e.busy)
      return d("transition active, ignoring new tx request"),
      void 0;
    if (h.cycleStop == e.stopCount && (0 !== h.cycleTimeout || f)) {
      if (!f && !h.cyclePause && !e.bounce && (e.autostop && --e.countdown <= 0 || e.nowrap && !e.random && e.nextSlide < e.currSlide))
        return e.end && e.end(e),
        void 0;
      var k = !1;
      if (!f && h.cyclePause || e.nextSlide == e.currSlide)
        q();
      else {
        k = !0;
        var l = e.fx;
        i.cycleH = i.cycleH || a(i).height(),
        i.cycleW = i.cycleW || a(i).width(),
        j.cycleH = j.cycleH || a(j).height(),
        j.cycleW = j.cycleW || a(j).width(),
        e.multiFx && (
          g && (e.lastFx === b || ++e.lastFx >= e.fxs.length)
          ? e.lastFx = 0
          : !g && (e.lastFx === b || --e.lastFx < 0) && (e.lastFx = e.fxs.length - 1),
        l = e.fxs[e.lastFx]),
        e.oneTimeFx && (l = e.oneTimeFx, e.oneTimeFx = null),
        a.fn.cycle.resetState(e, l),
        e.before.length && a.each(e.before, function(a, b) {
          h.cycleStop == e.stopCount && b.apply(j, [i, j, e, g])
        });
        var m = function() {
          e.busy = 0,
          a.each(e.after, function(a, b) {
            h.cycleStop == e.stopCount && b.apply(j, [i, j, e, g])
          }),
          h.cycleStop || q()
        };
        d("tx firing(" + l + "); currSlide: " + e.currSlide + "; nextSlide: " + e.nextSlide),
        e.busy = 1,
        e.fxFn
          ? e.fxFn(i, j, e, m, g, f && e.fastOnEvent)
          : a.isFunction(a.fn.cycle[e.fx])
            ? a.fn.cycle[e.fx](i, j, e, m, g, f && e.fastOnEvent)
            : a.fn.cycle.custom(i, j, e, m, g, f && e.fastOnEvent)
      }
      if (k || e.nextSlide == e.currSlide) {
        var p;
        e.lastSlide = e.currSlide,
        e.random
          ? (e.currSlide = e.nextSlide, ++e.randomIndex == c.length && (e.randomIndex = 0, e.randomMap.sort(function() {
            return Math.random() - .5
          })), e.nextSlide = e.randomMap[e.randomIndex], e.nextSlide == e.currSlide && (
            e.nextSlide = e.currSlide == e.slideCount - 1
            ? 0
            : e.currSlide + 1))
          : e.backwards
            ? (
              p = e.nextSlide - 1 < 0, p && e.bounce
              ? (e.backwards = !e.backwards, e.nextSlide = 1, e.currSlide = 0)
              : (
                e.nextSlide = p
                ? c.length - 1
                : e.nextSlide - 1,
              e.currSlide = p
                ? 0
                : e.nextSlide + 1))
            : (
              p = e.nextSlide + 1 == c.length, p && e.bounce
              ? (e.backwards = !e.backwards, e.nextSlide = c.length - 2, e.currSlide = c.length - 1)
              : (
                e.nextSlide = p
                ? 0
                : e.nextSlide + 1,
              e.currSlide = p
                ? c.length - 1
                : e.nextSlide - 1))
      }
      k && e.pager && e.updateActivePagerLink(e.pager, e.currSlide, e.activePagerClass)
    }
  }
  function o(a, b, c, e) {
    if (c.timeoutFn) {
      for (var f = c.timeoutFn.call(a, a, b, c, e); "none" != c.fx && f - c.speed < 250;)
        f += c.speed;
      if (d("calculated timeout: " + f + "; speed: " + c.speed), f !== !1)
        return f
    }
    return c.timeout
  }
  function p(b, c) {
    var d = c
        ? 1
        : -1,
      e = b.elements,
      f = b.$cont[0],
      g = f.cycleTimeout;
    if (g && (clearTimeout(g), f.cycleTimeout = 0), b.random && 0 > d)
      b.randomIndex--,
      -2 == --b.randomIndex
        ? b.randomIndex = e.length - 2
        : -1 == b.randomIndex && (b.randomIndex = e.length - 1),
      b.nextSlide = b.randomMap[b.randomIndex];
    else if (b.random)
      b.nextSlide = b.randomMap[b.randomIndex];
    else if (b.nextSlide = b.currSlide + d, b.nextSlide < 0) {
      if (b.nowrap)
        return !1;
      b.nextSlide = e.length - 1
    } else if (b.nextSlide >= e.length) {
      if (b.nowrap)
        return !1;
      b.nextSlide = 0
    }
    var h = b.onPrevNextEvent || b.prevNextClick;
    return a.isFunction(h) && h(d > 0, b.nextSlide, e[b.nextSlide]),
    n(e, b, 1, c),
    !1
  }
  function q(b, c) {
    var d = a(c.pager);
    a.each(b, function(e, f) {
      a.fn.cycle.createPagerAnchor(e, f, d, b, c)
    }),
    c.updateActivePagerLink(c.pager, c.startingSlide, c.activePagerClass)
  }
  function r(b) {
    function c(a) {
      return a = parseInt(a, 10).toString(16),
      a.length < 2
        ? "0" + a
        : a
    }
    function e(b) {
      for (; b && "html" != b.nodeName.toLowerCase(); b = b.parentNode) {
        var d = a.css(b, "background-color");
        if (d && d.indexOf("rgb") >= 0) {
          var e = d.match(/\d+/g);
          return "#" + c(e[0]) + c(e[1]) + c(e[2])
        }
        if (d && "transparent" != d)
          return d
      }
      return "#ffffff"
    }
    d("applying clearType background-color hack"),
    b.each(function() {
      a(this).css("background-color", e(this))
    })
  }
  var c = "3.0.3";
  a.expr[":"].paused = function(a) {
    return a.cyclePause
  },
  a.fn.cycle = function(b, c) {
    var f = {
      s: this.selector,
      c: this.context
    };
    return 0 === this.length && "stop" != b
      ? !a.isReady && f.s
        ? (e("DOM not ready, queuing slideshow"), a(function() {
          a(f.s, f.c).cycle(b, c)
        }), this)
        : (e("terminating; zero elements found by selector" + (
          a.isReady
          ? ""
          : " (DOM not ready)")), this)
      : this.each(function() {
        var h = g(this, b, c);
        if (h !== !1) {
          h.updateActivePagerLink = h.updateActivePagerLink || a.fn.cycle.updateActivePagerLink,
          this.cycleTimeout && clearTimeout(this.cycleTimeout),
          this.cycleTimeout = this.cyclePause = 0,
          this.cycleStop = 0;
          var i = a(this),
            k = h.slideExpr
              ? a(h.slideExpr, this)
              : i.children(),
            l = k.get();
          if (l.length < 2)
            return e("terminating; too few slides: " + l.length),
            void 0;
          var m = j(i, k, l, h, f);
          if (m !== !1) {
            var p = m.continuous
              ? 10
              : o(l[m.currSlide], l[m.nextSlide], m, !m.backwards);
            p && (p += m.delay || 0, 10 > p && (p = 10), d("first timeout: " + p), this.cycleTimeout = setTimeout(function() {
              n(l, m, 0, !h.backwards)
            }, p))
          }
        }
      })
  },
  a.fn.cycle.resetState = function(b, c) {
    c = c || b.fx,
    b.before = [],
    b.after = [],
    b.cssBefore = a.extend({}, b.original.cssBefore),
    b.cssAfter = a.extend({}, b.original.cssAfter),
    b.animIn = a.extend({}, b.original.animIn),
    b.animOut = a.extend({}, b.original.animOut),
    b.fxFn = null,
    a.each(b.original.before, function() {
      b.before.push(this)
    }),
    a.each(b.original.after, function() {
      b.after.push(this)
    });
    var d = a.fn.cycle.transitions[c];
    a.isFunction(d) && d(b.$cont, a(b.elements), b)
  },
  a.fn.cycle.updateActivePagerLink = function(b, c, d) {
    a(b).each(function() {
      a(this).children().removeClass(d).eq(c).addClass(d)
    })
  },
  a.fn.cycle.next = function(a) {
    p(a, 1)
  },
  a.fn.cycle.prev = function(a) {
    p(a, 0)
  },
  a.fn.cycle.createPagerAnchor = function(b, c, e, g, h) {
    var i;
    if (
      a.isFunction(h.pagerAnchorBuilder)
      ? (i = h.pagerAnchorBuilder(b, c), d("pagerAnchorBuilder(" + b + ", el) returned: " + i))
      : i = '<a href="#">' + (
      b + 1) + "</a>",
    i) {
      var j = a(i);
      if (0 === j.parents("body").length) {
        var k = [];
        e.length > 1
          ? (e.each(function() {
            var b = j.clone(!0);
            a(this).append(b),
            k.push(b[0])
          }), j = a(k))
          : j.appendTo(e)
      }
      h.pagerAnchors = h.pagerAnchors || [],
      h.pagerAnchors.push(j);
      var l = function(c) {
        c.preventDefault(),
        h.nextSlide = b;
        var d = h.$cont[0],
          e = d.cycleTimeout;
        e && (clearTimeout(e), d.cycleTimeout = 0);
        var f = h.onPagerEvent || h.pagerClick;
        a.isFunction(f) && f(h.nextSlide, g[h.nextSlide]),
        n(g, h, 1, h.currSlide < b)
      };
      /mouseenter|mouseover/i.test(h.pagerEvent)
        ? j.hover(l, function() {})
        : j.bind(h.pagerEvent, l),
      /^click/.test(h.pagerEvent) || h.allowPagerClickBubble || j.bind("click.cycle", function() {
        return !1
      });
      var m = h.$cont[0],
        o = !1;
      h.pauseOnPagerHover && j.hover(function() {
        o = !0,
        m.cyclePause++,
        f(m, !0, !0)
      }, function() {
        o && m.cyclePause--,
        f(m, !0, !0)
      })
    }
  },
  a.fn.cycle.hopsFromLast = function(a, b) {
    var c,
      d = a.lastSlide,
      e = a.currSlide;
    return c = b
      ? e > d
        ? e - d
        : a.slideCount - d
      : d > e
        ? d - e
        : d + a.slideCount - e
  },
  a.fn.cycle.commonReset = function(b, c, d, e, f, g) {
    a(d.elements).not(b).hide(),
    "undefined" == typeof d.cssBefore.opacity && (d.cssBefore.opacity = 1),
    d.cssBefore.display = "block",
    d.slideResize && e !== !1 && c.cycleW > 0 && (d.cssBefore.width = c.cycleW),
    d.slideResize && f !== !1 && c.cycleH > 0 && (d.cssBefore.height = c.cycleH),
    d.cssAfter = d.cssAfter || {},
    d.cssAfter.display = "none",
    a(b).css("zIndex", d.slideCount + (
      g === !0
      ? 1
      : 0)),
    a(c).css("zIndex", d.slideCount + (
      g === !0
      ? 0
      : 1))
  },
  a.fn.cycle.custom = function(b, c, d, e, f, g) {
    var h = a(b),
      i = a(c),
      j = d.speedIn,
      k = d.speedOut,
      l = d.easeIn,
      m = d.easeOut,
      n = d.animInDelay,
      o = d.animOutDelay;
    i.css(d.cssBefore),
    g && (
      j = k = "number" == typeof g
      ? g
      : 1,
    l = m = null);
    var p = function() {
      i.delay(n).animate(d.animIn, j, l, function() {
        e()
      })
    };
    h.delay(o).animate(d.animOut, k, m, function() {
      h.css(d.cssAfter),
      d.sync || p()
    }),
    d.sync && p()
  },
  a.fn.cycle.transitions = {
    fade: function(b, c, d) {
      c.not(":eq(" + d.currSlide + ")").css("opacity", 0),
      d.before.push(function(b, c, d) {
        a.fn.cycle.commonReset(b, c, d),
        d.cssBefore.opacity = 0
      }),
      d.animIn = {
        opacity: 1
      },
      d.animOut = {
        opacity: 0
      },
      d.cssBefore = {
        top: 0,
        left: 0
      }
    }
  },
  a.fn.cycle.ver = function() {
    return c
  },
  a.fn.cycle.defaults = {
    activePagerClass: "activeSlide",
    after: null,
    allowPagerClickBubble: !1,
    animIn: null,
    animInDelay: 0,
    animOut: null,
    animOutDelay: 0,
    aspect: !1,
    autostop: 0,
    autostopCount: 0,
    backwards: !1,
    before: null,
    center: null,
    cleartype: !a.support.opacity,
    cleartypeNoBg: !1,
    containerResize: 1,
    containerResizeHeight: 0,
    continuous: 0,
    cssAfter: null,
    cssBefore: null,
    delay: 0,
    easeIn: null,
    easeOut: null,
    easing: null,
    end: null,
    fastOnEvent: 0,
    fit: 0,
    fx: "fade",
    fxFn: null,
    height: "auto",
    manualTrump: !0,
    metaAttr: "cycle",
    next: null,
    nowrap: 0,
    onPagerEvent: null,
    onPrevNextEvent: null,
    pager: null,
    pagerAnchorBuilder: null,
    pagerEvent: "click.cycle",
    pause: 0,
    pauseOnPagerHover: 0,
    prev: null,
    prevNextEvent: "click.cycle",
    random: 0,
    randomizeEffects: 1,
    requeueOnImageNotLoaded: !0,
    requeueTimeout: 250,
    rev: 0,
    shuffle: null,
    skipInitializationCallbacks: !1,
    slideExpr: null,
    slideResize: 1,
    speed: 1e3,
    speedIn: null,
    speedOut: null,
    startingSlide: b,
    sync: 1,
    timeout: 4e3,
    timeoutFn: null,
    updateActivePagerLink: null,
    width: null
  }
}(jQuery),
function(a) {
  "use strict";
  a.fn.cycle.transitions.none = function(b, c, d) {
    d.fxFn = function(b, c, d, e) {
      a(c).show(),
      a(b).hide(),
      e()
    }
  },
  a.fn.cycle.transitions.fadeout = function(b, c, d) {
    c.not(":eq(" + d.currSlide + ")").css({display: "block", opacity: 1}),
    d.before.push(function(b, c, d, e, f, g) {
      a(b).css("zIndex", d.slideCount + (
        g !== !0
        ? 1
        : 0)),
      a(c).css("zIndex", d.slideCount + (
        g !== !0
        ? 0
        : 1))
    }),
    d.animIn.opacity = 1,
    d.animOut.opacity = 0,
    d.cssBefore.opacity = 1,
    d.cssBefore.display = "block",
    d.cssAfter.zIndex = 0
  },
  a.fn.cycle.transitions.scrollUp = function(b, c, d) {
    b.css("overflow", "hidden"),
    d.before.push(a.fn.cycle.commonReset);
    var e = b.height();
    d.cssBefore.top = e,
    d.cssBefore.left = 0,
    d.cssFirst.top = 0,
    d.animIn.top = 0,
    d.animOut.top = -e
  },
  a.fn.cycle.transitions.scrollDown = function(b, c, d) {
    b.css("overflow", "hidden"),
    d.before.push(a.fn.cycle.commonReset);
    var e = b.height();
    d.cssFirst.top = 0,
    d.cssBefore.top = -e,
    d.cssBefore.left = 0,
    d.animIn.top = 0,
    d.animOut.top = e
  },
  a.fn.cycle.transitions.scrollLeft = function(b, c, d) {
    b.css("overflow", "hidden"),
    d.before.push(a.fn.cycle.commonReset);
    var e = b.width();
    d.cssFirst.left = 0,
    d.cssBefore.left = e,
    d.cssBefore.top = 0,
    d.animIn.left = 0,
    d.animOut.left = 0 - e
  },
  a.fn.cycle.transitions.scrollRight = function(b, c, d) {
    b.css("overflow", "hidden"),
    d.before.push(a.fn.cycle.commonReset);
    var e = b.width();
    d.cssFirst.left = 0,
    d.cssBefore.left = -e,
    d.cssBefore.top = 0,
    d.animIn.left = 0,
    d.animOut.left = e
  },
  a.fn.cycle.transitions.scrollHorz = function(b, c, d) {
    b.css("overflow", "hidden").width(),
    d.before.push(function(b, c, d, e) {
      d.rev && (e = !e),
      a.fn.cycle.commonReset(b, c, d),
      d.cssBefore.left = e
        ? c.cycleW - 1
        : 1 - c.cycleW,
      d.animOut.left = e
        ? -b.cycleW
        : b.cycleW
    }),
    d.cssFirst.left = 0,
    d.cssBefore.top = 0,
    d.animIn.left = 0,
    d.animOut.top = 0
  },
  a.fn.cycle.transitions.scrollVert = function(b, c, d) {
    b.css("overflow", "hidden"),
    d.before.push(function(b, c, d, e) {
      d.rev && (e = !e),
      a.fn.cycle.commonReset(b, c, d),
      d.cssBefore.top = e
        ? 1 - c.cycleH
        : c.cycleH - 1,
      d.animOut.top = e
        ? b.cycleH
        : -b.cycleH
    }),
    d.cssFirst.top = 0,
    d.cssBefore.left = 0,
    d.animIn.top = 0,
    d.animOut.left = 0
  },
  a.fn.cycle.transitions.slideX = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a(d.elements).not(b).hide(),
      a.fn.cycle.commonReset(b, c, d, !1, !0),
      d.animIn.width = c.cycleW
    }),
    d.cssBefore.left = 0,
    d.cssBefore.top = 0,
    d.cssBefore.width = 0,
    d.animIn.width = "show",
    d.animOut.width = 0
  },
  a.fn.cycle.transitions.slideY = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a(d.elements).not(b).hide(),
      a.fn.cycle.commonReset(b, c, d, !0, !1),
      d.animIn.height = c.cycleH
    }),
    d.cssBefore.left = 0,
    d.cssBefore.top = 0,
    d.cssBefore.height = 0,
    d.animIn.height = "show",
    d.animOut.height = 0
  },
  a.fn.cycle.transitions.shuffle = function(b, c, d) {
    var e,
      f = b.css("overflow", "visible").width();
    for (c.css({left: 0, top: 0}), d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !0, !0, !0)
    }), d.speedAdjusted || (d.speed = d.speed / 2, d.speedAdjusted = !0), d.random = 0, d.shuffle = d.shuffle || {
      left: -f,
      top: 15
    }, d.els = [], e = 0; e < c.length; e++)
      d.els.push(c[e]);
    for (e = 0; e < d.currSlide; e++)
      d.els.push(d.els.shift());
    d.fxFn = function(b, c, d, e, f) {
      d.rev && (f = !f);
      var g = f
        ? a(b)
        : a(c);
      a(c).css(d.cssBefore);
      var h = d.slideCount;
      g.animate(d.shuffle, d.speedIn, d.easeIn, function() {
        for (var c = a.fn.cycle.hopsFromLast(d, f), i = 0; c > i; i++)
          f
            ? d.els.push(d.els.shift())
            : d.els.unshift(d.els.pop());
        if (f)
          for (var j = 0, k = d.els.length; k > j; j++)
            a(d.els[j]).css("z-index", k - j + h);
          else {
            var l = a(b).css("z-index");
            g.css("z-index", parseInt(l, 10) + 1 + h)
          }
        g.animate({
          left: 0,
          top: 0
        }, d.speedOut, d.easeOut, function() {
          a(
            f
            ? this
            : b).hide(),
          e && e()
        })
      })
    },
    a.extend(d.cssBefore, {
      display: "block",
      opacity: 1,
      top: 0,
      left: 0
    })
  },
  a.fn.cycle.transitions.turnUp = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !0, !1),
      d.cssBefore.top = c.cycleH,
      d.animIn.height = c.cycleH,
      d.animOut.width = c.cycleW
    }),
    d.cssFirst.top = 0,
    d.cssBefore.left = 0,
    d.cssBefore.height = 0,
    d.animIn.top = 0,
    d.animOut.height = 0
  },
  a.fn.cycle.transitions.turnDown = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !0, !1),
      d.animIn.height = c.cycleH,
      d.animOut.top = b.cycleH
    }),
    d.cssFirst.top = 0,
    d.cssBefore.left = 0,
    d.cssBefore.top = 0,
    d.cssBefore.height = 0,
    d.animOut.height = 0
  },
  a.fn.cycle.transitions.turnLeft = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !1, !0),
      d.cssBefore.left = c.cycleW,
      d.animIn.width = c.cycleW
    }),
    d.cssBefore.top = 0,
    d.cssBefore.width = 0,
    d.animIn.left = 0,
    d.animOut.width = 0
  },
  a.fn.cycle.transitions.turnRight = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !1, !0),
      d.animIn.width = c.cycleW,
      d.animOut.left = b.cycleW
    }),
    a.extend(d.cssBefore, {
      top: 0,
      left: 0,
      width: 0
    }),
    d.animIn.left = 0,
    d.animOut.width = 0
  },
  a.fn.cycle.transitions.zoom = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !1, !1, !0),
      d.cssBefore.top = c.cycleH / 2,
      d.cssBefore.left = c.cycleW / 2,
      a.extend(d.animIn, {
        top: 0,
        left: 0,
        width: c.cycleW,
        height: c.cycleH
      }),
      a.extend(d.animOut, {
        width: 0,
        height: 0,
        top: b.cycleH / 2,
        left: b.cycleW / 2
      })
    }),
    d.cssFirst.top = 0,
    d.cssFirst.left = 0,
    d.cssBefore.width = 0,
    d.cssBefore.height = 0
  },
  a.fn.cycle.transitions.fadeZoom = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !1, !1),
      d.cssBefore.left = c.cycleW / 2,
      d.cssBefore.top = c.cycleH / 2,
      a.extend(d.animIn, {
        top: 0,
        left: 0,
        width: c.cycleW,
        height: c.cycleH
      })
    }),
    d.cssBefore.width = 0,
    d.cssBefore.height = 0,
    d.animOut.opacity = 0
  },
  a.fn.cycle.transitions.blindX = function(b, c, d) {
    var e = b.css("overflow", "hidden").width();
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d),
      d.animIn.width = c.cycleW,
      d.animOut.left = b.cycleW
    }),
    d.cssBefore.left = e,
    d.cssBefore.top = 0,
    d.animIn.left = 0,
    d.animOut.left = e
  },
  a.fn.cycle.transitions.blindY = function(b, c, d) {
    var e = b.css("overflow", "hidden").height();
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d),
      d.animIn.height = c.cycleH,
      d.animOut.top = b.cycleH
    }),
    d.cssBefore.top = e,
    d.cssBefore.left = 0,
    d.animIn.top = 0,
    d.animOut.top = e
  },
  a.fn.cycle.transitions.blindZ = function(b, c, d) {
    var e = b.css("overflow", "hidden").height(),
      f = b.width();
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d),
      d.animIn.height = c.cycleH,
      d.animOut.top = b.cycleH
    }),
    d.cssBefore.top = e,
    d.cssBefore.left = f,
    d.animIn.top = 0,
    d.animIn.left = 0,
    d.animOut.top = e,
    d.animOut.left = f
  },
  a.fn.cycle.transitions.growX = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !1, !0),
      d.cssBefore.left = this.cycleW / 2,
      d.animIn.left = 0,
      d.animIn.width = this.cycleW,
      d.animOut.left = 0
    }),
    d.cssBefore.top = 0,
    d.cssBefore.width = 0
  },
  a.fn.cycle.transitions.growY = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !0, !1),
      d.cssBefore.top = this.cycleH / 2,
      d.animIn.top = 0,
      d.animIn.height = this.cycleH,
      d.animOut.top = 0
    }),
    d.cssBefore.height = 0,
    d.cssBefore.left = 0
  },
  a.fn.cycle.transitions.curtainX = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !1, !0, !0),
      d.cssBefore.left = c.cycleW / 2,
      d.animIn.left = 0,
      d.animIn.width = this.cycleW,
      d.animOut.left = b.cycleW / 2,
      d.animOut.width = 0
    }),
    d.cssBefore.top = 0,
    d.cssBefore.width = 0
  },
  a.fn.cycle.transitions.curtainY = function(b, c, d) {
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !0, !1, !0),
      d.cssBefore.top = c.cycleH / 2,
      d.animIn.top = 0,
      d.animIn.height = c.cycleH,
      d.animOut.top = b.cycleH / 2,
      d.animOut.height = 0
    }),
    d.cssBefore.height = 0,
    d.cssBefore.left = 0
  },
  a.fn.cycle.transitions.cover = function(b, c, d) {
    var e = d.direction || "left",
      f = b.css("overflow", "hidden").width(),
      g = b.height();
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d),
      d.cssAfter.display = "",
      "right" == e
        ? d.cssBefore.left = -f
        : "up" == e
          ? d.cssBefore.top = g
          : "down" == e
            ? d.cssBefore.top = -g
            : d.cssBefore.left = f
    }),
    d.animIn.left = 0,
    d.animIn.top = 0,
    d.cssBefore.top = 0,
    d.cssBefore.left = 0
  },
  a.fn.cycle.transitions.uncover = function(b, c, d) {
    var e = d.direction || "left",
      f = b.css("overflow", "hidden").width(),
      g = b.height();
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !0, !0, !0),
      "right" == e
        ? d.animOut.left = f
        : "up" == e
          ? d.animOut.top = -g
          : "down" == e
            ? d.animOut.top = g
            : d.animOut.left = -f
    }),
    d.animIn.left = 0,
    d.animIn.top = 0,
    d.cssBefore.top = 0,
    d.cssBefore.left = 0
  },
  a.fn.cycle.transitions.toss = function(b, c, d) {
    var e = b.css("overflow", "visible").width(),
      f = b.height();
    d.before.push(function(b, c, d) {
      a.fn.cycle.commonReset(b, c, d, !0, !0, !0),
      d.animOut.left || d.animOut.top
        ? d.animOut.opacity = 0
        : a.extend(d.animOut, {
          left: 2 *e,
          top: -f / 2,
          opacity: 0
        })
    }),
    d.cssBefore.left = 0,
    d.cssBefore.top = 0,
    d.animIn.left = 0
  },
  a.fn.cycle.transitions.wipe = function(b, c, d) {
    var e = b.css("overflow", "hidden").width(),
      f = b.height();
    d.cssBefore = d.cssBefore || {};
    var g;
    if (d.clip)
      if (/l2r/.test(d.clip))
        g = "rect(0px 0px " + f + "px 0px)";
      else if (/r2l/.test(d.clip))
        g = "rect(0px " + e + "px " + f + "px " + e + "px)";
      else if (/t2b/.test(d.clip))
        g = "rect(0px " + e + "px 0px 0px)";
      else if (/b2t/.test(d.clip))
        g = "rect(" + f + "px " + e + "px " + f + "px 0px)";
      else if (/zoom/.test(d.clip)) {
        var h = parseInt(f / 2, 10),
          i = parseInt(e / 2, 10);
        g = "rect(" + h + "px " + i + "px " + h + "px " + i + "px)"
      }
    d.cssBefore.clip = d.cssBefore.clip || g || "rect(0px 0px 0px 0px)";
    var j = d.cssBefore.clip.match(/(\d+)/g),
      k = parseInt(j[0], 10),
      l = parseInt(j[1], 10),
      m = parseInt(j[2], 10),
      n = parseInt(j[3], 10);
    d.before.push(function(b, c, d) {
      if (b != c) {
        var g = a(b),
          h = a(c);
        a.fn.cycle.commonReset(b, c, d, !0, !0, !1),
        d.cssAfter.display = "block";
        var i = 1,
          j = parseInt(d.speedIn / 13, 10) - 1;
        !function o() {
          var a = k
              ? k - parseInt(i * (k / j), 10)
              : 0,
            b = n
              ? n - parseInt(i * (n / j), 10)
              : 0,
            c = f > m
              ? m + parseInt(i * ((f - m) / j || 1), 10)
              : f,
            d = e > l
              ? l + parseInt(i * ((e - l) / j || 1), 10)
              : e;
          h.css({
            clip: "rect(" + a + "px " + d + "px " + c + "px " + b + "px)"
          }),
          i++ <= j
            ? setTimeout(o, 13)
            : g.css("display", "none")
        }()
      }
    }),
    a.extend(d.cssBefore, {
      display: "block",
      opacity: 1,
      top: 0,
      left: 0
    }),
    d.animIn = {
      left: 0
    },
    d.animOut = {
      left: 0
    }
  }
}(jQuery);;/* })'" */;/* })'" */
/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/themes/dkms/javascripts/jquery.actual.min.js. */
(function(a) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], a)
  } else
    a(jQuery)
}(function(a) {
  a.fn.addBack = a.fn.addBack || a.fn.andSelf;
  a.fn.extend({
    actual: function(b, l) {
      if (!this[b])
        throw '$.actual => The jQuery method "' + b + '" you called does not exist';
      var f = {
          absolute: false,
          clone: false,
          includeMargin: false,
          display: "block"
        },
        i = a.extend(f, l),
        e = this.eq(0),
        h,
        j;
      if (i.clone === true) {
        h = function() {
          var m = "position: absolute !important; top: -1000 !important; ";
          e = e.clone().attr("style", m).appendTo("body")
        };
        j = function() {
          e.remove()
        }
      } else {
        var g = [],
          d = "",
          c;
        h = function() {
          c = e.parents().addBack().filter(":hidden");
          d += "visibility: hidden !important; display: " + i.display + " !important; ";
          if (i.absolute === true)
            d += "position: absolute !important; ";
          c.each(function() {
            var m = a(this),
              n = m.attr("style");
            g.push(n);
            m.attr(
              "style", n
              ? n + ";" + d
              : d)
          })
        };
        j = function() {
          c.each(function(m) {
            var o = a(this),
              n = g[m];
            if (n === undefined) {
              o.removeAttr("style")
            } else
              o.attr("style", n)
          })
        }
      };
      h();
      var k = /(outer)/.test(b)
        ? e[b](i.includeMargin)
        : e[b]();
      j();
      return k
    }
  })
}));;
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/themes/dkms/javascripts/jquery.actual.min.js. */;/* })'" */
(function($) {
  $.fn.jScroll = function(e) {
    var f = $.extend({}, $.fn.jScroll.defaults, e);
    return this.each(function() {
      var a = $(this);
      var b = $(window);
      var c = new location(a);
      b.scroll(function() {
        a.stop().animate(c.getMargin(b), f.speed)
      })
    });
    function location(d) {
      this.min = d.offset().top;
      this.originalMargin = parseInt(d.css("margin-top"), 10) || 0;
      this.getMargin = function(a) {
        var b = d.parent().height() - d.outerHeight();
        var c = this.originalMargin;
        if (a.scrollTop() >= this.min)
          c = c + f.top + a.scrollTop() - this.min;
        if (c > b)
          c = b;
        return ({
          "marginTop": c + 'px'
        })
      }
    }
  };
  $.fn.jScroll.defaults = {
    speed: "slow",
    top: 10
  }
})(jQuery);;/* })'" */;/* })'" */
/* ! jQuery Mobile v1.4.5 | Copyright 2010, 2014 jQuery Foundation, Inc. | jquery.org/license */

(function(e, t, n) {
  typeof define == "function" && define.amd
    ? define(["jquery"], function(r) {
      return n(r, e, t),
      r.mobile
    })
    : n(e.jQuery, e, t)
})(this, document, function(e, t, n, r) {
  (function(e, n) {
    e.extend(e.support, {
      orientation: "orientation" in t && "onorientationchange" in t
    })
  })(e),
  function(e) {
    e.event.special.throttledresize = {
      setup: function() {
        e(this).bind("resize", n)
      },
      teardown: function() {
        e(this).unbind("resize", n)
      }
    };
    var t = 250,
      n = function() {
        s = (new Date).getTime(),
        o = s - r,
        o >= t
          ? (r = s, e(this).trigger("throttledresize"))
          : (i && clearTimeout(i), i = setTimeout(n, t - o))
      },
      r = 0,
      i,
      s,
      o
  }(e),
  function(e, t) {
    function p() {
      var e = s();
      e !== o && (o = e, r.trigger(i))
    }
    var r = e(t),
      i = "orientationchange",
      s,
      o,
      u,
      a,
      f = {
        0: !0,
        180: !0
      },
      l,
      c,
      h;
    if (e.support.orientation) {
      l = t.innerWidth || r.width(),
      c = t.innerHeight || r.height(),
      h = 50,
      u = l > c && l - c > h,
      a = f[t.orientation];
      if (u && a || !u && !a)
        f = {
          "-90": !0,
          90: !0
        }
      }
    e.event.special.orientationchange = e.extend({}, e.event.special.orientationchange, {
      setup: function() {
        if (e.support.orientation && !e.event.special.orientationchange.disabled)
          return !1;
        o = s(),
        r.bind("throttledresize", p)
      },
      teardown: function() {
        if (e.support.orientation && !e.event.special.orientationchange.disabled)
          return !1;
        r.unbind("throttledresize", p)
      },
      add: function(e) {
        var t = e.handler;
        e.handler = function(e) {
          return e.orientation = s(),
          t.apply(this, arguments)
        }
      }
    }),
    e.event.special.orientationchange.orientation = s = function() {
      var r = !0,
        i = n.documentElement;
      return e.support.orientation
        ? r = f[t.orientation]
        : r = i && i.clientWidth / i.clientHeight < 1.1,
      r
        ? "portrait"
        : "landscape"
    },
    e.fn[i] = function(e) {
      return e
        ? this.bind(i, e)
        : this.trigger(i)
    },
    e.attrFn && (e.attrFn[i] = !0)
  }(e, this)
});;/* })'" */;/* })'" */
/*!
  hey, [be]Lazy.js - v1.8.2 - 2016.10.25
  A fast, small and dependency free lazy load script (https://github.com/dinbror/blazy)
  (c) Bjoern Klinggaard - @bklinggaard - http://dinbror.dk/blazy
*/
(function(q, m) {
  "function" === typeof define && define.amd
    ? define(m)
    : "object" === typeof exports
      ? module.exports = m()
      : q.Blazy = m()
})(this, function() {
  function q(b) {
    var c = b._util;
    c.elements = E(b.options);
    c.count = c.elements.length;
    c.destroyed && (c.destroyed = !1, b.options.container && l(b.options.container, function(a) {
      n(a, "scroll", c.validateT)
    }), n(window, "resize", c.saveViewportOffsetT), n(window, "resize", c.validateT), n(window, "scroll", c.validateT));
    m(b)
  }
  function m(b) {
    for (var c = b._util, a = 0; a < c.count; a++) {
      var d = c.elements[a],
        e;
      a : {
        var g = d;
        e = b.options;
        var p = g.getBoundingClientRect();
        if (e.container && y && (g = g.closest(e.containerClass))) {
          g = g.getBoundingClientRect();
          e = r(g, f)
            ? r(p, {
              top: g.top - e.offset,
              right: g.right + e.offset,
              bottom: g.bottom + e.offset,
              left: g.left - e.offset
            })
            : !1;
          break a
        }
        e = r(p, f)
      }
      if (e || t(d, b.options.successClass))
        b.load(d),
        c.elements.splice(a, 1),
        c.count--,
        a--
    }
    0 === c.count && b.destroy()
  }
  function r(b, c) {
    return b.right >= c.left && b.bottom >= c.top && b.left <= c.right && b.top <= c.bottom
  }
  function z(b, c, a) {
    if (!t(b, a.successClass) && (c || a.loadInvisible || 0 < b.offsetWidth && 0 < b.offsetHeight))
      if (c = b.getAttribute(u) || b.getAttribute(a.src)) {
        c = c.split(a.separator);
        var d = c[
            A && 1 < c.length
              ? 1
              : 0
          ],
          e = b.getAttribute(a.srcset),
          g = "img" === b.nodeName.toLowerCase(),
          p = (c = b.parentNode) && "picture" === c.nodeName.toLowerCase();
        if (g || void 0 === b.src) {
          var h = new Image,
            w = function() {
              a.error && a.error(b, "invalid");
              v(b, a.errorClass);
              k(h, "error", w);
              k(h, "load", f)
            },
            f = function() {
              g
                ? p || B(b, d, e)
                : b.style.backgroundImage = 'url("' + d + '")';
              x(b, a);
              k(h, "load", f);
              k(h, "error", w)
            };
          p && (h = b, l(c.getElementsByTagName("source"), function(b) {
            var c = a.srcset,
              e = b.getAttribute(c);
            e && (b.setAttribute("srcset", e), b.removeAttribute(c))
          }));
          n(h, "error", w);
          n(h, "load", f);
          B(h, d, e)
        } else
          b.src = d,
          x(b, a)
      } else
        "video" === b.nodeName.toLowerCase()
          ? (l(b.getElementsByTagName("source"), function(b) {
            var c = a.src,
              e = b.getAttribute(c);
            e && (b.setAttribute("src", e), b.removeAttribute(c))
          }), b.load(), x(b, a))
          : (a.error && a.error(b, "missing"), v(b, a.errorClass))
    }
  function x(b, c) {
    v(b, c.successClass);
    c.success && c.success(b);
    b.removeAttribute(c.src);
    b.removeAttribute(c.srcset);
    l(c.breakpoints, function(a) {
      b.removeAttribute(a.src)
    })
  }
  function B(b, c, a) {
    a && b.setAttribute("srcset", a);
    b.src = c
  }
  function t(b, c) {
    return -1 !== (" " + b.className + " ").indexOf(" " + c + " ")
  }
  function v(b, c) {
    t(b, c) || (b.className += " " + c)
  }
  function E(b) {
    var c = [];
    b = b.root.querySelectorAll(b.selector);
    for (var a = b.length; a--; c.unshift(b[a]))
    ;
    return c
  }
  function C(b) {
    f.bottom = (window.innerHeight || document.documentElement.clientHeight) + b;
    f.right = (window.innerWidth || document.documentElement.clientWidth) + b
  }
  function n(b, c, a) {
    b.attachEvent
      ? b.attachEvent && b.attachEvent("on" + c, a)
      : b.addEventListener(c, a, {
        capture: !1,
        passive: !0
      })
  }
  function k(b, c, a) {
    b.detachEvent
      ? b.detachEvent && b.detachEvent("on" + c, a)
      : b.removeEventListener(c, a, {
        capture: !1,
        passive: !0
      })
  }
  function l(b, c) {
    if (b && c)
      for (var a = b.length, d = 0; d < a && !1 !== c(b[d], d); d++) ;
      }
    function D(b, c, a) {
    var d = 0;
    return function() {
      var e = + new Date;
      e - d < c || (d = e, b.apply(a, arguments))
    }
  }
  var u,
    f,
    A,
    y;
  return function(b) {
    if (!document.querySelectorAll) {
      var c = document.createStyleSheet();
      document.querySelectorAll = function(a, b, d, h, f) {
        f = document.all;
        b = [];
        a = a.replace(/\[for\b/gi, "[htmlFor").split(",");
        for (d = a.length; d--;) {
          c.addRule(a[d], "k:v");
          for (h = f.length; h--;)
            f[h].currentStyle.k && b.push(f[h]);
          c.removeRule(0)
        }
        return b
      }
    }
    var a = this,
      d = a._util = {};
    d.elements = [];
    d.destroyed = !0;
    a.options = b || {};
    a.options.error = a.options.error || !1;
    a.options.offset = a.options.offset || 100;
    a.options.root = a.options.root || document;
    a.options.success = a.options.success || !1;
    a.options.selector = a.options.selector || ".b-lazy";
    a.options.separator = a.options.separator || "|";
    a.options.containerClass = a.options.container;
    a.options.container = a.options.containerClass
      ? document.querySelectorAll(a.options.containerClass)
      : !1;
    a.options.errorClass = a.options.errorClass || "b-error";
    a.options.breakpoints = a.options.breakpoints || !1;
    a.options.loadInvisible = a.options.loadInvisible || !1;
    a.options.successClass = a.options.successClass || "b-loaded";
    a.options.validateDelay = a.options.validateDelay || 25;
    a.options.saveViewportOffsetDelay = a.options.saveViewportOffsetDelay || 50;
    a.options.srcset = a.options.srcset || "data-srcset";
    a.options.src = u = a.options.src || "data-src";
    y = Element.prototype.closest;
    A = 1 < window.devicePixelRatio;
    f = {};
    f.top = 0 - a.options.offset;
    f.left = 0 - a.options.offset;
    a.revalidate = function() {
      q(a)
    };
    a.load = function(a, b) {
      var c = this.options;
      void 0 === a.length
        ? z(a, b, c)
        : l(a, function(a) {
          z(a, b, c)
        })
    };
    a.destroy = function() {
      var a = this._util;
      this.options.container && l(this.options.container, function(b) {
        k(b, "scroll", a.validateT)
      });
      k(window, "scroll", a.validateT);
      k(window, "resize", a.validateT);
      k(window, "resize", a.saveViewportOffsetT);
      a.count = 0;
      a.elements.length = 0;
      a.destroyed = !0
    };
    d.validateT = D(function() {
      m(a)
    }, a.options.validateDelay, a);
    d.saveViewportOffsetT = D(function() {
      C(a.options.offset)
    }, a.options.saveViewportOffsetDelay, a);
    C(a.options.offset);
    l(a.options.breakpoints, function(a) {
      if (a.width >= window.screen.width)
        return u = a.src,
        !1
    });
    setTimeout(function() {
      q(a)
    })
  }
});;/* })'" */;/* })'" */
/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/themes/dkms/javascripts/dkms.js. */
jQuery.fn.center = function() {
  this.css("position", "absolute");
  this.css("top", Math.max(0, ((jQuery(window).height() - jQuery(this).outerHeight()) / 2) + jQuery(window).scrollTop()) + "px");
  this.css("left", Math.max(0, ((jQuery(window).width() - jQuery(this).outerWidth()) / 2) + jQuery(window).scrollLeft()) + "px");
  return this
};
var fontBase = new FontFaceObserver("Gotham Rounded SSm B", {}),
  fontBrushed = new FontFaceObserver("DKMS-Brushed", {});
fontBase.load(null, 1e5).then(function() {
  document.documentElement.className += " font-gotham-loaded"
});
fontBrushed.load(null, 1e5).then(function() {
  document.documentElement.className += " font-brushed-loaded"
});
(function($) {
  var cssId = 'dkmsFonts';
  if (!document.getElementById(cssId)) {
    var head = document.getElementsByTagName('head')[0],
      link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cloud.typography.com/6151914/7167952/css/fonts.css';
    link.media = 'all';
    head.appendChild(link)
  };
  Drupal.behaviors.placeholders = {
    attach: function(context, settings) {
      var $element = $('.block-search .form-text'),
        placeholder = Drupal.t('Search');
      if ($element.val() == placeholder)
        $element.addClass('placeholder');
      $element.focus(function() {
        if ($element.val() == placeholder) {
          $element.val('');
          $element.removeClass('placeholder')
        }
      }).blur(function() {
        if ($element.val() == '') {
          $element.val(placeholder);
          $element.addClass('placeholder')
        }
      }).blur()
    }
  };
  Drupal.behaviors.responsiveYouTube = {
    attach: function(context, settings) {
      $('.field-name-body').each(function() {
        var $body = $(this);
        $('iframe[src*="youtube.com"]', $body).each(function() {
          var iframe = $(this);
          if (!iframe.hasClass('responsive-fixed')) {
            iframe.wrap('<div class="embedded-video"><div class="player"></div></div>');
            iframe.addClass('responsive-fixed')
          }
        })
      })
    }
  };
  Drupal.behaviors.homeCarousel = {
    attach: function(context, settings) {
      var $slider = $('#block-home-blocks-fact .block-inner', context);
      if ($slider.length) {
        $('<div id="carousel-fact-prev" class="carousel-prev"></div><div id="carousel-fact-next" class="carousel-next"></div><div id="carousel-fact-pager" class="carousel-pager"></div>').appendTo($slider);
        $('.content', $slider).cycle({
          fx: 'scrollHorz',
          timeout: 8030,
          speed: 800,
          pause: true,
          prev: '#carousel-fact-prev',
          next: '#carousel-fact-next',
          pager: '#carousel-fact-pager',
          before: function(currSlideElement, nextSlideElement, options, forwardFlag) {
            bLazy.revalidate()
          },
          after: function(currSlideElement, nextSlideElement, options, forwardFlag) {
            bLazy.revalidate()
          }
        })
      }
    }
  };
  Drupal.behaviors.galleryCarousel = {
    attach: function(context, settings) {
      var slider = $('#jcarousel .gallery-item-inner', context);
      if (slider.length) {
        var scrollSpeed = 3,
          carousel = $('#jcarousel');
        carousel.on('jcarousel:reload jcarousel:create', function() {
          var width = carousel.innerWidth();
          if (width >= 900) {
            scrollSpeed = 3
          } else
            scrollSpeed = 1;
          setCarouselScrollSpeed(scrollSpeed, carousel)
        });
        carousel.jcarousel({wrap: 'circular'});
        carousel.jcarouselAutoscroll({
          interval: 5e3,
          target: '+=' + scrollSpeed,
          autostart: true
        });
        $('<div id="carousel-fact-prev" class="carousel-prev"></div><div id="carousel-fact-next" class="carousel-next"></div>').appendTo($('#block-home-blocks-fact'));
        setCarouselScrollSpeed(scrollSpeed, carousel)
      }
    }
  }
  function setCarouselScrollSpeed(speed, carousel) {
    $('#carousel-fact-prev').off('click');
    $('#carousel-fact-prev').click(function() {
      carousel.jcarousel('scroll', '-=' + speed)
    });
    $('#carousel-fact-next').off('click');
    $('#carousel-fact-next').click(function() {
      carousel.jcarousel('scroll', '+=' + speed)
    });
    carousel.jcarouselAutoscroll({
      target: '+=' + speed
    })
  }
  function centerPager($pager) {
    if ($pager.length) {
      var containerWidth = $pager.parent().css('width').replace("px", ""),
        pagerWidth = $pager.css('width').replace("px", ""),
        leftPos = (containerWidth / 2) - (pagerWidth / 2);
      $pager.css({left: leftPos, 'margin-left': 0})
    }
  };
  Drupal.behaviors.nodeCarousel = {
    attach: function(context, settings) {
      var $slider = $('#node-carousel', context),
        $speed = '800',
        $timeout = '3000';
      if ($slider.data('speed'))
        $speed = $slider.data('speed');
      if ($slider.data('timeout'))
        $timeout = $slider.data('timeout');
      if ($slider.length) {
        $('<div id="carousel-fact-pager" class="carousel-pager"></div>').appendTo($slider);
        $('.content', $slider).cycle({fx: 'scrollHorz', timeout: $timeout, speed: $speed, pause: true, pager: '#carousel-fact-pager'})
      };
      var $pager = jQuery('.node-type-generic-page #node-carousel .carousel-pager');
      centerPager($pager);
      $(window).resize(function() {
        centerPager($pager)
      })
    }
  };
  jQuery(window).load(function() {
    var width = jQuery(window).width();
    if (width > 960)
      setTimeout(function() {
        equalHightFix($('.cc-columns'), '.cc-column-content h3');
        equalHightFix($('.cc-section-equal-columns'), 'h3');
        equalHightFix($('.cc-columns'), '.cc-column-content');
        equalHightFix($('.node-donor-drive .columns'), '.cc-column-content');
        equalHightFixMultipleRows($('#block-views-story-overview-block .view-content'), '.node-content h3', 4);
        equalHightFixMultipleRows($('#block-views-download-overviews-solr-block .view-content'), '.node-content h3', 4);
        equalHightFixMultipleRows($('#block-views-news-overview-block .view-content'), '.node-content h3', 4);
        equalHightFixMultipleRows($('.field-related-container .field-related-inner'), '.node-content h3', 4);
        equalHeightFixAll($('.cc-section-downloadcollection .downloadcollection'), '.downloadcollection-item');
        equalHeightFixAll($('#bottom-navigation .column'), '.block');
        equalHightFix($('.donor-or-donate'), '.column');
        equalHightFixMultipleRows($('#block-views-story-overview-block .view-content'), '.node-content h3', 4);
        equalHightFixMultipleRows($('#block-views-story-overview-block .view-content'), '.node-content .summary', 4);
        equalHightFixMultipleRows($('#block-views-news-overview-block .view-content'), '.node-content h3', 4);
        equalHightFixMultipleRows($('#block-views-news-overview-block .view-content'), '.node-content .summary', 4);
        equalHightFix($('#block-dkms-blocks-dkms-blocks-latest-blogs .articles'), 'div.category');
        equalHightFix($('#block-dkms-blocks-dkms-blocks-latest-blogs .articles'), 'h3');
        equalHightFix($('#block-dkms-blocks-dkms-blocks-latest-blogs .articles'), 'div.summary')
      }, 1)
  });
  jQuery(window).resize(function() {
    var width = jQuery(window).width();
    if (width > 960)
      setTimeout(function() {
        equalHightFix($('.cc-columns'), '.cc-column-content');
        equalHightFix($('.node-donor-drive .columns'), '.cc-column-content');
        equalHightFixMultipleRows($('#block-views-story-overview-block .view-content'), '.node-content h3', 4);
        equalHightFixMultipleRows($('#block-views-download-overviews-solr-block .view-content'), '.node-content h3', 4);
        equalHightFixMultipleRows($('#block-views-news-overview-block .view-content'), '.node-content h3', 4);
        equalHightFixMultipleRows($('.field-related-container .field-related-inner'), '.node-content h3', 4);
        equalHeightFixAll($('#bottom-navigation .column'), '.block');
        equalHightFix($('.donor-or-donate'), '.column');
        equalHightFixMultipleRows($('#block-views-story-overview-block .view-content'), '.node-content h3', 4);
        equalHightFixMultipleRows($('#block-views-story-overview-block .view-content'), '.node-content .summary', 4);
        equalHightFixMultipleRows($('#block-views-news-overview-block .view-content'), '.node-content h3', 4);
        equalHightFixMultipleRows($('#block-views-news-overview-block .view-content'), '.node-content .summary', 4);
        equalHightFix($('#block-dkms-blocks-dkms-blocks-latest-blogs .articles'), 'div.category');
        equalHightFix($('#block-dkms-blocks-dkms-blocks-latest-blogs .articles'), 'h3');
        equalHightFix($('#block-dkms-blocks-dkms-blocks-latest-blogs .articles'), 'div.summary')
      }, 1)
  })
  function rewriteUsDmzUrls() {}
  function changeDmzLink(link) {
    return link
  }
  function equalHightFix($container, selector) {
    $container.each(function() {
      var items = Array();
      $(selector, this).each(function() {
        items.push($(this))
      });
      var highest = 0;
      for (i = 0; i < items.length; i++) {
        height = parseInt(items[i].css("height").replace("px", ""));
        if (height > highest)
          highest = height
      };
      for (i = 0; i < items.length; i++)
        if (highest > 0)
          items[i].css("height", highest + "px")
    })
  }
  function equalHeightFixAll($container, selector) {
    var items = Array();
    $container.each(function() {
      $(selector, this).each(function() {
        items.push($(this))
      })
    });
    var highest = 0;
    for (i = 0; i < items.length; i++) {
      height = parseInt(items[i].css("height").replace("px", ""));
      if (height > highest)
        highest = height
    };
    for (i = 0; i < items.length; i++)
      if (highest > 0)
        items[i].css("height", highest + "px")
  }
  function equalHightFixMultipleRows($container, selector, $columns) {
    $container.each(function() {
      var rows = Array(),
        items = Array();
      counter = 0;
      $(selector, this).each(function() {
        items.push($(this));
        counter++;
        if (counter == $columns) {
          rows.push(items);
          items = Array();
          counter = 0
        }
      });
      if (items.length > 0)
        rows.push(items);
      for (r = 0; r < rows.length; r++) {
        items = rows[r];
        var highest = 0;
        for (i = 0; i < items.length; i++) {
          height = parseInt(items[i].css("height").replace("px", ""));
          if (height > highest)
            highest = height
        };
        for (i = 0; i < items.length; i++)
          if (highest > 0)
            items[i].css("height", highest + "px")
      }
    })
  };
  Drupal.behaviors.faq = {
    attach: function(context) {
      var animationSpeed = 500;
      $faqBlock = $('.general-faq-container');
      $faqBlock.find('article.node-faq div.field-name-body').addClass('hidden').hide();
      $articleHeadings = $faqBlock.find('article.node-faq h3.faq-title');
      /* FK-TODO: Datenschutz Punkte werden hier auf- und zugeklappt. */
      $articleHeadings.addClass('collapsed');
      $articleHeadings.removeClass('opened');
      $articleHeadings.each(function() {
        $this = $(this);
        if (!$this.hasClass('faq-processed')) {
          $this.addClass('faq-processed');
          $this.click(function(event) {
            $link = $(this);
            if ($link.hasClass('collapsed')) {
              $link.next().removeClass('hidden').slideDown(animationSpeed);
              $link.removeClass('collapsed').addClass('opened')
            } else {
              $link.next().addClass('hidden').slideUp(animationSpeed);
              $link.removeClass('opened').addClass('collapsed')
            }
          })
        }
      });
      if (document.location.hash && document.location.hash.indexOf('faq-item')) {
        hashParts = document.location.hash.split('faq-item-');
        if (hashParts.length > 1) {
          faqId = hashParts[1];
          $this = jQuery('#node-' + faqId + ' .node-content h3');
          $this.next().removeClass('hidden').slideDown(animationSpeed);
          $this.removeClass('collapsed').addClass('opened')
        }
      };
      window.onhashchange = function() {
        if (document.location.hash && document.location.hash.indexOf('faq-item')) {
          hashParts = document.location.hash.split('faq-item-');
          if (hashParts.length > 1) {
            faqId = hashParts[1];
            $this = jQuery('#node-' + faqId + ' .node-content h3');
            $this.next().removeClass('hidden').slideDown(animationSpeed);
            $this.removeClass('collapsed').addClass('opened')
          }
        }
      };
      $contentHeadings = $faqBlock.find('article.node-faq div.field-name-body .faq-body');
      $contentHeadings.addClass('collapsed');
      $contentHeadings.removeClass('opened');
      $contentHeadings.each(function() {
        $this = $(this);
        $identifier = $this.attr('id');
        $parent = $this.parent();
        $collapsee = $parent.find('.' + $identifier);
        if ($this.hasClass('collapsed'))
          $collapsee.addClass('hidden').hide();
        if (!$this.hasClass('faq-processed')) {
          $collapsee.addClass('faq-indent');
          $this.addClass('faq-processed');
          $this.click(function(event) {
            $link = $(this);
            $identifier = $link.attr('id');
            $parent = $link.parent();
            $collapsee = $parent.find('.' + $identifier);
            if ($link.hasClass('collapsed')) {
              $collapsee.removeClass('hidden').slideDown(animationSpeed);
              $link.removeClass('collapsed').addClass('opened')
            } else {
              $collapsee.addClass('hidden').slideUp(animationSpeed);
              $link.removeClass('opened').addClass('collapsed')
            }
          })
        };
        $identifier = $this.attr('id');
        if (document.location.hash) {
          var hash = document.location.hash.replace('#', '');
          if (hash == $identifier) {
            $nodefaq = $this.parents('.node-faq').first();
            $h3 = $('.faq-title', $nodefaq).first();
            if ($h3.hasClass('collapsed'))
              $h3.click();
            $('html, body').animate({
              scrollTop: $this.offset().top - 50
            }, 0);
            $this.click()
          }
        }
      })
    }
  };
  Drupal.behaviors.clear_donate = {
    attach: function(context) {
      $('.block-dkms-donate .form-text', context).once(function() {
        this.defaultValue = this.value;
        $(this).click(function() {
          if (this.value == this.defaultValue)
            $(this).val("");
          return false
        });
        $(this).blur(function() {
          if (this.value == "")
            $(this).val(this.defaultValue)
        })
      })
    }
  };
  Drupal.behaviors.clear_newsletter = {
    attach: function(context) {
      $('.newsletter-subscribe .form-text', context).once(function() {
        this.defaultValue = this.value;
        var $this = $(this);
        $this.addClass('placeholder');
        $this.click(function() {
          if (this.value == this.defaultValue) {
            var $this = $(this);
            $this.val("");
            $this.removeClass('placeholder')
          };
          return false
        });
        $this.blur(function() {
          if (this.value == "") {
            var $this = $(this);
            $this.val(this.defaultValue);
            $this.addClass('placeholder')
          }
        })
      })
    }
  };
  $(document).bind('cbox_complete', function() {
    var $width = $(window).width(),
      $height = $(window).height();
    if ($width < 960 || $height < 600) {
      var $ratio = 900 / 600;
      if ($width < $height) {
        $colorbox_width = $width - 120;
        $colorbox_height = ($width / $ratio) - 120;
        if ($colorbox_height > $height - 120) {
          $colorbox_height = $height - 120;
          $colorbox_width = ($height * $ratio) - 120
        };
        $.colorbox.resize({width: $colorbox_width, height: $colorbox_height})
      } else {
        $colorbox_width = $width - 120;
        $colorbox_height = ($width / $ratio) - 120;
        if ($colorbox_height > $height - 120) {
          $colorbox_height = $height - 120;
          $colorbox_width = ($height * $ratio) - 120
        };
        $.colorbox.resize({width: $colorbox_width, height: $colorbox_height})
      }
    }
  });
  var timeoutID;
  $(window).on("orientationchange", function() {
    timeoutID = window.setTimeout(function() {
      var $width = $(window).width(),
        $height = $(window).height(),
        $ratio = 900 / 600,
        $isOpen = false,
        $isLayer = false;
      if ($("#colorbox").css("display") == "block") {
        $isOpen = true;
        $layer = $('#colorbox').find('.node-layer');
        if ($layer.length > 0)
          $isLayer = true
      };
      if (!$isLayer) {
        if ($width < $height) {
          $colorbox_width = $width - 120;
          $colorbox_height = ($width / $ratio) - 120;
          if ($colorbox_height > $height - 120) {
            $colorbox_height = $height - 120;
            $colorbox_width = ($height * $ratio) - 120
          };
          $.colorbox.resize({width: $colorbox_width, height: $colorbox_height})
        } else {
          $colorbox_width = $width - 120;
          $colorbox_height = ($width / $ratio) - 120;
          if ($colorbox_height > $height - 120) {
            $colorbox_height = $height - 120;
            $colorbox_width = ($height * $ratio) - 120
          };
          $.colorbox.resize({width: $colorbox_width, height: $colorbox_height})
        }
      } else {
        var $width = $(window).width(),
          $height = $(window).height(),
          $colorbox_width = $width,
          $colorbox_height = $height - 120;
        if ($width > 920) {
          $colorbox_width = 920;
          $colorbox_height = 720
        };
        if (navigator.userAgent.match(/Android|iPhone/i) && !navigator.userAgent.match(/iPod/i) && $width < 920) {
          $.colorbox.resize({width: '90%', height: '90%'})
        } else
          $.colorbox.resize({width: $colorbox_width, height: $colorbox_height})
      }
    }, 1500)
  });
  Drupal.behaviors.sponsor = {
    attach: function(context) {
      jQuery(window).load(function() {
        var $sponsorView = $(".view-sponsors", context);
        $sponsorView.find('.cc-section-learnmore').addClass('closed').hide();
        $sponsorView.find('h3').click(function(event) {
          event.preventDefault();
          var $this = $(this);
          $sponsorView.find('h3.open').removeClass('open').addClass('closed');
          var $targetLearnMore = $this.next('.cc-section-learnmore');
          if ($targetLearnMore.hasClass('open')) {
            $targetLearnMore.slideUp(500).addClass('closed').removeClass('open')
          } else {
            $('.cc-section-learnmore.open').slideUp(500).addClass('closed').removeClass('open');
            $targetLearnMore.slideDown(500).addClass('open').removeClass('closed');
            $this.removeClass('closed').addClass('open')
          }
        })
      })
    }
  };
  $(document).bind('leaflet.map', function(event, map, lmap) {
    $container = lmap.getContainer();
    if ($container.length)
      if (!$container.parent().parent().parent().parent().parent().hasClass('node-donor-drive'))
        lmap.zoomOut(1)
  });
  Drupal.behaviors.downloadFacet = {
    attach: function(context) {
      var result = new RegExp("f\\[0\\]=", 'gi').exec(window.location.search);
      if (result && result.length > 0) {
        var scrollPos = $(".block-facetapi").first().offset().top - 25;
        $('html, body').animate({
          scrollTop: scrollPos + 'px'
        }, 500)
      }
    }
  };
  Drupal.behaviors.generalActions = {
    attach: function(context, settings) {
      if (document.location.host == 'www.dkms.org' || document.location.host == 'dev.dkms.org' || document.location.host == 'local.dkms.org')
        rewriteUsDmzUrls()
    }
  };
  Drupal.behaviors.mobileColorboxVideo = {
    attach: function(context, settings) {
      if ($(window).width() < 760) {
        var $videoThumbnail = $('a.video-preview.init-colorbox-inline-processed', context);
        $videoThumbnail.each(function() {
          var $link = $(this),
            $parent = $link.parent();
          $img = $('img', $link);
          var $newLink = $('<a>');
          $newLink.prependTo($parent);
          $img.prependTo($newLink);
          $newLink.addClass('video-preview');
          var $href = $link.attr('href');
          idx = $href.indexOf("#");
          var hash = idx != -1
            ? $href.substring(idx + 1)
            : "";
          if (hash !== '') {
            var $div = $('#' + hash),
              $iframe = $('iframe', $div).first();
            $newLink.on('click', function() {
              if (!$iframe.hasClass('dkms-yt-loaded')) {
                $iframe.attr('src', $iframe.data('src'));
                $iframe.addClass('dkms-yt-loaded');
                $div.parent().show();
                $newLink.remove()
              }
            })
          };
          $link.remove()
        })
      }
    }
  };
  $(document).ready(function() {
    dkmsSlide(['#block-locale-language', '#block-search-form', '#block-system-main-menu', '#block-menu-menu-header-menu']);
    $('.menu-link').unbind('click').click(function() {
      $(this).toggleClass('open');
      $('nav.mobile').toggleClass('open')
    });
    var $element = $('.block-search .form-text', $('nav.mobile')),
      placeholder = Drupal.t('Search');
    if ($element.val() == placeholder)
      $element.addClass('placeholder');
    $element.focus(function() {
      if ($element.val() == placeholder) {
        $element.val('');
        $element.removeClass('placeholder')
      }
    }).blur(function() {
      if ($element.val() == '') {
        $element.val(placeholder);
        $element.addClass('placeholder')
      }
    }).blur()
  })
  function dkmsSlide(elements) {
    $.each(elements, function(index, value) {
      var $mobileNav = $('nav.mobile'),
        $clone = $(value).clone();
      $clone.attr('id', function(i, val) {
        return val + '-mobile'
      });
      $mobileNav.append($clone)
    })
  };
  $().ready(function() {
    var windowWidth = $(window).width();
    if (windowWidth > 979)
      $(".scroll").jScroll()
  });
  Drupal.behaviors.dkmsPopup = {
    attach: function(context, settings) {
      var $links = $('a.dkmsPopup');
      $links.each(function() {
        var $this = $(this);
        $this.click(function(e) {
          e.preventDefault();
          var $link = $(this),
            URL = $link.data('src'),
            h = $link.data('height'),
            w = $link.data('width');
          $link.colorbox({href: URL, iframe: true, width: w, height: h})
        })
      })
    }
  };
  Drupal.behaviors.bLazy = {
    attach: function(context, settings) {
      setTimeout(function() {
        bLazy.revalidate()
      }, 500);
      setTimeout(function() {
        bLazy.revalidate()
      }, 1500);
      setTimeout(function() {
        bLazy.revalidate()
      }, 3e3)
    }
  }
}(jQuery))
function scrollToElement(elementSelector) {
  var scrollPos = jQuery(elementSelector).offset().top + 5;
  jQuery('html, body').animate({
    scrollTop: scrollPos
  }, 500)
}
function iOsScrollFix(elemSelectorIpad, elemSelectorIPhone) {
  var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent),
    iPhone = /(iPhone)/g.test(navigator.userAgent);
  if (iOS) {
    if (window.innerWidth != document.documentElement.clientWidth)
      window.innerWidth = document.documentElement.clientWidth;
    jQuery('html, body').animate({
      scrollLeft: 0
    }, 1);
    var elem_top = jQuery(elemSelectorIpad).offset().top;
    if (iPhone)
      elem_top = jQuery(elemSelectorIPhone).offset().top;
    jQuery('html, body').animate({
      scrollTop: elem_top
    }, 100)
  }
}
function parseDate(input) {
  var parts = input.split('-');
  return new Date(parts[0], parts[1] - 1, parts[2])
};
Drupal.theme.scaldEmbed = function(atom, context, options) {
  context = context
    ? context
    : Drupal.settings.dnd.contextDefault;
  var classname = '';
  classname += ' type-' + atom.meta.type;
  classname += ' context-' + context;
  if (atom.meta.align && atom.meta.align != 'none')
    classname += ' atom-align-' + atom.meta.align;
  var output = '<div class="' + classname + '"><div class="dnd-drop-wrapper">' + atom.contexts[context] + '</div>';
  if (atom.meta.legend)
    output += '<div class="dnd-legend-wrapper">' + atom.meta.legend + '</div>';
  output += '</div>';
  if (options)
    output = output.replace(/<!-- scald=\d+(.+?) -->/, '<!-- scald=' + atom.sid + ':' + context + ' ' + JSON.stringify(options) + ' -->');
  return output
};
var bLazy = new Blazy({offset: 100});;
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/themes/dkms/javascripts/dkms.js. */;/* })'" */
