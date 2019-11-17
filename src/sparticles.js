import { random, randomArray, randomHsl, cartesian, clamp, radian, roll } from "./helpers.js";
import { AnimationFrame } from "./animationFrame.js";

/**
 *
 * @param {HTMLElement} [node]
 * @param {Number} [width]
 * @param {Number} [height]
 * @param {Object} [options]
 */
export const Sparticles = function (node, width, height, options) {
  const _this = this;
  const defaults = {
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
    xVariance: 2,
    yVariance: 2
  };
  this.el = node || document.body;
  this.width = width || this.el.clientWidth;
  this.height = height || this.el.clientHeight;
  this.options = options || {};
  this.sparticles = [];
  this.settings = { ...defaults, ...this.options };
  this.setupColors();
  this.setupCanvas();
  this.setupImage(function () {
    _this.createSparticles();
    _this.start();
  });
  return this;
};

Sparticles.prototype.start = function () {
  const me = this;
  if (!this.loop) {
    this.loop = new AnimationFrame(60, t => {
      me.render(t);
    });
  }
  this.loop.start();
};

Sparticles.prototype.stop = function () {
  this.loop.stop();
};

Sparticles.prototype.setupColors = function () {
  const colors = 50;
  if (this.settings.color === "rainbow") {
    this.settings.color = [];
    for (let i = 0; i < colors; i++) {
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
};

Sparticles.prototype.setupImage = function (callback) {
  if (this.settings.shape === "image" && this.settings.imageUrl) {
    const _this = this;
    this.images = {};
    this.image = new Image();
    this.image.onload = function () {
      if (Array.isArray(_this.settings.color)) {
        _this.settings.color.forEach(c => {
          _this.getImageCanvas(c);
        });
      } else {
        _this.getImageCanvas(_this.settings.color);
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
  for (let i = 0; i < this.settings.count; i++) {
    this.sparticles.push(new Sparticle(this.canvas, this.settings));
  }
  return this.sparticles;
};

Sparticles.prototype.render = function (t) {
  this.ctx.clearRect(0, 0, this.width, this.height);
  for (const sparticle of this.sparticles) {
    sparticle.update().render(this.image, this.images);
  }
  return this.sparticles;
};

// ======================================================= //

/**
 *
 * @param {HTMLElement} canvas the canvas element which the particle will render to
 * @param {Object} settings all the settings for the particle
 */
const Sparticle = function (canvas, settings) {
  if (canvas && settings) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.settings = settings;
    this.init();
  } else {
    console.warn("invalid parameters given to Sparticle", arguments);
  }
  return this;
};

Sparticle.prototype.init = function () {
  const _ = this.settings;
  this.setup();
  this.alpha = random(_.minAlpha, _.maxAlpha);
  this._alpha = this.alpha;
  this.fillColor = this.getColor();
  this.strokeColor = this.getColor();
  this.px = random(-this.size * 2, this.canvas.width + this.size, true);
  this.py = random(-this.size * 2, this.canvas.height + this.size, true);
  this.rotation = _.rotation ? radian(random(0, 360)) : 0;
};

Sparticle.prototype.setup = function () {
  const _ = this.settings;
  this.frame = 0;
  this.frameoffset = random(0, 360, true);
  this.size = random(_.minSize, _.maxSize, true);
  this.da = this.getAlpha();
  this.dx = this.getDeltaX();
  this.dy = this.getDeltaY();
  this.df = this.getFloat();
  this.dr = this.getRotation();
};

Sparticle.prototype.isOffCanvas = function () {
  const topleft = 0 - this.size * 3;
  const bottom = this.canvas.height + this.size * 3;
  const right = this.canvas.width + this.size * 3;
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

Sparticle.prototype.getAlpha = function () {
  const av = this.settings.alphaVariance;
  return random(-av, av) / 10;
};

Sparticle.prototype.getDeltaX = function () {
  const d = this.getDelta();
  const dv = this.getDeltaVariance(this.settings.xVariance);
  return cartesian(this.settings.direction)[0] * d + dv;
};

Sparticle.prototype.getDeltaY = function () {
  const d = this.getDelta();
  const dv = this.getDeltaVariance(this.settings.yVariance);
  return cartesian(this.settings.direction)[1] * d + dv;
};

Sparticle.prototype.getDeltaVariance = function (v = 0) {
  const s = this.settings.speed || 10;
  if (v > 0) {
    return (random(-v, v) * s) / 100;
  } else {
    return 0;
  }
};

Sparticle.prototype.getDelta = function () {
  let baseDelta = this.settings.speed * 0.1;
  if (this.settings.speed && this.settings.parallax) {
    return baseDelta + (this.size * this.settings.parallax) / 50;
  } else {
    return baseDelta;
  }
};

Sparticle.prototype.getFloat = function () {
  if (!this.settings.float) {
    return 0;
  } else {
    return random(
      this.settings.float - this.settings.float / 2,
      this.settings.float + this.settings.float / 2
    );
  }
};

Sparticle.prototype.getRotation = function () {
  let r = 0;
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
  this.updateAlpha();
  this.updatePosition();
  return this;
};

Sparticle.prototype.updateAlpha = function () {
  if (this.settings.alphaSpeed > 0) {
    const alphaTick = (this.da / 1000) * this.settings.alphaSpeed * 10;
    this._alpha += alphaTick;
    if (this.da > 0 && this._alpha > this.settings.maxAlpha) {
      this._alpha = this.settings.maxAlpha;
      this.da = -this.da;
    } else if (this.da < 0 && this._alpha < this.settings.minAlpha) {
      this._alpha = this.settings.minAlpha;
      this.da = -this.da;
    }
    this.alpha = clamp(this._alpha, 0, 1);
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
    const centerX = this.px + this.size / 2;
    const centerY = this.py + this.size / 2;
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
  const size = this.size / 2;
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
  const size = this.size;
  const startx = this.px + size / 2;
  const starty = this.py;
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
  const size = this.size;
  const startx = this.px;
  const starty = this.py;
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
    const imgCanvas = images[this.fillColor];
    const imgSize = imgCanvas.width;
    const scale = this.size / imgSize;
    const px = this.px / scale;
    const py = this.py / scale;
    this.renderRotate();
    this.ctx.globalCompositeOperation = this.settings.composition;
    this.ctx.globalAlpha = this.alpha;
    this.ctx.transform(scale, 0, 0, scale, 0, 0);
    this.ctx.drawImage(imgCanvas, 0, 0, imgSize, imgSize, px, py, imgSize, imgSize);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
};
