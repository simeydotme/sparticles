import { cartesian, clamp, radian, random, randomArray, roll, round } from "./helpers.js";

/**
 * Sparticle Constructor;
 * creates an individual particle for use in the Sparticles() class
 * @param {Object} parent - the parent Sparticles() instance this belongs to
 * @returns {Object} - reference to a new Sparticles instance
 */
export const Sparticle = function(parent) {
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
Sparticle.prototype.init = function() {
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
  }
};

Sparticle.prototype.getShape = function() {
  const shape = this.settings.shape;
  if (Array.isArray(shape)) {
    if (shape[0] === "image" && this.images) {
      return randomArray(this.images);
    } else {
      return randomArray(shape);
    }
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

Sparticle.prototype.getAlphaDelta = function() {
  const max = this.settings.twinkle ? 0 : this.settings.alphaVariance;
  const min = -this.settings.alphaVariance;
  return random(min, max) / 10;
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

Sparticle.prototype.render = function(images) {
  const offscreenCanvas = images[this.fillColor][this.shape];
  const canvasSize = offscreenCanvas.width;
  const scale = this.size / canvasSize;
  const px = this.px / scale;
  const py = this.py / scale;
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

Sparticle.prototype.renderRotate = function() {
  if (this.settings.rotation > 0) {
    const centerX = this.px + this.size / 2;
    const centerY = this.py + this.size / 2;
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.rotation);
    this.ctx.translate(-centerX, -centerY);
  }
};
