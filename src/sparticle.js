import { cartesian, clamp, radian, random, randomArray, roll, round } from "./helpers.js";

/**
 * Sparticle Constructor;
 * creates an individual particle for use in the Sparticles() class
 * @param {Object} parent - the parent Sparticles() instance this belongs to
 * @returns {Object} - reference to a new Sparticle instance
 */
export const Sparticle = function(parent) {
  if (parent) {
    this.canvas = parent.canvas;
    this.settings = parent.settings;
    this.colors = parent.colors;
    this.shapes = parent.shapes;
    this.images = parent.images;
    this.styles = parent.styles;
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
Sparticle.prototype.setup = function() {
  const _ = this.settings;
  this.frame = 0;
  this.frameoffset = round(random(0, 360));
  this.size = round(random(_.minSize, _.maxSize));
  this.da = this.getAlphaDelta();
  this.dx = this.getDeltaX();
  this.dy = this.getDeltaY();
  this.dd = this.getDriftDelta();
  this.dr = this.getRotationDelta();
  this.color = this.getColor();
  this.shape = this.getShape();
  this.image = this.getImage();
  this.style = this.getStyle();
  this.rotation = _.rotate ? radian(random(0, 360)) : 0;
  this.vertical =
    (_.direction > 150 && _.direction < 210) ||
    (_.direction > 330 && _.direction < 390) ||
    (_.direction > -30 && _.direction < 30);
  this.horizontal =
    (_.direction > 60 && _.direction < 120) || (_.direction > 240 && _.direction < 300);
};

/**
 * initialise a particle with the default values from
 * the Sparticles instance settings.
 * these values do not change when the particle goes offscreen
 */
Sparticle.prototype.init = function() {
  const _ = this.settings;
  const canvas = this.canvas;
  this.alpha = 0;
  if (_.speed > 0 || _.alphaSpeed === 0) {
    this.alpha = random(_.minAlpha, _.maxAlpha);
  }
  if (_.bounce) {
    this.px = round(random(2, canvas.width - this.size - 2));
    this.py = round(random(2, canvas.height - this.size - 2));
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
Sparticle.prototype.reset = function() {
  // give the particle a new set of initial values
  this.setup();
  // set the particle's Y position
  if (this.py < 0) {
    this.py = this.canvas.height + this.size * 2;
  } else if (this.py > this.canvas.height) {
    this.py = 0 - this.size * 2;
  }
  // set the particle's X position
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
Sparticle.prototype.bounce = function() {
  const _ = this.settings;
  const dir = _.direction;

  // reverse the particle's Y position
  if (this.py <= 0 || this.py + this.size >= this.canvas.height) {
    this.dy = -this.dy;
    if (this.horizontal) {
      this.dd = -this.dd;
    }
  }
  // reverse the particle's X position
  if (this.px <= 0 || this.px + this.size >= this.canvas.width) {
    this.dx = -this.dx;
    if (this.vertical) {
      this.dd = -this.dd;
    }
  }
};

/**
 * check if the particle is off the canvas based
 * on it's current position
 * @returns {Boolean} is the particle completely off canvas
 */
Sparticle.prototype.isOffCanvas = function() {
  const topleft = 0 - this.size * 2;
  const bottom = this.canvas.height + this.size * 2;
  const right = this.canvas.width + this.size * 2;
  return this.px < topleft || this.px > right || this.py < topleft || this.py > bottom;
};

/**
 * check if the particle is touching the canvas edge
 * @returns {Boolean} is the particle touching edge
 */
Sparticle.prototype.isTouchingEdge = function() {
  const topleft = 0;
  const bottom = this.canvas.height - this.size;
  const right = this.canvas.width - this.size;
  return this.px < topleft || this.px > right || this.py < topleft || this.py > bottom;
};

/**
 * get a random color for the particle from the
 * array of colors set in the options object
 * @returns {String} - random color from color array
 */
Sparticle.prototype.getColor = function() {
  if (this.settings.color === "random") {
    return randomArray(this.colors);
  } else if (Array.isArray(this.settings.color)) {
    return randomArray(this.settings.color);
  } else {
    return this.settings.color;
  }
};

/**
 * get a random shape for the particle from the
 * array of shapes set in the options object
 * @returns {String} - random shape from shape array
 */
Sparticle.prototype.getShape = function() {
  if (this.settings.shape === "random") {
    return randomArray(this.shapes);
  } else if (Array.isArray(this.settings.shape)) {
    return randomArray(this.settings.shape);
  } else {
    return this.settings.shape;
  }
};

/**
 * get the image for the particle from the array
 * of possible image urls
 * @returns {String} - random imageUrl from imageUrl array
 */
Sparticle.prototype.getImage = function() {
  if (Array.isArray(this.settings.imageUrl)) {
    return randomArray(this.settings.imageUrl);
  } else {
    return this.settings.imageUrl;
  }
};

/**
 * get the style of the particle, either "fill" or "stroke"
 * depending on the settings as fill/stroke/both
 * @returns {String} - either "fill" or "stroke"
 */
Sparticle.prototype.getStyle = function() {
  return randomArray(this.styles);
};

/**
 * get a random delta (velocity) for the particle
 * based on the speed, and the parallax value (if applicable)
 * @returns {Number} - the velocity to be applied to the particle
 */
Sparticle.prototype.getDelta = function() {
  let baseDelta = this.settings.speed * 0.1;
  if (this.settings.speed && this.settings.parallax) {
    return baseDelta + (this.size * this.settings.parallax) / 50;
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
Sparticle.prototype.getDeltaVariance = function(v = 0) {
  const s = this.settings.speed || 10;
  if (v > 0) {
    return (random(-v, v) * s) / 100;
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
Sparticle.prototype.getDeltaX = function() {
  const d = this.getDelta();
  const dv = this.getDeltaVariance(this.settings.xVariance);
  return cartesian(this.settings.direction)[0] * d + dv;
};

/**
 * get a random delta on the Y axis, taking in to account
 * the variance range in the settings object and the particle's
 * direction as a multiplier
 * @returns {Number} - the Y delta to be applied to particle
 */
Sparticle.prototype.getDeltaY = function() {
  const d = this.getDelta();
  const dv = this.getDeltaVariance(this.settings.yVariance);
  return cartesian(this.settings.direction)[1] * d + dv;
};

/**
 * get a random delta for the alpha change over time from
 * between a positive and negative alpha variance value
 * @returns {Number} - the alpha delta to be applied to particle
 */
Sparticle.prototype.getAlphaDelta = function() {
  let variance = this.settings.alphaVariance;
  let a = random(1, variance + 1);
  if (roll(1 / 2)) {
    a = -a;
  }
  return a;
};

/**
 * return a random drift value either positive or negative
 * @returns {Number} - the drift value
 */
Sparticle.prototype.getDriftDelta = function() {
  if (!this.settings.drift) {
    return 0;
  } else {
    return random(
      this.settings.drift - this.settings.drift / 2,
      this.settings.drift + this.settings.drift / 2
    );
  }
};

/**
 * return a random rotation value either positive or negative
 * @returns {Number} - the rotation value
 */
Sparticle.prototype.getRotationDelta = function() {
  let r = 0;
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
Sparticle.prototype.update = function() {
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
Sparticle.prototype.updateAlpha = function() {
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
Sparticle.prototype.updateFade = function() {
  const tick = (this.da / 1000) * this.settings.alphaSpeed * 0.5;
  let alpha = this.alpha + tick;
  const over = this.da > 0 && alpha > this.settings.maxAlpha;
  const under = this.da < 0 && alpha < this.settings.minAlpha;
  // if the alpha is over or under the min or max values,
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
Sparticle.prototype.updateTwinkle = function() {
  let alpha = this.alpha;
  const delta = Math.abs(this.da);
  const over = alpha > this.settings.maxAlpha;
  const under = alpha < this.settings.minAlpha;
  const tick = (delta / 1000) * this.settings.alphaSpeed * 0.5;
  const flickerOn = roll(1 / 30);
  const flickerOff = roll(1 / 30);
  // if the particle is resetting the twinkle effect, then
  // we simply want to quickly get back to max alpha
  // over a short period of time, otherwise just advance the tick
  if (this.resettingTwinkle) {
    alpha += tick * 5;
  } else if (flickerOn) {
    alpha += tick * 50;
  } else if (flickerOff) {
    alpha -= tick * 25;
  } else {
    alpha -= tick;
  }
  // once the alpha is under the min alpha value, then we need
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
Sparticle.prototype.updatePosition = function() {
  if (this.settings.bounce && this.isTouchingEdge()) {
    this.bounce();
  } else if (this.isOffCanvas()) {
    this.reset();
    return;
  }

  this.px += this.dx;
  this.py += this.dy;
  // drift must be applied after position x/y
  // as it modifies the values by wave function
  this.updateDrift();
  this.updateRotation();
};

/**
 * progress the particle's rotation value according
 * to the settings given
 */
Sparticle.prototype.updateRotation = function() {
  if (this.settings.rotate && this.settings.rotation) {
    this.rotation += this.dr;
  }
};

/**
 * progress the particle's drift value according
 * to the settings given
 */
Sparticle.prototype.updateDrift = function() {
  const _ = this.settings;
  const dir = _.direction;

  if (_.drift && _.speed) {
    if (this.vertical) {
      // apply HORIZONTAL drift ~ when "direction" is mostly vertical.
      this.px += (cartesian(this.frame + this.frameoffset)[0] * this.dd) / (this.getDelta() * 15);
    } else if (this.horizontal) {
      // apply VERTICAL drift ~ when "direction" is mostly horizontal.
      this.py += (cartesian(this.frame + this.frameoffset)[1] * this.dd) / (this.getDelta() * 15);
    }
  }
};

Sparticle.prototype.render = function(canvasses) {
  let particleCanvas;
  if (this.shape !== "image") {
    particleCanvas = canvasses[this.color][this.shape][this.style];
  } else {
    particleCanvas = canvasses[this.color][this.shape][this.image];
  }
  const canvasSize = particleCanvas.width;
  const scale = this.size / canvasSize;
  const px = this.px / scale;
  const py = this.py / scale;
  this.ctx.globalAlpha = clamp(this.alpha, 0, 1);
  this.renderRotate();
  this.ctx.transform(scale, 0, 0, scale, 0, 0);
  this.ctx.drawImage(particleCanvas, 0, 0, canvasSize, canvasSize, px, py, canvasSize, canvasSize);
  this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  return this;
};

Sparticle.prototype.renderRotate = function() {
  if (this.shape !== "circle" && this.settings.rotate) {
    const centerX = this.px + this.size / 2;
    const centerY = this.py + this.size / 2;
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.rotation);
    this.ctx.translate(-centerX, -centerY);
  }
};
