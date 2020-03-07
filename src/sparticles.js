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
 * @param {Number} [options.drift=1] - the "driftiness" of particles which have a direction at a 90(±20) degree value
 * @param {Number} [options.glow=0] - the glow effect size of each particle
 * @param {Boolean} [options.twinkle=false] - particles to exhibit an alternative alpha transition as "twinkling"
 * @param {(String|String[])} [options.color=white] - css color as string, or array or color strings (can also be "rainbow")
 * @param {(String|String[])} [options.shape=circle] - shape of particles (any of; circle, square, triangle, diamond, line, image) or "random"
 * @param {(String|String[])} [options.imageUrl=] - if shape is "image", define an image url (can be data-uri, must be square (1:1 ratio))
 * @param {Number} [width] - the width of the canvas element
 * @param {Number} [height] - the height of the canvas element
 * @returns - reference to a new Sparticles instance
 */
const Sparticles = function(node, options = {}, width, height) {
  if (arguments.length === 1 && !(arguments[0] instanceof HTMLElement)) {
    options = node;
    node = undefined;
  }
  const defaults = {
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
    yVariance: 2,
  };
  this.el = node || document.body;
  this.settings = { ...defaults, ...options };
  this.init(width, height);
  window.addEventListener("resize", () => {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.setCanvasSize();
      this.createSparticles();
    }, 200);
  });
  return this;
};

/**
 * initialise the sparticles instance
 * @param {Number} width - the width of the canvas if not fluid
 * @param {Number} height - the height of the canvas if not fluid
 */
Sparticles.prototype.init = function(width, height) {
  this.sparticles = [];
  this.createColorArray();
  this.createShapeArray();
  this.setupMainCanvas(width, height);
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
  // stop the rendering and updating
  this.stop();
  // remove the canvas element from the DOM
  this.el.removeChild(this.canvas);
  // delete all the properties from the instance
  // to free up memory
  for (const prop in this) {
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
Sparticles.prototype.setCanvasSize = function(width, height) {
  if (typeof this.resizable === "undefined") {
    this.resizable = !width && !height;
  }
  if (this.resizable) {
    this.width = this.el.clientWidth;
    this.height = this.el.clientHeight;
  } else if (width && height) {
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
Sparticles.prototype.setupMainCanvas = function(width, height) {
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
Sparticles.prototype.setupOffscreenCanvasses = function(callback) {
  this.canvasses = this.canvasses || {};

  this.settings.color.forEach(color => {
    this.canvasses[color] = this.canvasses[color] || {};

    if (this.settings.shape[0] === "image") {
      this.loadAndDrawImages(color, callback);
    } else {
      this.settings.shape.forEach(shape => {
        this.canvasses[color][shape] = this.canvasses[color][shape] || {};

        ["fill", "stroke"].forEach(style => {
          this.canvasses[color][shape][style] = document.createElement("canvas");
          const canvas = this.canvasses[color][shape][style];
          const ctx = canvas.getContext("2d");

          switch (shape) {
            case "square":
              this.drawOffscreenCanvasForSquare(canvas, ctx, color, style);
              if (callback) callback();
              break;

            case "line":
              this.drawOffscreenCanvasForLine(canvas, ctx, color, style);
              if (callback) callback();
              break;

            case "triangle":
              this.drawOffscreenCanvasForTriangle(canvas, ctx, color, style);
              if (callback) callback();
              break;

            case "diamond":
              this.drawOffscreenCanvasForDiamond(canvas, ctx, color, style);
              if (callback) callback();
              break;

            case "star":
              this.drawOffscreenCanvasForStar(canvas, ctx, color, style);
              if (callback) callback();
              break;

            case "circle":
            default:
              this.drawOffscreenCanvasForCircle(canvas, ctx, color, style);
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
 * @param {String} style - style (either "fill" or "stroke")
 */
Sparticles.prototype.renderStyle = function(ctx, color, lineSize, style) {
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
Sparticles.prototype.renderGlow = function(ctx, color, size) {
  const glowSize = this.getGlowSize(size) / 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = glowSize;
};

/**
 * fill or stroke each particle's offscreen canvas depending on the given setting
 * @param {CanvasRenderingContext2D} ctx - the canvas context
 * @param {String} style - style (either "fill" or "stroke")
 */
Sparticles.prototype.renderColor = function(ctx, style) {
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
Sparticles.prototype.drawOffscreenCanvasForSquare = function(canvas, ctx, color, style) {
  const size = this.settings.maxSize;
  const lineSize = this.getLineSize(size);
  const glowSize = this.getGlowSize(size);
  const canvasSize = size + lineSize + glowSize;
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
Sparticles.prototype.drawOffscreenCanvasForLine = function(canvas, ctx, color, style) {
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
 * @param {String} style -  style (either "fill" or "stroke")
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */
Sparticles.prototype.drawOffscreenCanvasForTriangle = function(canvas, ctx, color, style) {
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
Sparticles.prototype.drawOffscreenCanvasForDiamond = function(canvas, ctx, color, style) {
  const size = this.settings.maxSize;
  const half = size / 2;
  const lineSize = this.getLineSize(size);
  const glowSize = this.getGlowSize(size);
  const canvasSize = size + lineSize + glowSize;
  const mid = canvasSize / 2;
  const anchor = size * 0.08;
  const pointx = size * 0.02;
  const startx = mid - half;
  const starty = mid;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  this.renderGlow(ctx, color, size);
  this.renderStyle(ctx, color, lineSize, style);
  ctx.beginPath();
  ctx.moveTo(startx + pointx, starty);
  ctx.bezierCurveTo(
    mid - anchor / 2,
    mid - anchor * 2,
    mid - anchor * 2,
    mid - anchor / 2,
    mid,
    mid - half
  );
  ctx.bezierCurveTo(
    mid + anchor * 2,
    mid - anchor / 2,
    mid + anchor / 2,
    mid - anchor * 2,
    mid + half - pointx,
    mid
  );
  ctx.bezierCurveTo(
    mid + anchor / 2,
    mid + anchor * 2,
    mid + anchor * 2,
    mid + anchor / 2,
    mid,
    mid + half
  );
  ctx.bezierCurveTo(
    mid - anchor * 2,
    mid + anchor / 2,
    mid - anchor / 2,
    mid + anchor * 2,
    startx + pointx,
    starty
  );
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
Sparticles.prototype.drawOffscreenCanvasForStar = function(canvas, ctx, color, style) {
  const size = 52;
  const lineSize = this.getLineSize(size);
  const glowSize = this.getGlowSize(size);
  const canvasSize = size + lineSize * 2 + glowSize;
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
Sparticles.prototype.drawOffscreenCanvasForCircle = function(canvas, ctx, color, style) {
  const size = this.settings.maxSize;
  const lineSize = this.getLineSize(size);
  const glowSize = this.getGlowSize(size);
  const canvasSize = size + lineSize + glowSize;
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

export default Sparticles;
