/**!
 * Sparticles - Lightweight, High Performance Particles in Canvas
 * @version 0.7.0
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

      if (!this.started) {
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
        this.started = true;
      }
    };
    /**
     * stop the currently running animation loop
     */


    this.stop = function () {
      cancelAnimationFrame(renderId);
      this.started = false;
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
   * Sparticle Constructor;
   * creates an individual particle for use in the Sparticles() class
   * @param {Object} parent - the parent Sparticles() instance this belongs to
   * @returns {Object} - reference to a new Sparticles instance
   */

  var Sparticle = function Sparticle(parent) {
    if (parent) {
      this.canvas = parent.canvas;
      this.images = parent.images;
      this.settings = parent.settings;
      this.ctx = this.canvas.getContext("2d");
      this.init();
    } else {
      console.warn("Invalid parameters given to Sparticle()", arguments);
    }

    return this;
  };
  /**
   * initialise a particle with the default values from
   * the Sparticles instance settings.
   * these values do not change when the particle goes offscreen
   */

  Sparticle.prototype.init = function () {
    this.setup();
    this.alpha = random(this.settings.minAlpha, this.settings.maxAlpha);
    this._alpha = this.alpha;
    this.shape = this.getShape();
    this.fillColor = this.getColor();
    this.strokeColor = this.getColor();
    this.px = round(random(-this.size * 2, this.canvas.width + this.size));
    this.py = round(random(-this.size * 2, this.canvas.height + this.size));
    this.rotation = this.settings.rotation ? radian(random(0, 360)) : 0;
  };
  /**
   * set up the particle with some random values
   * before it is initialised on the canvas
   * these values will randomize when the particle goes offscreen
   */


  Sparticle.prototype.setup = function () {
    var _ = this.settings;
    this.frame = 0;
    this.frameoffset = round(random(0, 360));
    this.size = round(random(_.minSize, _.maxSize));
    this.da = this.getAlphaDelta();
    this.dx = this.getDeltaX();
    this.dy = this.getDeltaY();
    this.df = this.getFloatDelta();
    this.dr = this.getRotationDelta();
  };
  /**
   * check if the particle is off the canvas or not
   * @returns {Boolean} is the particle completely off canvas
   */


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
    }
  };

  Sparticle.prototype.getShape = function () {
    var shape = this.settings.shape;

    if (Array.isArray(shape)) {
      if (shape[0] === "image" && this.images) {
        return randomArray(this.images);
      } else {
        return randomArray(shape);
      }
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

  Sparticle.prototype.getAlphaDelta = function () {
    var max = this.settings.twinkle ? 0 : this.settings.alphaVariance;
    var min = -this.settings.alphaVariance;
    return random(min, max) / 10;
  };

  Sparticle.prototype.getFloatDelta = function () {
    if (!this.settings.float) {
      return 0;
    } else {
      return random(this.settings.float - this.settings.float / 2, this.settings.float + this.settings.float / 2);
    }
  };

  Sparticle.prototype.getRotationDelta = function () {
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
    if (this.isOffCanvas()) {
      this.reset();
    } else {
      this.px += this.dx;
      this.py += this.dy;
      this.updateRotate();
      this.updateFloat();
    }
  };

  Sparticle.prototype.updateRotate = function () {
    this.rotation += this.dr;
  };

  Sparticle.prototype.updateFloat = function () {
    if (this.settings.float && this.settings.speed) {
      if (this.settings.direction > 160 && this.settings.direction < 200 || this.settings.direction > 340 && this.settings.direction < 380 || this.settings.direction > -20 && this.settings.direction < 20) {
        this.px += cartesian(this.frame + this.frameoffset)[0] * this.df / (this.getDelta() * 15);
      } else if (this.settings.direction > 70 && this.settings.direction < 110 || this.settings.direction > 250 && this.settings.direction < 290) {
        this.py += cartesian(this.frame + this.frameoffset)[1] * this.df / (this.getDelta() * 15);
      }
    }
  };

  Sparticle.prototype.render = function (images) {
    var offscreenCanvas = images[this.fillColor][this.shape];
    var canvasSize = offscreenCanvas.width;
    var scale = this.size / canvasSize;
    var px = this.px / scale;
    var py = this.py / scale;
    this.renderRotate();
    this.ctx.globalAlpha = this.alpha;
    this.ctx.transform(scale, 0, 0, scale, 0, 0);

    if (this.ctx.globalCompositeOperation !== this.settings.composition) {
      this.ctx.globalCompositeOperation = this.settings.composition;
    }

    this.ctx.drawImage(offscreenCanvas, 0, 0, canvasSize, canvasSize, px, py, canvasSize, canvasSize);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    return this;
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

  /**
   * Sparticles Constructor;
   * Create a <canvas>, append to the given node, and start the particle effect
   * @param {HTMLElement} [node] - element to which canvas is appended to
   * @param {Object} [options] - settings to use for the particle effect
   * @param {String} [options.composition=source-over] - canvas globalCompositeOperation value for particles
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
   * @param {Number} [options.glow=0] - the glow effect size of each particle
   * @param {Boolean} [options.twinkle=false] - particles to exhibit an alternative alpha transition as "twinkling"
   * @param {String} [options.imageUrl=] - if style is "image", define an image url (can be data-uri, must be square (1:1 ratio))
   * @param {(String|String[])} [options.color=white] - css color as string, or array or color strings (can also be "rainbow")
   * @param {Number} [width] - the width of the canvas element
   * @param {Number} [height] - the height of the canvas element
   * @returns - reference to a new Sparticles instance
   */

  var Sparticles = function Sparticles() {
    var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var width = arguments.length > 2 ? arguments[2] : undefined;
    var height = arguments.length > 3 ? arguments[3] : undefined;
    var defaults = {
      alphaSpeed: 10,
      alphaVariance: 1,
      color: "white",
      composition: "source-over",
      count: 50,
      direction: 180,
      float: 1,
      glow: 0,
      imageUrl: "",
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
    this.el = node;
    this.width = width || this.el.clientWidth;
    this.height = height || this.el.clientHeight;
    this.settings = _objectSpread2({}, defaults, {}, options);
    this.init();
    return this;
  };

  Sparticles.prototype.init = function () {
    var _this = this;

    this.sparticles = [];
    this.createColorArray();
    this.createShapeArray();
    this.setupMainCanvas();
    this.setupOffscreenCanvasses(function () {
      _this.createSparticles();

      _this.start();
    });
  };
  /**
   * start/resume the sparticles animation
   */


  Sparticles.prototype.start = function () {
    var me = this;

    if (!this.loop) {
      this.loop = new AnimationFrame(function (t) {
        me.render(t);
      });
    }

    this.loop.start();
  };
  /**
   * stop/pause the sparticles animation
   */


  Sparticles.prototype.stop = function () {
    this.loop.stop();
  };
  /**
   * destroy the current instance and free up some memory
   */


  Sparticles.prototype.destroy = function () {
    this.stop();
    this.sparticles = null;
    this.canvasses = null;
    this.start = null;
    this.stop = null;
    this.init = null;
    this.settings = null;
    this.el.removeChild(this.canvas);
  };
  /**
   * convert the input color to an array if it isn't already
   * @returns {Array} - array of colors for use in rendering
   */


  Sparticles.prototype.createColorArray = function () {
    if (!Array.isArray(this.settings.color)) {
      if (this.settings.color === "rainbow") {
        var colors = 50;
        this.settings.color = [];

        for (var i = 0; i < colors; i++) {
          this.settings.color[i] = randomHsl();
        }
      } else {
        this.settings.color = [this.settings.color];
      }
    }

    return this.settings.color;
  };
  /**
   * convert the input shape to an array if it isn't already
   * @returns {Array} - array of shapes for use in rendering
   */


  Sparticles.prototype.createShapeArray = function () {
    if (!Array.isArray(this.settings.shape)) {
      if (this.settings.shape === "random") {
        shapes = ["square", "circle", "triangle", "line"];
      } else {
        this.settings.shape = [this.settings.shape];
      }
    }

    return this.settings.shape;
  };
  /**
   * set up the canvas and bind to a property for
   * access later on, append it to the DOM
   * @returns {HTMLCanvasElement} - the canvas element which was appended to DOM
   */


  Sparticles.prototype.setupMainCanvas = function () {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.globalCompositeOperation = this.settings.composition;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.el.appendChild(this.canvas);
    return this.canvas;
  };
  /**
   * create a new offscreen canvas element for each color & shape
   * combination, so that we can reference it later during render
   * (huge performance gains here)
   * @param {Function} [callback] - function to execute after image loads
   * @returns {HTMLCanvasElement} - the created offscreen canvas
   */


  Sparticles.prototype.setupOffscreenCanvasses = function (callback) {
    var _this2 = this;

    this.canvasses = this.canvasses || {};
    this.settings.color.forEach(function (color) {
      _this2.canvasses[color] = _this2.canvasses[color] || {};

      if (_this2.settings.shape[0] === "image") {
        _this2.loadAndDrawImages(color, callback);
      } else {
        _this2.settings.shape.forEach(function (shape) {
          _this2.canvasses[color][shape] = document.createElement("canvas");
          var canvas = _this2.canvasses[color][shape];
          var ctx = canvas.getContext("2d");

          switch (shape) {
            case "square":
              _this2.drawSquareOffscreenCanvas(canvas, ctx, color);

              if (callback) callback();
              break;

            case "line":
              _this2.drawLineOffscreenCanvas(canvas, ctx, color);

              if (callback) callback();
              break;

            case "triangle":
              _this2.drawTriangleOffscreenCanvas(canvas, ctx, color);

              if (callback) callback();
              break;

            case "circle":
            default:
              _this2.drawCircleOffscreenCanvas(canvas, ctx, color);

              if (callback) callback();
              break;
          }
        });
      }
    });
  };
  /**
   * return the size of the glow effect (shadowBlur) for each particle
   * @param {Number} size - the size of the particle
   * @returns {Number} - the size of the glow/shadow
   */


  Sparticles.prototype.getGlowSize = function (size) {
    return this.settings.glow;
  };
  /**
   * return the outline or stroke size of each particle
   * @param {Number} size - the size of the particle
   * @returns {Number} - the size of the outline/stroke
   */


  Sparticles.prototype.getLineSize = function (size) {
    return clamp(size / 20, 1, 5);
  };
  /**
   * set the fill/stroke style (color & width) for each particle's offscreen canvas
   * @param {CanvasRenderingContext2D} ctx - the canvas context
   * @param {String} color - the color to fill/stroke with
   * @param {Number} lineSize - size/thickness of the stroke
   */


  Sparticles.prototype.renderStyle = function (ctx, color, lineSize) {
    if (this.settings.style === "fill") {
      ctx.fillStyle = color;
    } else {
      ctx.lineWidth = lineSize;
      ctx.strokeStyle = color;
    }
  };
  /**
   * set the shadowBlur (glow effect) for each particle's offscreen canvas
   * @param {CanvasRenderingContext2D} ctx - the canvas context
   * @param {String} color - the color to fill/stroke with
   * @param {Number} size - size of the shadow/glow
   */


  Sparticles.prototype.renderGlow = function (ctx, color, size) {
    var glowSize = this.getGlowSize(size) / 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = glowSize;
  };
  /**
   * fill or stroke each particle's offscreen canvas depending on the given setting
   * @param {CanvasRenderingContext2D} ctx - the canvas context
   */


  Sparticles.prototype.renderColor = function (ctx) {
    if (this.settings.style === "fill") {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  };
  /**
   * create, setup and render an offscreen canvas for a
   * Square Particle of the given color
   * @param {HTMLCanvasElement} canvas - the canvas element
   * @param {CanvasRenderingContext2D} ctx - the canvas context
   * @param {String} color - the color to fill/stroke with
   * @returns {HTMLCanvasElement} - the created offscreen canvas
   */


  Sparticles.prototype.drawSquareOffscreenCanvas = function (canvas, ctx, color) {
    var size = this.settings.maxSize;
    var lineSize = this.getLineSize(size);
    var glowSize = this.getGlowSize(size);
    var canvasSize = size + lineSize + glowSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    this.renderGlow(ctx, color, size);
    this.renderStyle(ctx, color, lineSize);
    ctx.beginPath();
    ctx.rect(canvasSize / 2 - size / 2, canvasSize / 2 - size / 2, size, size);
    this.renderColor(ctx, color);
    return canvas;
  };
  /**
   * create, setup and render an offscreen canvas for a
   * Line/Curve Particle of the given color
   * @param {HTMLCanvasElement} canvas - the canvas element
   * @param {CanvasRenderingContext2D} ctx - the canvas context
   * @param {String} color - the color to fill/stroke with
   * @returns {HTMLCanvasElement} - the created offscreen canvas
   */


  Sparticles.prototype.drawLineOffscreenCanvas = function (canvas, ctx, color) {
    var size = this.settings.maxSize * 2;
    var lineSize = this.getLineSize(size);
    var glowSize = this.getGlowSize(size);
    var canvasSize = size + lineSize + glowSize;
    var startx = canvasSize / 2 - size / 2;
    var starty = canvasSize / 2 - size / 2;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    this.renderGlow(ctx, color, size);
    ctx.lineWidth = lineSize;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startx, starty);
    ctx.lineTo(startx + size, starty + size);
    ctx.stroke();
    ctx.closePath();
    return canvas;
  };
  /**
   * create, setup and render an offscreen canvas for a
   * Triangle Particle of the given color
   * @param {HTMLCanvasElement} canvas - the canvas element
   * @param {CanvasRenderingContext2D} ctx - the canvas context
   * @param {String} color - the color to fill/stroke with
   * @returns {HTMLCanvasElement} - the created offscreen canvas
   */


  Sparticles.prototype.drawTriangleOffscreenCanvas = function (canvas, ctx, color) {
    var size = this.settings.maxSize;
    var lineSize = this.getLineSize(size);
    var glowSize = this.getGlowSize(size);
    var canvasSize = size + lineSize + glowSize;
    var height = size * (Math.sqrt(3) / 2);
    var startx = canvasSize / 2;
    var starty = canvasSize / 2 - size / 2;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    this.renderGlow(ctx, color, size);
    this.renderStyle(ctx, color, lineSize);
    ctx.beginPath();
    ctx.moveTo(startx, starty);
    ctx.lineTo(startx - size / 2, starty + height);
    ctx.lineTo(startx + size / 2, starty + height);
    ctx.closePath();
    this.renderColor(ctx, color);
    return canvas;
  };
  /**
   * set up the needed array for referencing the images in the Sparticle()
   * instance, then loop through each image and load it before running the callback
   * @param {String} color - the color of the image that we're loading
   * @param {Function} callback - callback function to run after images load
   */


  Sparticles.prototype.loadAndDrawImages = function (color, callback) {
    var _this3 = this;

    var imgUrls = this.settings.imageUrl;
    var imageUrls = Array.isArray(imgUrls) ? imgUrls : [imgUrls];
    var imageCount = imageUrls.length;
    var imagesLoaded = 0;
    this.images = [];
    imageUrls.forEach(function (imageUrl, i) {
      var imgName = "image" + i;

      _this3.images.push(imgName);

      _this3.canvasses[color][imgName] = document.createElement("canvas");
      var canvas = _this3.canvasses[color][imgName];
      var ctx = canvas.getContext("2d");
      var image = new Image();

      image.onload = function () {
        imagesLoaded++;

        _this3.drawImageOffscreenCanvas(image, canvas, ctx, color);

        if (callback && imagesLoaded === imageCount) {
          callback();
        }
      };

      image.onerror = function () {
        console.error("failed to load source image: ", imageUrl);
      };

      image.src = imageUrl;
    });
  };
  /**
   * create, setup and render an offscreen canvas for a
   * Custom Image Particle of the given color
   * @param {HTMLImageElement} image - the image element that has loaded
   * @param {HTMLCanvasElement} canvas - the canvas element
   * @param {CanvasRenderingContext2D} ctx - the canvas context
   * @param {String} color - the color to fill/stroke with
   * @returns {HTMLCanvasElement} - the created offscreen canvas
   */


  Sparticles.prototype.drawImageOffscreenCanvas = function (image, canvas, ctx, color) {
    var size = image.width;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(image, 0, 0, size, size, 0, 0, size, size);
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    return canvas;
  };
  /**
   * create, setup and render an offscreen canvas for a
   * Circle Particle of the given color
   * @param {HTMLCanvasElement} canvas - the canvas element
   * @param {CanvasRenderingContext2D} ctx - the canvas context
   * @param {String} color - the color to fill/stroke with
   * @returns {HTMLCanvasElement} - the created offscreen canvas
   */


  Sparticles.prototype.drawCircleOffscreenCanvas = function (canvas, ctx, color) {
    var size = this.settings.maxSize;
    var lineSize = this.getLineSize(size);
    var glowSize = this.getGlowSize(size);
    var canvasSize = size + lineSize + glowSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    this.renderGlow(ctx, color, size);
    this.renderStyle(ctx, color, lineSize);
    ctx.beginPath();
    ctx.ellipse(canvasSize / 2, canvasSize / 2, size / 2, size / 2, 0, 0, 360);
    this.renderColor(ctx, color);
    return canvas;
  };
  /**
   * create an array, and then loop through to the count
   * value and populate the array with new Sparticle instances.
   * @returns {Array} the array of Sparticle instances
   */


  Sparticles.prototype.createSparticles = function () {
    this.sparticles = [];

    for (var i = 0; i < this.settings.count; i++) {
      this.sparticles.push(new Sparticle(this));
    }

    this.sparticles.sort(function (a, b) {
      return a.size > b.size;
    });
    return this.sparticles;
  };
  /**
   * wipe the canvas, update each particle, and then render
   * each particle to the canvas
   * @returns {Array} the array of Sparticle instances
   */


  Sparticles.prototype.render = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.sparticles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var sparticle = _step.value;
        sparticle.update().render(this.canvasses);
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
  };

  exports.Sparticles = Sparticles;

  return exports;

}({}));
