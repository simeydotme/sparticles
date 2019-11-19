/**!
 * Sparticles - Lightweight, High Performance Particles in Canvas
 * @version 0.4.0
 * @license MPL-2.0
 * @author simeydotme <simey.me@gmail.com>
 */

var sparticles = (function (exports) {
  'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(source, true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  /**
   * Limited Animation Frame method, to allow running
   * a given handler at the maximum desired frame rate.
   * inspired from https://gist.github.com/addyosmani/5434533
   * @param {Function} handler method to execute upon every frame
   * @param {Number} fps how many frames to render every second
   */
  var AnimationFrame = function AnimationFrame() {
    var handler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
    var fps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 60;
    this.fps = fps;
    this.handler = handler;
    var renderId = 0;
    /**
     * begin the animation loop which is assigned
     * to the instance in the constructor
     */

    this.start = function () {
      var _this = this;

      var then = performance.now();
      var interval = 1000 / this.fps;
      var tolerance = 0;

      var loop = function loop(now) {
        var delta = now - then;
        renderId = requestAnimationFrame(loop);

        if (delta >= interval - tolerance) {
          _this.handler(delta);

          then = now - delta % interval;
        }
      };

      renderId = requestAnimationFrame(loop);
    };
    /**
     * stop the currently running animation loop
     */


    this.stop = function () {
      cancelAnimationFrame(renderId);
    };
  };

  /**
   * return the cartesian x/y delta value from a degree
   * eg: 90 (→) = [1,0]
   * @param {Number} angle angle in degrees
   * @returns {Number[]} cartesian delta values
   */
  var cartesian = function cartesian(angle) {
    return [Math.cos(radian(angle - 90)), Math.sin(radian(angle - 90))];
  };
  /**
   * clamp the input number to the min/max values
   * @param {Number} value value to clamp between min and max
   * @param {Number} min minimum value possible
   * @param {Number} max maximum value possible
   * @returns {Number} the input num clamped between min/max
   */

  var clamp = function clamp(value) {
    var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    return Math.max(min, Math.min(max, value));
  };
  /**
   * return the radian equivalent to a degree value
   * @param {Number} angle angle in degrees
   * @returns {Number} radian equivalent
   */

  var radian = function radian(angle) {
    return angle * Math.PI / 180;
  };
  /**
   * return random number between a min and max value
   * @param {Number} min minimum value
   * @param {Number} max maximum value
   * @param {Boolean} rounded should the result be rounded
   * @returns {Number} a random number between min and max
   */

  var random = function random() {
    var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Math.random();

    if ((min !== 0 || max !== 1) && max > min) {
      value = value * (max - min) + min;
    }

    return value;
  };
  /**
   * return a random value from an array
   * @param {Array} array an array to get random value from
   * @returns {*} random value from array
   */

  var randomArray = function randomArray(array) {
    return array[Math.floor(random(0, array.length))];
  };
  /**
   * return a random HSL colour string for use in rainbow effect
   * @returns {String} "hsl(100,100,80)"
   */

  var randomHsl = function randomHsl() {
    var h = round(random(0, 360));
    var s = round(random(90, 100));
    var l = round(random(45, 85));
    return "hsl(".concat(h, ",").concat(s, "%,").concat(l, "%)");
  };
  /**
   * return a boolean to pass a dice roll
   * @param {Number} odds a fraction to use as the probability, can be supplied as "1/2"
   * @returns {Boolean}
   */

  var roll = function roll(odds) {
    return odds > random();
  };
  /**
   * round a number to the nearest integer value
   * @param {Number} value value to round to the nearest integer
   * @returns {Number} nearest integer
   */

  var round = function round(value) {
    return 0.5 + value | 0;
  };

  /**
   * Sparticles Constructor;
   * Create a <canvas>, append to the given node, and start the particle effect
   * @param {HTMLElement} [node] - element to which canvas is appended to
   * @param {Number} [width] - the width of the canvas element
   * @param {Number} [height] - the height of the canvas element
   * @param {Object} [options] - settings to use for the particle effect
   * @param {String} [options.composition=screen] - canvas globalCompositionOperation value for particles
   * @param {Number} [options.count=50] - number of particles on the canvas simultaneously
   * @param {Number} [options.speed=10] - default velocity of every particle
   * @param {Number} [options.parallax=1] - speed multiplier effect for larger particles (0 = none)
   * @param {Number} [options.direction=180] - default direction of particles in degrees (0 = ↑, 180 = ↓)
   * @param {Number} [options.xVariance=2] - random deviation of particles on x-axis from default direction
   * @param {Number} [options.yVariance=2] - random deviation of particles on y-axis from default direction
   * @param {Number} [options.rotation=1] - default rotational speed for every particle
   * @param {Number} [options.alphaSpeed=10] - rate of change in alpha over time
   * @param {Number} [options.alphaVariance=1] - variance in alpha change rate
   * @param {Number} [options.minAlpha=0] - minumum alpha value of every particle
   * @param {Number} [options.maxAlpha=1] - maximum alpha value of every particle
   * @param {Number} [options.minSize=1] - minimum size of every particle
   * @param {Number} [options.maxSize=10] - maximum size of every particle
   * @param {String} [options.shape=circle] - shape of particles (one of; circle, square, triangle, line, image)
   * @param {String} [options.style=fill] - fill style of particles (one of; fill, stroke, both)
   * @param {Number} [options.float=1] - the "floatiness" of particles which have a direction at a 90 degree value (±20)
   * @param {Boolean} [options.twinkle=false] - particles to exhibit an alternative alpha transition as "twinkling"
   * @param {(String|null)} [options.imageUrl=null] - if style is "image", define an image url (can be data uri)
   * @param {(String|String[])} [options.color=white] - css color as string, or array or color strings (can also be "rainbow")
   * @returns - reference to a new Sparticles instance
   */

  var Sparticles = function Sparticles(node, width, height, options) {
    var me = this;
    var defaults = {
      alphaSpeed: 10,
      alphaVariance: 1,
      color: "white",
      composition: "screen",
      count: 50,
      direction: 180,
      float: 1,
      imageUrl: null,
      maxAlpha: 1,
      maxSize: 10,
      minAlpha: 0,
      minSize: 1,
      parallax: 1,
      rotation: 1,
      shape: "circle",
      speed: 10,
      style: "fill",
      twinkle: false,
      xVariance: 2,
      yVariance: 2
    };
    this.el = node || document.body;
    this.width = width || this.el.clientWidth;
    this.height = height || this.el.clientHeight;
    this.options = options || {};
    this.sparticles = [];
    this.settings = _objectSpread2({}, defaults, {}, this.options);
    this.setupColors();
    this.setupCanvas();
    this.setupImage(function () {
      me.createSparticles();
      me.start();
    });
    return this;
  };

  Sparticles.prototype.start = function () {
    var me = this;

    if (!this.loop) {
      this.loop = new AnimationFrame(function (t) {
        me.render(t);
      });
    }

    this.loop.start();
  };

  Sparticles.prototype.stop = function () {
    this.loop.stop();
  };

  Sparticles.prototype.setupColors = function () {
    var colors = 50;

    if (this.settings.color === "rainbow") {
      this.settings.color = [];

      for (var i = 0; i < colors; i++) {
        this.settings.color[i] = randomHsl();
      }
    }
  };

  Sparticles.prototype.setupCanvas = function () {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.el.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");
  };

  Sparticles.prototype.getImageCanvas = function (color) {
    var imgSize = this.image.width;
    this.images = this.images || {};
    this.images[color] = document.createElement("canvas");
    this.images[color].width = imgSize;
    this.images[color].height = imgSize;
    this.imgCtx = this.images[color].getContext("2d");
    this.imgCtx.drawImage(this.image, 0, 0, imgSize, imgSize, 0, 0, imgSize, imgSize);
    this.imgCtx.globalCompositeOperation = "source-atop";
    this.imgCtx.fillStyle = color;
    this.imgCtx.fillRect(0, 0, imgSize, imgSize);
  };

  Sparticles.prototype.setupImage = function (callback) {
    if (this.settings.shape === "image" && this.settings.imageUrl) {
      var me = this;
      this.images = {};
      this.image = new Image();

      this.image.onload = function () {
        if (Array.isArray(me.settings.color)) {
          me.settings.color.forEach(function (c) {
            me.getImageCanvas(c);
          });
        } else {
          me.getImageCanvas(me.settings.color);
        }

        callback();
      };

      this.image.onerror = function () {
        console.error("failed to load source image");
      };

      this.image.src = this.settings.imageUrl;
    } else {
      callback();
    }
  };

  Sparticles.prototype.createSparticles = function () {
    this.sparticles = [];

    for (var i = 0; i < this.settings.count; i++) {
      this.sparticles.push(new Sparticle(this));
    }

    return this.sparticles;
  };

  Sparticles.prototype.render = function (t) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.sparticles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var sparticle = _step.value;
        sparticle.update().render(this.image, this.images);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return this.sparticles;
  }; // ======================================================= //

  /**
   * Sparticle Constructor;
   * creates an individual particle for use in the Sparticles() class
   * @param {Object} parent - the parent Sparticles() instance this belongs to
   * @returns {Object} - reference to a new Sparticles instance
   */


  var Sparticle = function Sparticle(parent) {
    if (parent) {
      this.canvas = parent.canvas;
      this.settings = parent.settings;
      this.ctx = this.canvas.getContext("2d");
      this.init();
    } else {
      console.warn("Invalid parameters given to Sparticle()", arguments);
    }

    return this;
  };

  Sparticle.prototype.init = function () {
    var _ = this.settings;
    this.setup();
    this.alpha = random(_.minAlpha, _.maxAlpha);
    this._alpha = this.alpha;
    this.fillColor = this.getColor();
    this.strokeColor = this.getColor();
    this.px = round(random(-this.size * 2, this.canvas.width + this.size));
    this.py = round(random(-this.size * 2, this.canvas.height + this.size));
    this.rotation = _.rotation ? radian(random(0, 360)) : 0;
  };

  Sparticle.prototype.setup = function () {
    var _ = this.settings;
    this.frame = 0;
    this.frameoffset = round(random(0, 360));
    this.size = round(random(_.minSize, _.maxSize));
    this.da = this.getAlphaDelta();
    this.dx = this.getDeltaX();
    this.dy = this.getDeltaY();
    this.df = this.getFloat();
    this.dr = this.getRotation();
  };

  Sparticle.prototype.isOffCanvas = function () {
    var topleft = 0 - this.size * 3;
    var bottom = this.canvas.height + this.size * 3;
    var right = this.canvas.width + this.size * 3;
    return this.px < topleft || this.px > right || this.py < topleft || this.py > bottom;
  };

  Sparticle.prototype.reset = function () {
    this.setup();

    if (this.py < 0) {
      this.py = this.canvas.height + this.size * 2;
    } else if (this.py > this.canvas.height) {
      this.py = 0 - this.size * 2;
    }

    if (this.px < 0) {
      this.px = this.canvas.width + this.size * 2;
    } else if (this.px > this.canvas.width) {
      this.px = 0 - this.size * 2;
    }
  };

  Sparticle.prototype.getColor = function () {
    if (Array.isArray(this.settings.color)) {
      return randomArray(this.settings.color);
    } else {
      return this.settings.color;
    }
  };

  Sparticle.prototype.getAlphaDelta = function () {
    var max = this.settings.twinkle ? 0 : this.settings.alphaVariance;
    var min = -this.settings.alphaVariance;
    return random(min, max) / 10;
  };

  Sparticle.prototype.getDeltaX = function () {
    var d = this.getDelta();
    var dv = this.getDeltaVariance(this.settings.xVariance);
    return cartesian(this.settings.direction)[0] * d + dv;
  };

  Sparticle.prototype.getDeltaY = function () {
    var d = this.getDelta();
    var dv = this.getDeltaVariance(this.settings.yVariance);
    return cartesian(this.settings.direction)[1] * d + dv;
  };

  Sparticle.prototype.getDeltaVariance = function () {
    var v = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var s = this.settings.speed || 10;

    if (v > 0) {
      return random(-v, v) * s / 100;
    } else {
      return 0;
    }
  };

  Sparticle.prototype.getDelta = function () {
    var baseDelta = this.settings.speed * 0.1;

    if (this.settings.speed && this.settings.parallax) {
      return baseDelta + this.size * this.settings.parallax / 50;
    } else {
      return baseDelta;
    }
  };

  Sparticle.prototype.getFloat = function () {
    if (!this.settings.float) {
      return 0;
    } else {
      return random(this.settings.float - this.settings.float / 2, this.settings.float + this.settings.float / 2);
    }
  };

  Sparticle.prototype.getRotation = function () {
    var r = 0;

    if (this.settings.rotation) {
      r = radian(random(0.5, 1.5) * this.settings.rotation);

      if (roll(1 / 2)) {
        r = -r;
      }
    }

    return r;
  };

  Sparticle.prototype.update = function () {
    this.frame += 1;
    this.updatePosition();
    this.updateAlpha();
    return this;
  };

  Sparticle.prototype.updateAlpha = function () {
    var tick = this.da / 1000 * this.settings.alphaSpeed * 10;

    if (this.settings.alphaSpeed > 0) {
      if (this.settings.twinkle) {
        this.updateTwinkle(tick);
      } else {
        this.updateFade(tick);
      }
    }

    this.alpha = clamp(this._alpha, 0, 1);
  };

  Sparticle.prototype.updateFade = function (tick) {
    this._alpha += tick;
    var over = this.da > 0 && this._alpha > this.settings.maxAlpha;
    var under = this.da < 0 && this._alpha < this.settings.minAlpha;

    if (over || under) {
      this.da = -this.da;
      this._alpha = this.settings.maxAlpha;

      if (under) {
        this._alpha = this.settings.minAlpha;
      }
    }
  };

  Sparticle.prototype.updateTwinkle = function (tick) {
    this._alpha += tick;
    var over = this._alpha > this.settings.maxAlpha;
    var under = this._alpha < this.settings.minAlpha;

    if (under) {
      this.resettingTwinkle = true;
    } else if (over) {
      this.resettingTwinkle = false;
    }

    if (this.resettingTwinkle) {
      this._alpha += 0.02 * this.settings.alphaSpeed;
    }
  };

  Sparticle.prototype.updatePosition = function () {
    this.px += this.dx;
    this.py += this.dy;
    this.updateRotate();
    this.updateFloat();

    if (this.isOffCanvas()) {
      this.reset();
    }
  };

  Sparticle.prototype.updateRotate = function () {
    this.rotation += this.dr;
  };

  Sparticle.prototype.updateFloat = function () {
    if (this.settings.float) {
      if (this.settings.direction > 160 && this.settings.direction < 200 || this.settings.direction > 340 && this.settings.direction < 380 || this.settings.direction > -20 && this.settings.direction < 20) {
        this.px += cartesian(this.frame + this.frameoffset)[0] * this.df / (this.getDelta() * 15);
      } else if (this.settings.direction > 70 && this.settings.direction < 110 || this.settings.direction > 250 && this.settings.direction < 290) {
        this.py += cartesian(this.frame + this.frameoffset)[1] * this.df / (this.getDelta() * 15);
      }
    }
  };
  /**
   *
   * @param {HTMLImageElement} [image] an image with a source attribute set
   */


  Sparticle.prototype.render = function (image, images) {
    switch (this.settings.shape) {
      case "image":
        this.renderImage(image, images);
        break;

      case "square":
        this.renderSquare();
        break;

      case "line":
        this.renderLine();
        break;

      case "triangle":
        this.renderTriangle();
        break;

      case "circle":
      default:
        this.renderCircle();
        break;
    }

    return this;
  };

  Sparticle.prototype.renderStyle = function () {
    this.ctx.globalCompositeOperation = this.settings.composition;
    this.ctx.globalAlpha = this.alpha;
    this.ctx.fillStyle = this.fillColor;
    this.ctx.lineWidth = clamp(this.size / 10, 1, 5);
    this.ctx.strokeStyle = this.strokeColor;
  };

  Sparticle.prototype.renderColor = function () {
    if (this.settings.style === "fill" || this.settings.style === "both") {
      this.ctx.fill();
    }

    if (this.settings.style === "stroke" || this.settings.style === "both") {
      this.ctx.stroke();
    }
  };

  Sparticle.prototype.renderRotate = function () {
    if (this.settings.rotation > 0) {
      var centerX = this.px + this.size / 2;
      var centerY = this.py + this.size / 2;
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(this.rotation);
      this.ctx.translate(-centerX, -centerY);
    }
  };

  Sparticle.prototype.renderResetRotate = function () {
    if (this.settings.rotation > 0) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  };

  Sparticle.prototype.renderCircle = function () {
    var size = this.size / 2;
    this.renderStyle();
    this.ctx.beginPath();
    this.ctx.ellipse(this.px, this.py, size, size, 0, 0, 360);
    this.renderColor();
  };

  Sparticle.prototype.renderSquare = function () {
    this.renderRotate();
    this.renderStyle();
    this.ctx.beginPath();
    this.ctx.rect(this.px, this.py, this.size, this.size);
    this.renderColor();
    this.renderResetRotate();
  };

  Sparticle.prototype.renderTriangle = function () {
    var size = this.size;
    var startx = this.px + size / 2;
    var starty = this.py;
    this.renderRotate();
    this.renderStyle();
    this.ctx.beginPath();
    this.ctx.moveTo(startx, starty);
    this.ctx.lineTo(startx + size / 2, starty + size - 1);
    this.ctx.lineTo(startx - size / 2, starty + size - 1);
    this.ctx.closePath();
    this.renderColor();
    this.renderResetRotate();
  };

  Sparticle.prototype.renderLine = function () {
    var size = this.size;
    var startx = this.px;
    var starty = this.py;
    this.renderRotate();
    this.renderStyle();
    this.ctx.beginPath();
    this.ctx.moveTo(startx, starty);
    this.ctx.lineTo(startx + size, starty + size);
    this.ctx.stroke();
    this.renderResetRotate();
  };
  /**
   * @param {HTMLImageElement} [image] an image with a source attribute set
   */


  Sparticle.prototype.renderImage = function (image, images) {
    if (image && image.src) {
      var imgCanvas = images[this.fillColor];
      var imgSize = imgCanvas.width;
      var scale = this.size / imgSize;
      var px = this.px / scale;
      var py = this.py / scale;
      this.renderRotate();
      this.ctx.globalCompositeOperation = this.settings.composition;
      this.ctx.globalAlpha = this.alpha;
      this.ctx.transform(scale, 0, 0, scale, 0, 0);
      this.ctx.drawImage(imgCanvas, 0, 0, imgSize, imgSize, px, py, imgSize, imgSize);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  };

  exports.Sparticles = Sparticles;

  return exports;

}({}));
