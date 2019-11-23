import { AnimationFrame } from "./animationFrame.js";
import {
  cartesian,
  clamp,
  radian,
  random,
  randomArray,
  randomHsl,
  roll,
  round,
} from "./helpers.js";

/**
 * Sparticles Constructor;
 * Create a <canvas>, append to the given node, and start the particle effect
 * @param {HTMLElement} [node] - element to which canvas is appended to
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
 * @param {String} [options.imageUrl=] - if style is "image", define an image url (can be data-uri, must be square (1:1 ratio))
 * @param {(String|String[])} [options.color=white] - css color as string, or array or color strings (can also be "rainbow")
 * @param {Number} [width] - the width of the canvas element
 * @param {Number} [height] - the height of the canvas element
 * @returns - reference to a new Sparticles instance
 */
export const Sparticles = function(node = document.body, options = {}, width, height) {
  const defaults = {
    alphaSpeed: 10,
    alphaVariance: 1,
    color: "white",
    composition: "screen",
    count: 50,
    direction: 180,
    float: 1,
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
    yVariance: 2,
  };
  this.el = node;
  this.width = width || this.el.clientWidth;
  this.height = height || this.el.clientHeight;
  this.settings = { ...defaults, ...options };
  this.init();
  return this;
};

Sparticles.prototype.init = function() {
  const me = this;
  this.sparticles = [];
  this.setupColors();
  this.setupCanvas();
  this.setupImage(function() {
    me.createSparticles();
    me.start();
  });
};

/**
 * start/resume the sparticles animation
 */
Sparticles.prototype.start = function() {
  const me = this;
  if (!this.loop) {
    this.loop = new AnimationFrame(t => {
      me.render(t);
    });
  }
  this.loop.start();
};

/**
 * stop/pause the sparticles animation
 */
Sparticles.prototype.stop = function() {
  this.loop.stop();
};

Sparticles.prototype.destroy = function() {
  this.stop();
  this.sparticles = null;
  this.start = null;
  this.stop = null;
  this.init = null;
  this.settings = null;
  this.el.removeChild(this.canvas);
};

/**
 * convert the input colors to an array if it isn't already
 * @returns {Array} - array of colors for use in rendering
 */
Sparticles.prototype.setupColors = function() {
  if (!Array.isArray(this.settings.color)) {
    if (this.settings.color === "rainbow") {
      const colors = 50;
      this.settings.color = [];
      for (let i = 0; i < colors; i++) {
        this.settings.color[i] = randomHsl();
      }
    } else {
      this.settings.color = [this.settings.color];
    }
  }
  return this.settings.color;
};

/**
 * set up the canvas and bind to a property for
 * access later on, append it to the DOM
 * @returns {HTMLCanvasElement} - the canvas element which was appended to DOM
 */
Sparticles.prototype.setupCanvas = function() {
  this.canvas = document.createElement("canvas");
  this.ctx = this.canvas.getContext("2d");
  this.ctx.globalCompositeOperation = this.settings.composition;
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  this.el.appendChild(this.canvas);
  return this.canvas;
};

/**
 * attempt to laod the image given in options and after loading
 * set up a new canvas for each color overlaid on the the image
 * @param {Function} [callback] - function to execute after image loads
 * @returns {HTMLImageElement} - the image which was loaded
 */
Sparticles.prototype.setupImage = function(callback) {
  if (this.settings.shape === "image" && this.settings.imageUrl) {
    const me = this;
    this.image = new Image();
    this.image.onload = function() {
      me.settings.color.forEach(c => {
        me.setupImageCanvas(c);
      });
      if (callback) callback();
    };
    this.image.onerror = function() {
      console.error("failed to load source image");
    };
    this.image.src = this.settings.imageUrl;
  } else {
    if (callback) callback();
  }
  return this.image;
};

/**
 * set up a new canvas element for the given color parameter,
 * this creates a new property in the `this.images` object under
 * the given color which holds an offscreen canvas for rendering each particle.
 * @param {String} color - the color value which we create a offscreen canvas for
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */
Sparticles.prototype.setupImageCanvas = function(color) {
  const imgSize = this.image.width;
  this.images = this.images || {};
  this.images[color] = document.createElement("canvas");
  this.images[color].width = imgSize;
  this.images[color].height = imgSize;
  this.imgCtx = this.images[color].getContext("2d");
  this.imgCtx.drawImage(this.image, 0, 0, imgSize, imgSize, 0, 0, imgSize, imgSize);
  this.imgCtx.globalCompositeOperation = "source-atop";
  this.imgCtx.fillStyle = color;
  this.imgCtx.fillRect(0, 0, imgSize, imgSize);
  return this.images[color];
};

/**
 * create an array, and then loop through to the count
 * value and populate the array with new Sparticle instances.
 * @returns {Array} the array of Sparticle instances
 */
Sparticles.prototype.createSparticles = function() {
  this.sparticles = [];
  for (let i = 0; i < this.settings.count; i++) {
    this.sparticles.push(new Sparticle(this));
  }
  return this.sparticles;
};

/**
 * wipe the canvas, update each particle, and then render
 * each particle to the canvas
 * @returns {Array} the array of Sparticle instances
 */
Sparticles.prototype.render = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
  for (const sparticle of this.sparticles) {
    sparticle.update().render(this.image, this.images);
  }
  return this.sparticles;
};

/**
 * ============================================================================
 */

/**
 * Sparticle Constructor;
 * creates an individual particle for use in the Sparticles() class
 * @param {Object} parent - the parent Sparticles() instance this belongs to
 * @returns {Object} - reference to a new Sparticles instance
 */
const Sparticle = function(parent) {
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

/**
 * initialise a particle with the default values from
 * the Sparticles instance settings.
 * these values do not change when the particle goes offscreen
 */
Sparticle.prototype.init = function() {
  this.setup();
  this.alpha = random(this.settings.minAlpha, this.settings.maxAlpha);
  this._alpha = this.alpha;
  this.fillColor = this.getColor();
  this.strokeColor = this.getColor();
  this.px = round(random(-this.size * 2, this.canvas.width + this.size));
  this.py = round(random(-this.size * 2, this.canvas.height + this.size));
  this.rotation = this.settings.rotation ? radian(random(0, 360)) : 0;
  if (this.settings.shape === "line") {
    this.curve = random(0.1, 1);
  }
};

/**
 * set up the particle with some random values
 * before it is initialised on the canvas
 * these values will randomize when the particle goes offscreen
 */
Sparticle.prototype.setup = function() {
  const _ = this.settings;
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
Sparticle.prototype.isOffCanvas = function() {
  const topleft = 0 - this.size * 3;
  const bottom = this.canvas.height + this.size * 3;
  const right = this.canvas.width + this.size * 3;
  return this.px < topleft || this.px > right || this.py < topleft || this.py > bottom;
};

Sparticle.prototype.reset = function() {
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

Sparticle.prototype.getColor = function() {
  if (Array.isArray(this.settings.color)) {
    return randomArray(this.settings.color);
  } else {
    return this.settings.color;
  }
};

Sparticle.prototype.getAlphaDelta = function() {
  const max = this.settings.twinkle ? 0 : this.settings.alphaVariance;
  const min = -this.settings.alphaVariance;
  return random(min, max) / 10;
};

Sparticle.prototype.getDeltaX = function() {
  const d = this.getDelta();
  const dv = this.getDeltaVariance(this.settings.xVariance);
  return cartesian(this.settings.direction)[0] * d + dv;
};

Sparticle.prototype.getDeltaY = function() {
  const d = this.getDelta();
  const dv = this.getDeltaVariance(this.settings.yVariance);
  return cartesian(this.settings.direction)[1] * d + dv;
};

Sparticle.prototype.getDeltaVariance = function(v = 0) {
  const s = this.settings.speed || 10;
  if (v > 0) {
    return (random(-v, v) * s) / 100;
  } else {
    return 0;
  }
};

Sparticle.prototype.getDelta = function() {
  let baseDelta = this.settings.speed * 0.1;
  if (this.settings.speed && this.settings.parallax) {
    return baseDelta + (this.size * this.settings.parallax) / 50;
  } else {
    return baseDelta;
  }
};

Sparticle.prototype.getFloatDelta = function() {
  if (!this.settings.float) {
    return 0;
  } else {
    return random(
      this.settings.float - this.settings.float / 2,
      this.settings.float + this.settings.float / 2
    );
  }
};

Sparticle.prototype.getRotationDelta = function() {
  let r = 0;
  if (this.settings.rotation) {
    r = radian(random(0.5, 1.5) * this.settings.rotation);
    if (roll(1 / 2)) {
      r = -r;
    }
  }
  return r;
};

Sparticle.prototype.update = function() {
  this.frame += 1;
  this.updatePosition();
  this.updateAlpha();
  return this;
};

Sparticle.prototype.updateAlpha = function() {
  const tick = (this.da / 1000) * this.settings.alphaSpeed * 10;
  if (this.settings.alphaSpeed > 0) {
    if (this.settings.twinkle) {
      this.updateTwinkle(tick);
    } else {
      this.updateFade(tick);
    }
  }
  this.alpha = clamp(this._alpha, 0, 1);
};

Sparticle.prototype.updateFade = function(tick) {
  this._alpha += tick;
  const over = this.da > 0 && this._alpha > this.settings.maxAlpha;
  const under = this.da < 0 && this._alpha < this.settings.minAlpha;
  if (over || under) {
    this.da = -this.da;
    this._alpha = this.settings.maxAlpha;
    if (under) {
      this._alpha = this.settings.minAlpha;
    }
  }
};

Sparticle.prototype.updateTwinkle = function(tick) {
  this._alpha += tick;
  const over = this._alpha > this.settings.maxAlpha;
  const under = this._alpha < this.settings.minAlpha;
  if (under) {
    this.resettingTwinkle = true;
  } else if (over) {
    this.resettingTwinkle = false;
  }
  if (this.resettingTwinkle) {
    this._alpha += 0.02 * this.settings.alphaSpeed;
  }
};

Sparticle.prototype.updatePosition = function() {
  if (this.isOffCanvas()) {
    this.reset();
  } else {
    this.px += this.dx;
    this.py += this.dy;
    this.updateRotate();
    this.updateFloat();
  }
};

Sparticle.prototype.updateRotate = function() {
  this.rotation += this.dr;
};

Sparticle.prototype.updateFloat = function() {
  if (this.settings.float && this.settings.speed) {
    if (
      (this.settings.direction > 160 && this.settings.direction < 200) ||
      (this.settings.direction > 340 && this.settings.direction < 380) ||
      (this.settings.direction > -20 && this.settings.direction < 20)
    ) {
      this.px += (cartesian(this.frame + this.frameoffset)[0] * this.df) / (this.getDelta() * 15);
    } else if (
      (this.settings.direction > 70 && this.settings.direction < 110) ||
      (this.settings.direction > 250 && this.settings.direction < 290)
    ) {
      this.py += (cartesian(this.frame + this.frameoffset)[1] * this.df) / (this.getDelta() * 15);
    }
  }
};

/**
 *
 * @param {HTMLImageElement} [image] an image with a source attribute set
 */
Sparticle.prototype.render = function(image, images) {
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

Sparticle.prototype.renderStyle = function() {
  this.ctx.globalAlpha = this.alpha;
  if (this.settings.style === "fill" || this.settings.style === "both") {
    this.ctx.fillStyle = this.fillColor;
  }
  if (this.settings.style === "stroke" || this.settings.style === "both") {
    this.ctx.lineWidth = clamp(this.size / 20, 1, 5);
    this.ctx.strokeStyle = this.strokeColor;
  }
};

Sparticle.prototype.renderColor = function() {
  if (this.settings.style === "fill" || this.settings.style === "both") {
    this.ctx.fill();
  }
  if (this.settings.style === "stroke" || this.settings.style === "both") {
    this.ctx.stroke();
  }
};

Sparticle.prototype.renderRotate = function() {
  if (this.settings.rotation > 0) {
    const centerX = this.px + this.size / 2;
    const centerY = this.py + this.size / 2;
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.rotation);
    this.ctx.translate(-centerX, -centerY);
  }
};

Sparticle.prototype.renderResetRotate = function() {
  if (this.settings.rotation > 0) {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
};

Sparticle.prototype.renderCircle = function() {
  const size = this.size / 2;
  this.renderStyle();
  this.ctx.beginPath();
  this.ctx.ellipse(this.px, this.py, size, size, 0, 0, 360);
  this.renderColor();
};

Sparticle.prototype.renderSquare = function() {
  this.renderRotate();
  this.renderStyle();
  this.ctx.beginPath();
  this.ctx.rect(this.px, this.py, this.size, this.size);
  this.renderColor();
  this.renderResetRotate();
};

Sparticle.prototype.renderTriangle = function() {
  const size = this.size;
  const startx = this.px + size / 2;
  const starty = this.py;
  const height = size * (Math.sqrt(3) / 2);
  this.renderRotate();
  this.renderStyle();
  this.ctx.beginPath();
  this.ctx.moveTo(startx, starty);
  this.ctx.lineTo(startx - size / 2, starty + height);
  this.ctx.lineTo(startx + size / 2, starty + height);
  this.ctx.closePath();
  this.renderColor();
  this.renderResetRotate();
};

Sparticle.prototype.renderLine = function() {
  const size = this.size;
  const startx = this.px;
  const starty = this.py;
  const curvex = 1 - this.curve;
  const curvey = 0 + this.curve;
  this.renderRotate();
  this.renderStyle();
  this.ctx.beginPath();
  this.ctx.moveTo(startx, starty);
  this.ctx.quadraticCurveTo(
    startx + size * curvex,
    starty + size * curvey,
    startx + size,
    starty + size
  );
  this.ctx.stroke();
  this.renderResetRotate();
};

/**
 * @param {HTMLImageElement} [image] an image with a source attribute set
 */
Sparticle.prototype.renderImage = function(image, images) {
  if (image && image.src) {
    const imgCanvas = images[this.fillColor];
    const imgSize = imgCanvas.width;
    const scale = this.size / imgSize;
    const px = this.px / scale;
    const py = this.py / scale;
    this.renderRotate();
    this.ctx.globalAlpha = this.alpha;
    this.ctx.transform(scale, 0, 0, scale, 0, 0);
    this.ctx.drawImage(imgCanvas, 0, 0, imgSize, imgSize, px, py, imgSize, imgSize);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
};
