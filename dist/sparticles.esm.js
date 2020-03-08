/**!
 * Sparticles - Lightweight, High Performance Particles in Canvas
 * @version 0.11.1
 * @license MPL-2.0
 * @author simeydotme <simey.me@gmail.com>
 */

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

  if (min === max) {
    value = min;
  } else if ((min !== 0 || max !== 1) && max > min) {
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
 * @returns {Object} - reference to a new Sparticle instance
 */

var Sparticle = function Sparticle(parent) {
  if (parent) {
    this.canvas = parent.canvas;
    this.images = parent.images;
    this.settings = parent.settings;
    this.ctx = parent.canvas.getContext("2d");
    this.setup();
    this.init();
  } else {
    console.warn("Invalid parameters given to Sparticle()", arguments);
  }

  return this;
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
  this.dd = this.getDriftDelta();
  this.dr = this.getRotationDelta();
  this.alpha = random(_.minAlpha, _.maxAlpha);
  this.shape = this.getShapeOrImage();
  this.style = this.getStyle();
  this.color = this.getColor();
  this.rotation = _.rotate ? radian(random(0, 360)) : 0;
};
/**
 * initialise a particle with the default values from
 * the Sparticles instance settings.
 * these values do not change when the particle goes offscreen
 */


Sparticle.prototype.init = function () {
  this.initPosition();
};

Sparticle.prototype.initPosition = function () {
  var _ = this.settings;
  var canvas = this.canvas;

  if (_.bounce) {
    if (_.speed === 0) {
      if (_.alphaSpeed > 0) {
        this.alpha = 0;
      }

      this.px = canvas.width / 2 - this.size / 2;
      this.py = canvas.height / 2 - this.size / 2;
    } else {
      this.px = round(random(2, canvas.width - this.size - 2));
      this.py = round(random(2, canvas.height - this.size - 2));
    }
  } else {
    this.px = round(random(-this.size * 2, canvas.width + this.size));
    this.py = round(random(-this.size * 2, canvas.height + this.size));
  }
};
/**
 * reset the particle after it has gone off canvas.
 * this should be better than popping it from the array
 * and creating a new particle instance.
 */


Sparticle.prototype.reset = function () {
  // give the particle a new set of initial values
  this.setup(); // set the particle's Y position

  if (this.py < 0) {
    this.py = this.canvas.height + this.size * 2;
  } else if (this.py > this.canvas.height) {
    this.py = 0 - this.size * 2;
  } // set the particle's X position


  if (this.px < 0) {
    this.px = this.canvas.width + this.size * 2;
  } else if (this.px > this.canvas.width) {
    this.px = 0 - this.size * 2;
  }
};
/**
 * bounce the particle off the edge of canvas
 * when it has touched
 */


Sparticle.prototype.bounce = function () {
  // reverse the particle's Y position
  if (this.py <= 0 || this.py + this.size >= this.canvas.height) {
    this.dy = -this.dy;
  } // reverse the particle's X position


  if (this.px <= 0 || this.px + this.size >= this.canvas.width) {
    this.dx = -this.dx;
  }
};
/**
 * check if the particle is off the canvas based
 * on it's current position
 * @returns {Boolean} is the particle completely off canvas
 */


Sparticle.prototype.isOffCanvas = function () {
  var topleft = 0 - this.size * 2;
  var bottom = this.canvas.height + this.size * 2;
  var right = this.canvas.width + this.size * 2;
  return this.px < topleft || this.px > right || this.py < topleft || this.py > bottom;
};
/**
 * check if the particle is touching the canvas edge
 * @returns {Boolean} is the particle touching edge
 */


Sparticle.prototype.isTouchingEdge = function () {
  var topleft = 0;
  var bottom = this.canvas.height - this.size;
  var right = this.canvas.width - this.size;
  return this.px < topleft || this.px > right || this.py < topleft || this.py > bottom;
};
/**
 * get a random color for the particle from the
 * array of colors set in the options object
 * @returns {String} - random color from color array
 */


Sparticle.prototype.getColor = function () {
  if (Array.isArray(this.settings.color)) {
    return randomArray(this.settings.color);
  }
};
/**
 * get a random shape or image for the particle from the
 * array of shapes set in the options object, or the array
 * of images, if the shape is set to "image"
 * @returns {String} - random shape or image from shape or image array
 */


Sparticle.prototype.getShapeOrImage = function () {
  var shape = this.settings.shape;

  if (Array.isArray(shape)) {
    if (shape[0] === "image" && this.images) {
      return randomArray(this.images);
    } else {
      return randomArray(shape);
    }
  }
};
/**
 * get the style of the particle, either "fill" or "stroke"
 * depending on the settings as fill/stroke/both
 * @returns {String} - either "fill" or "stroke"
 */


Sparticle.prototype.getStyle = function () {
  var style = this.settings.style;

  if (style !== "fill" && style !== "stroke") {
    style = randomArray(["fill", "stroke"]);
  }

  return style;
};
/**
 * get a random delta (velocity) for the particle
 * based on the speed, and the parallax value (if applicable)
 * @returns {Number} - the velocity to be applied to the particle
 */


Sparticle.prototype.getDelta = function () {
  var baseDelta = this.settings.speed * 0.1;

  if (this.settings.speed && this.settings.parallax) {
    return baseDelta + this.size * this.settings.parallax / 50;
  } else {
    return baseDelta;
  }
};
/**
 * get a random variable speed for use as a multiplier,
 * based on the values given in the settings object, this
 * can be positive or negative
 * @returns {Number} - a variable delta speed
 */


Sparticle.prototype.getDeltaVariance = function () {
  var v = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var s = this.settings.speed || 10;

  if (v > 0) {
    return random(-v, v) * s / 100;
  } else {
    return 0;
  }
};
/**
 * get a random delta on the X axis, taking in to account
 * the variance range in the settings object and the particle's
 * direction as a multiplier
 * @returns {Number} - the X delta to be applied to particle
 */


Sparticle.prototype.getDeltaX = function () {
  var d = this.getDelta();
  var dv = this.getDeltaVariance(this.settings.xVariance);
  return cartesian(this.settings.direction)[0] * d + dv;
};
/**
 * get a random delta on the Y axis, taking in to account
 * the variance range in the settings object and the particle's
 * direction as a multiplier
 * @returns {Number} - the Y delta to be applied to particle
 */


Sparticle.prototype.getDeltaY = function () {
  var d = this.getDelta();
  var dv = this.getDeltaVariance(this.settings.yVariance);
  return cartesian(this.settings.direction)[1] * d + dv;
};
/**
 * get a random delta for the alpha change over time from
 * between a positive and negative alpha variance value
 * (but only return a negative value for twinkle effect)
 * @returns {Number} - the alpha delta to be applied to particle
 */


Sparticle.prototype.getAlphaDelta = function () {
  var variance = this.settings.alphaVariance;
  var a = random(1, variance + 1);

  if (roll(1 / 2)) {
    a = -a;
  }

  return a;
};
/**
 * return a random drift value either positive or negative
 * @returns {Number} - the drift value
 */


Sparticle.prototype.getDriftDelta = function () {
  if (!this.settings.drift) {
    return 0;
  } else {
    return random(this.settings.drift - this.settings.drift / 2, this.settings.drift + this.settings.drift / 2);
  }
};
/**
 * return a random rotation value either positive or negative
 * @returns {Number} - the drift value
 */


Sparticle.prototype.getRotationDelta = function () {
  var r = 0;

  if (this.settings.rotate && this.settings.rotation) {
    r = radian(random(0.5, 1.5) * this.settings.rotation);

    if (roll(1 / 2)) {
      r = -r;
    }
  }

  return r;
};
/**
 * progress the particle's frame number, as well
 * as the internal values for both the particle's
 * position and the particle's alpha.
 * @returns {Object} - reference to the current Sparticle instance
 */


Sparticle.prototype.update = function () {
  this.frame += 1;
  this.updatePosition();
  this.updateAlpha();
  return this;
};
/**
 * progress the particle's alpha value depending on the
 * alphaSpeed and the twinkle setting
 * @returns {Number} - new alpha value of the particle
 */


Sparticle.prototype.updateAlpha = function () {
  if (this.settings.alphaSpeed > 0) {
    if (this.settings.twinkle) {
      this.alpha = this.updateTwinkle();
    } else {
      this.alpha = this.updateFade();
    }
  }

  return this.alpha;
};
/**
 * progress the particle's alpha value according to
 * the fading effect
 * @returns {Number} - new alpha value of the particle
 */


Sparticle.prototype.updateFade = function () {
  var tick = this.da / 1000 * this.settings.alphaSpeed * 0.5;
  var alpha = this.alpha + tick;
  var over = this.da > 0 && alpha > this.settings.maxAlpha;
  var under = this.da < 0 && alpha < this.settings.minAlpha; // if the alpha is over or under the min or max values,
  // then we reverse the delta so that it can increase or
  // decrease in opacity in the opposite direction

  if (over || under) {
    this.da = -this.da;
    alpha = this.settings.maxAlpha;

    if (under) {
      alpha = this.settings.minAlpha;
    }
  }

  return alpha;
};
/**
 * progress the particle's alpha value according to
 * the twinkle effect
 * @returns {Number} - new alpha value of the particle
 */


Sparticle.prototype.updateTwinkle = function () {
  var alpha = this.alpha;
  var delta = Math.abs(this.da);
  var over = alpha > this.settings.maxAlpha;
  var under = alpha < this.settings.minAlpha;
  var tick = delta / 1000 * this.settings.alphaSpeed * 0.5; // if the particle is resetting the twinkle effect, then
  // we simply want to quickly get back to max alpha
  // over a short period of time, otherwise just advance the tick

  if (this.resettingTwinkle) {
    alpha += 0.02 * this.settings.alphaSpeed;
  } else {
    alpha -= tick;
  } // once the alpha is under the min alpha value, then we need
  // to set the twinkle effect to reset, and once it is over
  // the max alpha, we stop resetting.


  if (under) {
    this.resettingTwinkle = true;
    alpha = this.settings.minAlpha;
  } else if (over) {
    this.resettingTwinkle = false;
    alpha = this.settings.maxAlpha;
  }

  return alpha;
};
/**
 * progress the particle's position values, rotation and drift
 * according to the settings given
 */


Sparticle.prototype.updatePosition = function () {
  if (this.settings.bounce && this.isTouchingEdge()) {
    this.bounce();
    this.px += this.dx;
    this.py += this.dy;
  } else if (this.isOffCanvas()) {
    this.reset();
  } else {
    this.px += this.dx;
    this.py += this.dy; // drift must be applied after position x/y

    this.updateDrift();
    this.updateRotation();
  }
};
/**
 * progress the particle's rotation value according
 * to the settings given
 */


Sparticle.prototype.updateRotation = function () {
  if (this.settings.rotate && this.settings.rotation) {
    this.rotation += this.dr;
  }
};
/**
 * progress the particle's drift value according
 * to the settings given
 */


Sparticle.prototype.updateDrift = function () {
  if (this.settings.drift && this.settings.speed) {
    if (this.settings.direction > 150 && this.settings.direction < 210 || this.settings.direction > 330 && this.settings.direction < 390 || this.settings.direction > -30 && this.settings.direction < 30) {
      // only apply horizontal drift if the particle's direction
      // is somewhat vertical
      this.px += cartesian(this.frame + this.frameoffset)[0] * this.dd / (this.getDelta() * 15);
    } else if (this.settings.direction > 60 && this.settings.direction < 120 || this.settings.direction > 240 && this.settings.direction < 300) {
      // only apply vertical drift if the particle's direction
      // is somewhat horizontal
      this.py += cartesian(this.frame + this.frameoffset)[1] * this.dd / (this.getDelta() * 15);
    }
  }
};

Sparticle.prototype.render = function (canvasses) {
  var offscreenCanvas = canvasses[this.color][this.shape][this.style];
  var canvasSize = offscreenCanvas.width;
  var scale = this.size / canvasSize;
  var px = this.px / scale;
  var py = this.py / scale;
  this.renderRotate();
  this.ctx.globalAlpha = clamp(this.alpha, 0, 1);
  this.ctx.transform(scale, 0, 0, scale, 0, 0);

  if (this.ctx.globalCompositeOperation !== this.settings.composition) {
    this.ctx.globalCompositeOperation = this.settings.composition;
  }

  this.ctx.drawImage(offscreenCanvas, 0, 0, canvasSize, canvasSize, px, py, canvasSize, canvasSize);
  this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  return this;
};

Sparticle.prototype.renderRotate = function () {
  if (this.settings.rotate) {
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
 * @param {Number} [options.rotate=true] - can particles rotate
 * @param {Number} [options.rotation=1] - default rotational speed for every particle
 * @param {Number} [options.alphaSpeed=10] - rate of change in alpha over time
 * @param {Number} [options.alphaVariance=1] - random deviation of alpha change
 * @param {Number} [options.minAlpha=0] - minumum alpha value of every particle
 * @param {Number} [options.maxAlpha=1] - maximum alpha value of every particle
 * @param {Number} [options.minSize=1] - minimum size of every particle
 * @param {Number} [options.maxSize=10] - maximum size of every particle
 * @param {String} [options.style=fill] - fill style of particles (one of; "fill", "stroke" or "both")
 * @param {Boolean} [options.bounce=false] - should the particles bounce off edge of canvas
 * @param {Number} [options.drift=1] - the "driftiness" of particles which have a horizontal/vertical direction
 * @param {Number} [options.glow=0] - the glow effect size of each particle
 * @param {Boolean} [options.twinkle=false] - particles to exhibit an alternative alpha transition as "twinkling"
 * @param {(String|String[])} [options.color=white] - css color as string, or array of color strings (can also be "rainbow")
 * @param {(String|String[])} [options.shape=circle] - shape of particles (any of; circle, square, triangle, diamond, line, image) or "random"
 * @param {(String|String[])} [options.imageUrl=] - if shape is "image", define an image url (can be data-uri, must be square (1:1 ratio))
 * @param {Number} [width] - the width of the canvas element
 * @param {Number} [height] - the height of the canvas element
 * @returns - reference to a new Sparticles instance
 */

var Sparticles = function Sparticles(node) {
  var _this = this;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var width = arguments.length > 2 ? arguments[2] : undefined;
  var height = arguments.length > 3 ? arguments[3] : undefined;

  if (arguments.length === 1 && !(arguments[0] instanceof HTMLElement)) {
    options = node;
    node = undefined;
  }

  var defaults = {
    alphaSpeed: 10,
    alphaVariance: 1,
    bounce: false,
    color: "white",
    composition: "source-over",
    count: 50,
    direction: 180,
    drift: 1,
    glow: 0,
    imageUrl: "",
    maxAlpha: 1,
    maxSize: 10,
    minAlpha: 0,
    minSize: 1,
    parallax: 1,
    rotate: true,
    rotation: 1,
    shape: "circle",
    speed: 10,
    style: "fill",
    twinkle: false,
    xVariance: 2,
    yVariance: 2
  };
  this.el = node || document.body;
  this.settings = _objectSpread2({}, defaults, {}, options);
  this.init(width, height);
  window.addEventListener("resize", function () {
    clearTimeout(_this.resizeTimer);
    _this.resizeTimer = setTimeout(function () {
      _this.setCanvasSize();

      _this.createSparticles();
    }, 200);
  });
  return this;
};
/**
 * initialise the sparticles instance
 * @param {Number} width - the width of the canvas if not fluid
 * @param {Number} height - the height of the canvas if not fluid
 */


Sparticles.prototype.init = function (width, height) {
  var _this2 = this;

  this.sparticles = [];
  this.createColorArray();
  this.createShapeArray();
  this.setupMainCanvas(width, height);
  this.setupOffscreenCanvasses(function () {
    _this2.createSparticles();

    _this2.start();
  });
};
/**
 * start/resume the sparticles animation
 */


Sparticles.prototype.start = function () {
  var me = this;

  if (!this.loop) {
    this.loop = new AnimationFrame(function (t) {
      me.drawFrame(t);
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
  // stop the rendering and updating
  this.stop(); // remove the canvas element from the DOM

  this.el.removeChild(this.canvas); // delete all the properties from the instance
  // to free up memory

  for (var prop in this) {
    if (this.hasOwnProperty(prop)) {
      delete this[prop];
    }
  }
};
/**
 * set the canvas height and width based on either the input
 * dom element, or the given width and height.
 * @param {Number} width - the width of the canvas if not fluid
 * @param {Number} height - the height of the canvas if not fluid
 * @returns {HTMLCanvasElement} - the canvas element of the instance
 */


Sparticles.prototype.setCanvasSize = function (width, height) {
  if (typeof this.resizable === "undefined") {
    this.resizable = !width && !height;
  }

  if (this.resizable) {
    this.width = this.el.clientWidth;
    this.height = this.el.clientHeight;
  } else {
    this.width = width;
    this.height = height;
  }

  this.canvas.width = this.width;
  this.canvas.height = this.height;
  return this.canvas;
};
/**
 * convert the input color to an array if it isn't already
 * @returns {Array} - array of colors for use in rendering
 */


Sparticles.prototype.createColorArray = function () {
  if (!Array.isArray(this.settings.color)) {
    if (this.settings.color === "rainbow") {
      var colors = 100;
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
      this.settings.shape = ["square", "circle", "triangle", "diamond"];
    } else {
      this.settings.shape = [this.settings.shape];
    }
  }

  return this.settings.shape;
};
/**
 * set up the canvas and bind to a property for
 * access later on, append it to the DOM
 * @param {Number} width - the width of the canvas if not fluid
 * @param {Number} height - the height of the canvas if not fluid
 * @returns {HTMLCanvasElement} - the canvas element which was appended to DOM
 */


Sparticles.prototype.setupMainCanvas = function (width, height) {
  this.canvas = document.createElement("canvas");
  this.ctx = this.canvas.getContext("2d");
  this.ctx.globalCompositeOperation = this.settings.composition;
  this.setCanvasSize(width, height);
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
  var _this3 = this;

  this.canvasses = this.canvasses || {};
  this.settings.color.forEach(function (color) {
    _this3.canvasses[color] = _this3.canvasses[color] || {};

    if (_this3.settings.shape[0] === "image") {
      _this3.loadAndDrawImages(color, callback);
    } else {
      _this3.settings.shape.forEach(function (shape) {
        _this3.canvasses[color][shape] = _this3.canvasses[color][shape] || {};
        ["fill", "stroke"].forEach(function (style) {
          _this3.canvasses[color][shape][style] = document.createElement("canvas");
          var canvas = _this3.canvasses[color][shape][style];
          var ctx = canvas.getContext("2d");

          switch (shape) {
            case "square":
              _this3.drawOffscreenCanvasForSquare(canvas, ctx, color, style);

              if (callback) callback();
              break;

            case "line":
              _this3.drawOffscreenCanvasForLine(canvas, ctx, color, style);

              if (callback) callback();
              break;

            case "triangle":
              _this3.drawOffscreenCanvasForTriangle(canvas, ctx, color, style);

              if (callback) callback();
              break;

            case "diamond":
              _this3.drawOffscreenCanvasForDiamond(canvas, ctx, color, style);

              if (callback) callback();
              break;

            case "star":
              _this3.drawOffscreenCanvasForStar(canvas, ctx, color, style);

              if (callback) callback();
              break;

            case "circle":
            default:
              _this3.drawOffscreenCanvasForCircle(canvas, ctx, color, style);

              if (callback) callback();
              break;
          }
        });
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
 * @param {String} style - style (either "fill" or "stroke")
 */


Sparticles.prototype.renderStyle = function (ctx, color, lineSize, style) {
  if (style === "fill") {
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
 * @param {String} style - style (either "fill" or "stroke")
 */


Sparticles.prototype.renderColor = function (ctx, style) {
  if (style === "fill") {
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
 * @param {String} style -  style (either "fill" or "stroke")
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */


Sparticles.prototype.drawOffscreenCanvasForSquare = function (canvas, ctx, color, style) {
  var size = this.settings.maxSize;
  var lineSize = this.getLineSize(size);
  var glowSize = this.getGlowSize(size);
  var canvasSize = size + lineSize + glowSize;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  this.renderGlow(ctx, color, size);
  this.renderStyle(ctx, color, lineSize, style);
  ctx.beginPath();
  ctx.rect(canvasSize / 2 - size / 2, canvasSize / 2 - size / 2, size, size);
  this.renderColor(ctx, style);
  return canvas;
};
/**
 * create, setup and render an offscreen canvas for a
 * Line/Curve Particle of the given color
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @param {CanvasRenderingContext2D} ctx - the canvas context
 * @param {String} color - the color to fill/stroke with
 * @param {String} style -  style (either "fill" or "stroke")
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */


Sparticles.prototype.drawOffscreenCanvasForLine = function (canvas, ctx, color, style) {
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
 * @param {String} style -  style (either "fill" or "stroke")
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */


Sparticles.prototype.drawOffscreenCanvasForTriangle = function (canvas, ctx, color, style) {
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
  this.renderStyle(ctx, color, lineSize, style);
  ctx.beginPath();
  ctx.moveTo(startx, starty);
  ctx.lineTo(startx - size / 2, starty + height);
  ctx.lineTo(startx + size / 2, starty + height);
  ctx.closePath();
  this.renderColor(ctx, style);
  return canvas;
};
/**
 * create, setup and render an offscreen canvas for a
 * Diamond Sparkle Particle of the given color
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @param {CanvasRenderingContext2D} ctx - the canvas context
 * @param {String} color - the color to fill/stroke with
 * @param {String} style -  style (either "fill" or "stroke")
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */


Sparticles.prototype.drawOffscreenCanvasForDiamond = function (canvas, ctx, color, style) {
  var size = this.settings.maxSize;
  var half = size / 2;
  var lineSize = this.getLineSize(size);
  var glowSize = this.getGlowSize(size);
  var canvasSize = size + lineSize + glowSize;
  var mid = canvasSize / 2;
  var anchor = size * 0.08;
  var pointx = size * 0.02;
  var startx = mid - half;
  var starty = mid;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  this.renderGlow(ctx, color, size);
  this.renderStyle(ctx, color, lineSize, style);
  ctx.beginPath();
  ctx.moveTo(startx + pointx, starty);
  ctx.bezierCurveTo(mid - anchor / 2, mid - anchor * 2, mid - anchor * 2, mid - anchor / 2, mid, mid - half);
  ctx.bezierCurveTo(mid + anchor * 2, mid - anchor / 2, mid + anchor / 2, mid - anchor * 2, mid + half - pointx, mid);
  ctx.bezierCurveTo(mid + anchor / 2, mid + anchor * 2, mid + anchor * 2, mid + anchor / 2, mid, mid + half);
  ctx.bezierCurveTo(mid - anchor * 2, mid + anchor / 2, mid - anchor / 2, mid + anchor * 2, startx + pointx, starty);
  ctx.closePath();
  this.renderColor(ctx, style);
  return canvas;
};
/**
 * create, setup and render an offscreen canvas for a
 * Star Particle of the given color
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @param {CanvasRenderingContext2D} ctx - the canvas context
 * @param {String} color - the color to fill/stroke with
 * @param {String} style -  style (either "fill" or "stroke")
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */


Sparticles.prototype.drawOffscreenCanvasForStar = function (canvas, ctx, color, style) {
  var size = 52;
  var lineSize = this.getLineSize(size);
  var glowSize = this.getGlowSize(size);
  var canvasSize = size + lineSize * 2 + glowSize;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  this.renderGlow(ctx, color, size);
  this.renderStyle(ctx, color, lineSize, style);
  ctx.translate(lineSize / 2 + glowSize / 2, lineSize / 2 + glowSize / 2 - 1);
  ctx.beginPath();
  ctx.moveTo(27.76, 2.07);
  ctx.lineTo(34.28, 15.46);
  ctx.translate(36.01480792437574, 14.614221385040288);
  ctx.arc(0, 0, 1.93, 2.687967128721911, 1.7293919056045395, 1);
  ctx.translate(-36.01480792437574, -14.614221385040288);
  ctx.lineTo(50.37, 18.7);
  ctx.translate(50.10443046629834, 20.601544851632347);
  ctx.arc(0, 0, 1.92, -1.4320339785975214, 0.8159284165499665, 0);
  ctx.translate(-50.10443046629834, -20.601544851632347);
  ctx.lineTo(40.78, 32.36);
  ctx.translate(42.13415324373887, 33.735197801216785);
  ctx.arc(0, 0, 1.93, -2.3484841809999386, -3.3054346524687857, 1);
  ctx.translate(-42.13415324373887, -33.735197801216785);
  ctx.lineTo(42.7, 48.76);
  ctx.translate(40.81489078457234, 49.06734873663269);
  ctx.arc(0, 0, 1.91, -0.16161824093711977, 2.052504457600845, 0);
  ctx.translate(-40.81489078457234, -49.06734873663269);
  ctx.lineTo(26.83, 43.76);
  ctx.translate(25.939999999999998, 45.438660180024534);
  ctx.arc(0, 0, 1.9, -1.083293536758034, -2.0582991168317593, 1);
  ctx.translate(-25.939999999999998, -45.438660180024534);
  ctx.lineTo(11.92, 50.7);
  ctx.translate(11.046023488962076, 49.00168758523234);
  ctx.arc(0, 0, 1.91, 1.0955254432622383, 3.3002085355055915, 0);
  ctx.translate(-11.046023488962076, -49.00168758523234);
  ctx.lineTo(11.7, 34);
  ctx.translate(9.820265754085725, 33.66132734870218);
  ctx.arc(0, 0, 1.91, 0.178258078542773, -0.7933922953534395, 1);
  ctx.translate(-9.820265754085725, -33.66132734870218);
  ctx.lineTo(0.57, 21.85);
  ctx.translate(1.9278161466350117, 20.478418681981545);
  ctx.arc(0, 0, 1.93, 2.351151232528948, 4.5627030955491055, 0);
  ctx.translate(-1.9278161466350117, -20.478418681981545);
  ctx.lineTo(16.31, 16.47);
  ctx.translate(16.062056630005188, 14.576161547207466);
  ctx.arc(0, 0, 1.91, 1.4406156600933306, 0.4870016654036473, 1);
  ctx.translate(-16.062056630005188, -14.576161547207466);
  ctx.lineTo(24.33, 2.07);
  ctx.translate(26.045, 2.9107585860400085);
  ctx.arc(0, 0, 1.91, -2.6857849028374465, -0.45580775075234703, 0);
  ctx.translate(-26.045, -2.9107585860400085);
  ctx.closePath();
  this.renderColor(ctx, style);
  return canvas;
};
/**
 * create, setup and render an offscreen canvas for a
 * Circle Particle of the given color
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @param {CanvasRenderingContext2D} ctx - the canvas context
 * @param {String} color - the color to fill/stroke with
 * @param {String} style -  style (either "fill" or "stroke")
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */


Sparticles.prototype.drawOffscreenCanvasForCircle = function (canvas, ctx, color, style) {
  var size = this.settings.maxSize;
  var lineSize = this.getLineSize(size);
  var glowSize = this.getGlowSize(size);
  var canvasSize = size + lineSize + glowSize;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  this.renderGlow(ctx, color, size);
  this.renderStyle(ctx, color, lineSize, style);
  ctx.beginPath();
  ctx.ellipse(canvasSize / 2, canvasSize / 2, size / 2, size / 2, 0, 0, 360);
  this.renderColor(ctx, style);
  return canvas;
};
/**
 * set up the needed array for referencing the images in the Sparticle()
 * instance, then loop through each image and load it before running the callback
 * @param {String} color - the color of the image that we're loading
 * @param {Function} callback - callback function to run after images load
 */


Sparticles.prototype.loadAndDrawImages = function (color, callback) {
  var _this4 = this;

  var imgUrls = this.settings.imageUrl;
  var imageUrls = Array.isArray(imgUrls) ? imgUrls : [imgUrls];
  var imageCount = imageUrls.length;
  var imagesLoaded = 0;
  this.images = [];
  imageUrls.forEach(function (imageUrl, i) {
    var imgName = "image" + i;

    _this4.images.push(imgName);

    _this4.canvasses[color][imgName] = document.createElement("canvas");
    var canvas = _this4.canvasses[color][imgName];
    var ctx = canvas.getContext("2d");
    var image = new Image();

    image.onload = function () {
      imagesLoaded++;

      _this4.drawImageOffscreenCanvas(image, canvas, ctx, color);

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
 * create an array and populate it with new Sparticle instances.
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
 * - wipe the canvas,
 * - update each sparticle,
 * - render each sparticle
 * @returns {Array} the array of Sparticle instances
 */


Sparticles.prototype.drawFrame = function () {
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

export default Sparticles;