import { AnimationFrame } from "./animationFrame.js";
import { Sparticle } from "./sparticle.js";
import { clamp, randomHsl } from "./helpers.js";

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
export const Sparticles = function(node = document.body, options = {}, width, height) {
  const defaults = {
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
  this.sparticles = [];
  this.createColorArray();
  this.createShapeArray();
  this.setupMainCanvas();
  this.setupOffscreenCanvasses(() => {
    this.createSparticles();
    this.start();
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

/**
 * destroy the current instance and free up some memory
 */
Sparticles.prototype.destroy = function() {
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
Sparticles.prototype.createColorArray = function() {
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
 * convert the input shape to an array if it isn't already
 * @returns {Array} - array of shapes for use in rendering
 */
Sparticles.prototype.createShapeArray = function() {
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
Sparticles.prototype.setupMainCanvas = function() {
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
Sparticles.prototype.setupOffscreenCanvasses = function(callback) {
  this.canvasses = this.canvasses || {};

  this.settings.color.forEach(color => {
    this.canvasses[color] = this.canvasses[color] || {};

    if (this.settings.shape[0] === "image") {
      this.loadAndDrawImages(color, callback);
    } else {
      this.settings.shape.forEach(shape => {
        this.canvasses[color][shape] = document.createElement("canvas");
        const canvas = this.canvasses[color][shape];
        const ctx = canvas.getContext("2d");

        switch (shape) {
          case "square":
            this.drawSquareOffscreenCanvas(canvas, ctx, color);
            if (callback) callback();
            break;

          case "line":
            this.drawLineOffscreenCanvas(canvas, ctx, color);
            if (callback) callback();
            break;

          case "triangle":
            this.drawTriangleOffscreenCanvas(canvas, ctx, color);
            if (callback) callback();
            break;

          case "circle":
          default:
            this.drawCircleOffscreenCanvas(canvas, ctx, color);
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
Sparticles.prototype.getGlowSize = function(size) {
  return this.settings.glow;
};

/**
 * return the outline or stroke size of each particle
 * @param {Number} size - the size of the particle
 * @returns {Number} - the size of the outline/stroke
 */
Sparticles.prototype.getLineSize = function(size) {
  return clamp(size / 20, 1, 5);
};

/**
 * set the fill/stroke style (color & width) for each particle's offscreen canvas
 * @param {CanvasRenderingContext2D} ctx - the canvas context
 * @param {String} color - the color to fill/stroke with
 * @param {Number} lineSize - size/thickness of the stroke
 */
Sparticles.prototype.renderStyle = function(ctx, color, lineSize) {
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
Sparticles.prototype.renderGlow = function(ctx, color, size) {
  const glowSize = this.getGlowSize(size) / 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = glowSize;
};

/**
 * fill or stroke each particle's offscreen canvas depending on the given setting
 * @param {CanvasRenderingContext2D} ctx - the canvas context
 */
Sparticles.prototype.renderColor = function(ctx) {
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
Sparticles.prototype.drawSquareOffscreenCanvas = function(canvas, ctx, color) {
  const size = this.settings.maxSize;
  const lineSize = this.getLineSize(size);
  const glowSize = this.getGlowSize(size);
  const canvasSize = size + lineSize + glowSize;
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
Sparticles.prototype.drawLineOffscreenCanvas = function(canvas, ctx, color) {
  const size = this.settings.maxSize * 2;
  const lineSize = this.getLineSize(size);
  const glowSize = this.getGlowSize(size);
  const canvasSize = size + lineSize + glowSize;
  const startx = canvasSize / 2 - size / 2;
  const starty = canvasSize / 2 - size / 2;
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
Sparticles.prototype.drawTriangleOffscreenCanvas = function(canvas, ctx, color) {
  const size = this.settings.maxSize;
  const lineSize = this.getLineSize(size);
  const glowSize = this.getGlowSize(size);
  const canvasSize = size + lineSize + glowSize;
  const height = size * (Math.sqrt(3) / 2);
  const startx = canvasSize / 2;
  const starty = canvasSize / 2 - size / 2;
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
Sparticles.prototype.loadAndDrawImages = function(color, callback) {
  const imgUrls = this.settings.imageUrl;
  const imageUrls = Array.isArray(imgUrls) ? imgUrls : [imgUrls];
  const imageCount = imageUrls.length;
  let imagesLoaded = 0;
  this.images = [];

  imageUrls.forEach((imageUrl, i) => {
    const imgName = "image" + i;
    this.images.push(imgName);
    this.canvasses[color][imgName] = document.createElement("canvas");
    const canvas = this.canvasses[color][imgName];
    const ctx = canvas.getContext("2d");
    const image = new Image();

    image.onload = () => {
      imagesLoaded++;
      this.drawImageOffscreenCanvas(image, canvas, ctx, color);
      if (callback && imagesLoaded === imageCount) {
        callback();
      }
    };

    image.onerror = () => {
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
Sparticles.prototype.drawImageOffscreenCanvas = function(image, canvas, ctx, color) {
  const size = image.width;
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
Sparticles.prototype.drawCircleOffscreenCanvas = function(canvas, ctx, color) {
  const size = this.settings.maxSize;
  const lineSize = this.getLineSize(size);
  const glowSize = this.getGlowSize(size);
  const canvasSize = size + lineSize + glowSize;
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
Sparticles.prototype.createSparticles = function() {
  this.sparticles = [];
  for (let i = 0; i < this.settings.count; i++) {
    this.sparticles.push(new Sparticle(this));
  }
  this.sparticles.sort((a, b) => {
    return a.size > b.size;
  });
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
    sparticle.update().render(this.canvasses);
  }
  return this.sparticles;
};
