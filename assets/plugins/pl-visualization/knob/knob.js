/*!jQuery Knob*/
(function($) {
    "use strict";
    var k = {},
        max = Math.max,
        min = Math.min;
    k.c = {};
    k.c.d = $(document);
    k.c.t = function(e) {
        return e.originalEvent.touches.length - 1;
    };
    k.o = function() {
        var s = this;
        this.o = null;
        this.$ = null;
        this.i = null;
        this.g = null;
        this.v = null;
        this.cv = null;
        this.x = 0;
        this.y = 0;
        this.$c = null;
        this.c = null;
        this.t = 0;
        this.isInit = false;
        this.fgColor = null;
        this.pColor = null;
        this.dH = null;
        this.cH = null;
        this.eH = null;
        this.rH = null;
        this.run = function() {
            var cf = function(e, conf) {
                var k;
                for (k in conf) {
                    s.o[k] = conf[k];
                }
                s.init();
                s._configure()._draw();
            };
            if (this.$.data('kontroled')) return;
            this.$.data('kontroled', true);
            this.extend();
            this.o = $.extend({
                min: this.$.data('min') || 0,
                max: this.$.data('max') || 100,
                stopper: true,
                readOnly: this.$.data('readonly'),
                cursor: (this.$.data('cursor') === true && 30) || this.$.data('cursor') || 0,
                thickness: this.$.data('thickness') || 0.35,
                width: this.$.data('width') || 200,
                height: this.$.data('height') || 200,
                displayInput: this.$.data('displayinput') == null || this.$.data('displayinput'),
                displayPrevious: this.$.data('displayprevious'),
                fgColor: this.$.data('fgcolor') || '#87CEEB',
                inline: false,
                draw: null,
                change: null,
                cancel: null,
                release: null
            }, this.o);
            if (this.$.is('fieldset')) {
                this.v = {};
                this.i = this.$.find('input')
                this.i.each(function(k) {
                    var $this = $(this);
                    s.i[k] = $this;
                    s.v[k] = $this.val();
                    $this.bind('change', function() {
                        var val = {};
                        val[k] = $this.val();
                        s.val(val);
                    });
                });
                this.$.find('legend').remove();
            } else {
                this.i = this.$;
                this.v = this.$.val();
                (this.v == '') && (this.v = this.o.min);
                this.$.bind('change', function() {
                    s.val(s.$.val());
                });
            }
            (!this.o.displayInput) && this.$.hide();
            this.$c = $('<canvas width="' +
                this.o.width + 'px" height="' +
                this.o.height + 'px"></canvas>');
            this.c = this.$c[0].getContext("2d");
            this.$.wrap($('<div style="' + (this.o.inline ? 'display:inline;' : '') +
                'width:' + this.o.width + 'px;height:' +
                this.o.height + 'px;"></div>')).before(this.$c);
            if (this.v instanceof Object) {
                this.cv = {};
                this.copy(this.v, this.cv);
            } else {
                this.cv = this.v;
            }
            this.$.bind("configure", cf).parent().bind("configure", cf);
            this._listen()._configure()._xy().init();
            this.isInit = true;
            this._draw();
            return this;
        };
        this._draw = function() {
            var d = true,
                c = document.createElement('canvas');
            c.width = s.o.width;
            c.height = s.o.height;
            s.g = c.getContext('2d');
            s.clear();
            s.dH && (d = s.dH());
            (d !== false) && s.draw();
            s.c.drawImage(c, 0, 0);
            c = null;
        };
        this._touch = function(e) {
            var touchMove = function(e) {
                var v = s.xy2val(e.originalEvent.touches[s.t].pageX, e.originalEvent.touches[s.t].pageY);
                if (v == s.cv) return;
                if (s.cH && (s.cH(v) === false)) return;
                s.change(v);
                s._draw();
            };
            this.t = k.c.t(e);
            touchMove(e);
            k.c.d.bind("touchmove.k", touchMove).bind("touchend.k", function() {
                k.c.d.unbind('touchmove.k touchend.k');
                if (s.rH && (s.rH(s.cv) === false)) return;
                s.val(s.cv);
            });
            return this;
        };
        this._mouse = function(e) {
            var mouseMove = function(e) {
                var v = s.xy2val(e.pageX, e.pageY);
                if (v == s.cv) return;
                if (s.cH && (s.cH(v) === false)) return;
                s.change(v);
                s._draw();
            };
            mouseMove(e);
            k.c.d.bind("mousemove.k", mouseMove).bind("keyup.k", function(e) {
                if (e.keyCode === 27) {
                    k.c.d.unbind("mouseup.k mousemove.k keyup.k");
                    if (s.eH && (s.eH() === false)) return;
                    s.cancel();
                }
            }).bind("mouseup.k", function(e) {
                k.c.d.unbind('mousemove.k mouseup.k keyup.k');
                if (s.rH && (s.rH(s.cv) === false)) return;
                s.val(s.cv);
            });
            return this;
        };
        this._xy = function() {
            var o = this.$c.offset();
            this.x = o.left;
            this.y = o.top;
            return this;
        };
        this._listen = function() {
            if (!this.o.readOnly) {
                this.$c.bind("mousedown", function(e) {
                    e.preventDefault();
                    s._xy()._mouse(e);
                }).bind("touchstart", function(e) {
                    e.preventDefault();
                    s._xy()._touch(e);
                });
                this.listen();
            } else {
                this.$.attr('readonly', 'readonly');
            }
            return this;
        };
        this._configure = function() {
            if (this.o.draw) this.dH = this.o.draw;
            if (this.o.change) this.cH = this.o.change;
            if (this.o.cancel) this.eH = this.o.cancel;
            if (this.o.release) this.rH = this.o.release;
            if (this.o.displayPrevious) {
                this.pColor = this.h2rgba(this.o.fgColor, "0.4");
                this.fgColor = this.h2rgba(this.o.fgColor, "0.6");
            } else {
                this.fgColor = this.o.fgColor;
            }
            return this;
        };
        this._clear = function() {
            this.$c[0].width = this.$c[0].width;
        };
        this.listen = function() {};
        this.extend = function() {};
        this.init = function() {};
        this.change = function(v) {};
        this.val = function(v) {};
        this.xy2val = function(x, y) {};
        this.draw = function() {};
        this.clear = function() {
            this._clear();
        };
        this.h2rgba = function(h, a) {
            var rgb;
            h = h.substring(1, 7)
            rgb = [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
            return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
        };
        this.copy = function(f, t) {
            for (var i in f) {
                t[i] = f[i];
            }
        };
    };
    k.Dial = function() {
        k.o.call(this);
        this.startAngle = null;
        this.xy = null;
        this.radius = null;
        this.lineWidth = null;
        this.cursorExt = null;
        this.w2 = null;
        this.PI2 = 2 * Math.PI;
        this.extend = function() {
            this.o = $.extend({
                bgColor: this.$.data('bgcolor') || '#EEEEEE',
                angleOffset: this.$.data('angleoffset') || 0,
                angleArc: this.$.data('anglearc') || 360,
                inline: true
            }, this.o);
        };
        this.val = function(v) {
            if (null != v) {
                this.cv = this.o.stopper ? max(min(v, this.o.max), this.o.min) : v;
                this.v = this.cv;
                this.$.val(this.v);
                this._draw();
            } else {
                return this.v;
            }
        };
        this.xy2val = function(x, y) {
            var a, ret;
            a = Math.atan2(x - (this.x + this.w2), -(y - this.y - this.w2)) - this.angleOffset;
            if (this.angleArc != this.PI2 && (a < 0) && (a > -0.5)) {
                a = 0;
            } else if (a < 0) {
                a += this.PI2;
            }
            ret = ~~(0.5 + (a * (this.o.max - this.o.min) / this.angleArc)) +
                this.o.min;
            this.o.stopper && (ret = max(min(ret, this.o.max), this.o.min));
            return ret;
        };
        this.listen = function() {
            var s = this,
                mw = function(e) {
                    e.preventDefault();
                    var ori = e.originalEvent,
                        deltaX = ori.detail || ori.wheelDeltaX,
                        deltaY = ori.detail || ori.wheelDeltaY,
                        v = parseInt(s.$.val()) + (deltaX > 0 || deltaY > 0 ? 1 : deltaX < 0 || deltaY < 0 ? -1 : 0);
                    if (s.cH && (s.cH(v) === false)) return;
                    s.val(v);
                },
                kval, to, m = 1,
                kv = {
                    37: -1,
                    38: 1,
                    39: 1,
                    40: -1
                };
            this.$.bind("keydown", function(e) {
                var kc = e.keyCode;
                if (kc >= 96 && kc <= 105) {
                    kc = e.keyCode = kc - 48;
                }
                kval = parseInt(String.fromCharCode(kc));
                if (isNaN(kval)) {
                    (kc !== 13) && (kc !== 8) && (kc !== 9) && (kc !== 189) && e.preventDefault();
                    if ($.inArray(kc, [37, 38, 39, 40]) > -1) {
                        e.preventDefault();
                        var v = parseInt(s.$.val()) + kv[kc] * m;
                        s.o.stopper && (v = max(min(v, s.o.max), s.o.min));
                        s.change(v);
                        s._draw();
                        to = window.setTimeout(function() {
                            m *= 2;
                        }, 30);
                    }
                }
            }).bind("keyup", function(e) {
                if (isNaN(kval)) {
                    if (to) {
                        window.clearTimeout(to);
                        to = null;
                        m = 1;
                        s.val(s.$.val());
                    }
                } else {
                    (s.$.val() > s.o.max && s.$.val(s.o.max)) || (s.$.val() < s.o.min && s.$.val(s.o.min));
                }
            });
            this.$c.bind("mousewheel DOMMouseScroll", mw);
            this.$.bind("mousewheel DOMMouseScroll", mw)
        };
        this.init = function() {
            if (this.v < this.o.min || this.v > this.o.max) this.v = this.o.min;
            this.$.val(this.v);
            this.w2 = this.o.width / 2;
            this.cursorExt = this.o.cursor / 100;
            this.xy = this.w2;
            this.lineWidth = this.xy * this.o.thickness;
            this.radius = this.xy - this.lineWidth / 2;
            this.o.angleOffset && (this.o.angleOffset = isNaN(this.o.angleOffset) ? 0 : this.o.angleOffset);
            this.o.angleArc && (this.o.angleArc = isNaN(this.o.angleArc) ? this.PI2 : this.o.angleArc);
            this.angleOffset = this.o.angleOffset * Math.PI / 180;
            this.angleArc = this.o.angleArc * Math.PI / 180;
            this.startAngle = 1.5 * Math.PI + this.angleOffset;
            this.endAngle = 1.5 * Math.PI + this.angleOffset + this.angleArc;
            var s = max(String(Math.abs(this.o.max)).length, String(Math.abs(this.o.min)).length, 2) + 2;
            this.o.displayInput && this.i.css({
                'width': ((this.o.width / 2 + 4) >> 0) + 'px',
                'height': ((this.o.width / 3) >> 0) + 'px',
                'position': 'absolute',
                'vertical-align': 'middle',
                'margin-top': ((this.o.width / 3) >> 0) + 'px',
                'margin-left': '-' + ((this.o.width * 3 / 4 + 2) >> 0) + 'px',
                'border': 0,
                'background': 'none',
                'font': 'bold ' + ((this.o.width / s) >> 0) + 'px Arial',
                'text-align': 'center',
                'color': this.o.fgColor,
                'padding': '0px',
                '-webkit-appearance': 'none'
            }) || this.i.css({
                'width': '0px',
                'visibility': 'hidden'
            });
        };
        this.change = function(v) {
            this.cv = v;
            this.$.val(v);
        };
        this.angle = function(v) {
            return (v - this.o.min) * this.angleArc / (this.o.max - this.o.min);
        };
        this.draw = function() {
            var c = this.g,
                a = this.angle(this.cv),
                sat = this.startAngle,
                eat = sat + a,
                sa, ea, r = 1;
            c.lineWidth = this.lineWidth;
            this.o.cursor && (sat = eat - this.cursorExt) && (eat = eat + this.cursorExt);
            c.beginPath();
            c.strokeStyle = this.o.bgColor;
            c.arc(this.xy, this.xy, this.radius, this.endAngle, this.startAngle, true);
            c.stroke();
            if (this.o.displayPrevious) {
                ea = this.startAngle + this.angle(this.v);
                sa = this.startAngle;
                this.o.cursor && (sa = ea - this.cursorExt) && (ea = ea + this.cursorExt);
                c.beginPath();
                c.strokeStyle = this.pColor;
                c.arc(this.xy, this.xy, this.radius, sa, ea, false);
                c.stroke();
                r = (this.cv == this.v);
            }
            c.beginPath();
            c.strokeStyle = r ? this.o.fgColor : this.fgColor;
            c.arc(this.xy, this.xy, this.radius, sat, eat, false);
            c.stroke();
        };
        this.cancel = function() {
            this.val(this.v);
        };
    };
    $.fn.dial = $.fn.knob = function(o) {
        return this.each(function() {
            var d = new k.Dial();
            d.o = o;
            d.$ = $(this);
            d.run();
        }).parent();
    };
})(jQuery);