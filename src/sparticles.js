import { AnimationFrame } from "./animationFrame.js";
import { clamp, randomHsl } from "./helpers.js";
import { Sparticle } from "./sparticle.js";

/**
 * Sparticles Constructor;
 * Create a <canvas>, append to the given node, and start the particle effect
 * @param {HTMLElement} [node=document.body] - element to which canvas is appended to
 * @param {Object} [options={}] - settings to use for the particle effect
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
 * @param {Boolean} [options.bounce=false] - should the particles bounce off edge of canvas
 * @param {Number} [options.drift=1] - the "driftiness" of particles which have a horizontal/vertical direction
 * @param {Number} [options.glow=0] - the glow effect size of each particle
 * @param {Boolean} [options.twinkle=false] - particles to exhibit an alternative alpha transition as "twinkling"
 * @param {String} [options.style=fill] - fill style of particles (one of; "fill", "stroke" or "both")
 * @param {(String|String[])} [options.shape=circle] - shape of particles (any of; circle, square, triangle, diamond, line, image) or "random"
 * @param {(String|String[])} [options.imageUrl=] - if shape is "image", define an image url (can be data-uri, must be square (1:1 ratio))
 * @param {(String|String[])} [options.color=random] - css color as string, or array of color strings (can also be "random")
 * @param {Function} [options.randomColor=randomHsl(index,total)] - a custom function for setting the random colors when color="random"
 * @param {Number} [options.randomColorCount=3] - the number of random colors to generate when color is "random"
 * @param {Number} [width] - the width of the canvas element
 * @param {Number} [height=width] - the height of the canvas element
 * @returns {Object} - reference to a new Sparticles instance
 */
const Sparticles = function(node, options, width, height) {
  if (arguments.length >= 1 && !(arguments[0] instanceof HTMLElement)) {
    options = arguments[0];
    width = arguments[1];
    height = arguments[2];
    node = undefined;
  }
  if (width && !height) {
    height = width;
  }
  const defaults = {
    alphaSpeed: 10,
    alphaVariance: 1,
    bounce: false,
    color: "random",
    randomColor: randomHsl,
    randomColorCount: 3,
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
  this.resizable = !width && !height;
  this.width = this.resizable ? this.el.clientWidth : width;
  this.height = this.resizable ? this.el.clientHeight : height;

  /**
   * initialise the sparticles instance
   * @returns {Object} - reference to the Sparticles instance
   */
  this.init = function() {
    this.sparticles = [];
    this.colors = this.getColorArray();
    this.shapes = this.getShapeArray();
    this.styles = this.getStyleArray();
    this.imageUrls = this.getImageArray();
    this.setupMainCanvas();
    this.setupOffscreenCanvasses(() => {
      this.createSparticles();
      this.start();
    });
    // defer to the default "handleEvent" handler
    // https://developer.mozilla.org/en-US/docs/Web/API/EventListener/handleEvent
    window.addEventListener("resize", this);
    return this;
  };

  /**
   * handle event for screen resize;
   * debounce a canvas resize,
   * reset the particles
   */
  this.handleEvent = function(event) {
    if (event.type === "resize") {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        if (this.resizable) {
          this.width = this.el.clientWidth;
          this.height = this.el.clientHeight;
          this.setCanvasSize().resetSparticles();
        }
      }, 200);
    }
  };

  /**
   * start/resume the sparticles animation
   * @returns {Object} - the Sparticle instance (for chaining)
   */
  this.start = function() {
    const me = this;
    if (!this.loop) {
      this.loop = new AnimationFrame(t => {
        me.drawFrame(t);
      });
    }
    this.loop.start();
    return this;
  };

  /**
   * stop/pause the sparticles animation
   * @returns {Object} - the Sparticle instance (for chaining)
   */
  this.stop = function() {
    this.loop.stop();
    return this;
  };

  /**
   * destroy the current instance and free up some memory
   * @returns {Object} - the Sparticle instance (for chaining)
   */
  this.destroy = function() {
    // stop the rendering and updating
    this.stop();
    // remove the canvas element from the DOM
    this.el.removeChild(this.canvas);
    // remove the resize event for this instance
    window.removeEventListener("resize", this);
    // delete all the properties from the instance
    // to free up memory
    for (const prop in this) {
      if (this.hasOwnProperty(prop)) {
        delete this[prop];
      }
    }
    return this;
  };

  /**
   * set the canvas width and height
   * @param {Number} width - the width of the canvas
   * @param {Number} height - the height of the canvas
   * @returns {Object} - the Sparticle instance (for chaining)
   */
  this.setCanvasSize = function(width, height) {
    if (width) {
      this.resizable = false;
    }
    this.width = width || this.width;
    this.height = height || this.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    return this;
  };

  /**
   * create an array and populate it with new Sparticle instances.
   * @returns {Array} the array of Sparticle instances
   */
  this.resetSparticles = this.createSparticles = function() {
    this.sparticles = [];
    this.ctx.globalCompositeOperation = this.settings.composition;
    for (let i = 0; i < this.settings.count; i++) {
      this.sparticles.push(new Sparticle(this));
    }
    this.sparticles.sort((a, b) => {
      return a.size > b.size;
    });
    return this.sparticles;
  };

  // initialise the sparticles, and return the instance.
  return this.init();
};

/**
 * convert the input color to an array if it isn't already
 * @returns {Array} - array of colors for use in rendering
 */
Sparticles.prototype.getColorArray = function() {
  let colors = Array.isArray(this.settings.color) ? this.settings.color : [this.settings.color];
  const isRandom = colors.some(c => c === "random");

  if (isRandom) {
    for (let i = 0; i < this.settings.randomColorCount; i++) {
      colors[i] = this.settings.randomColor(i, this.settings.randomColorCount);
    }
  }

  return colors;
};

/**
 * convert the input shape to an array if it isn't already
 * @returns {Array} - array of shapes for use in rendering
 */
Sparticles.prototype.getShapeArray = function() {
  let shapes = Array.isArray(this.settings.shape) ? this.settings.shape : [this.settings.shape];
  const isRandom = shapes.some(c => c === "random");

  if (isRandom) {
    shapes = ["square", "circle", "triangle"];
  }

  return shapes;
};

/**
 * convert the imageUrl option to an array if it isn't already
 * @returns {Array} - array of image urls for use in rendering
 */
Sparticles.prototype.getImageArray = function() {
  return Array.isArray(this.settings.imageUrl) ? this.settings.imageUrl : [this.settings.imageUrl];
};

/**
 * convert the input style to an array
 * @returns {Array} - array of styles for use in rendering
 */
Sparticles.prototype.getStyleArray = function() {
  let styles = this.settings.style;
  if (styles !== "fill" && styles !== "stroke") {
    styles = ["fill", "stroke"];
  } else {
    styles = [styles];
  }
  return styles;
};

/**
 * set up the canvas and bind to a property for
 * access later on, append it to the DOM
 * @returns {HTMLCanvasElement} - the canvas element which was appended to DOM
 */
Sparticles.prototype.setupMainCanvas = function() {
  this.canvas = document.createElement("canvas");
  this.canvas.setAttribute("class", "sparticles");
  this.ctx = this.canvas.getContext("2d");
  this.setCanvasSize();
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
  const colors = this.colors.filter((item, index) => this.colors.indexOf(item) === index);
  const shapes = this.shapes.filter((item, index) => this.shapes.indexOf(item) === index);
  const styles = this.styles.filter((item, index) => this.styles.indexOf(item) === index);
  const imageUrls = this.imageUrls.filter((item, index) => this.imageUrls.indexOf(item) === index);
  const imageCount = colors.length * imageUrls.length;
  const canvasCount = colors.length * shapes.length * styles.length;
  let imagesLoaded = 0;
  let canvassesCreated = 0;

  this.canvasses = this.canvasses || {};

  colors.forEach(color => {
    this.canvasses[color] = this.canvasses[color] || {};

    shapes.forEach(shape => {
      this.canvasses[color][shape] = this.canvasses[color][shape] || {};

      if (shape === "image") {
        imageUrls.forEach((imageUrl, i) => {
          let image = new Image();
          const imageCanvas = document.createElement("canvas");
          this.canvasses[color][shape][imageUrl] = imageCanvas;

          image.onload = () => {
            imagesLoaded++;
            this.drawOffscreenCanvasForImage(image, color, imageCanvas);
            if (callback && imagesLoaded === imageCount) {
              callback();
            }
          };

          image.onerror = () => {
            console.error("failed to load source image: ", imageUrl);
          };

          image.src = imageUrl;
        });
      } else {
        styles.forEach(style => {
          const canvas = document.createElement("canvas");
          this.canvasses[color][shape][style] = canvas;
          canvassesCreated++;

          this.drawOffscreenCanvas(shape, style, color, canvas);

          if (callback && canvassesCreated === canvasCount) {
            callback();
          }
        });
      }
    });
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
 * pass-through the needed parameters to the offscreen canvas
 * draw function associated with the given shape
 * @param {String} shape -  shape of the canvas to draw (eg: "circle")
 * @param {String} style -  style (either "fill" or "stroke")
 * @param {String} color - the color to fill/stroke with
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */
Sparticles.prototype.drawOffscreenCanvas = function(shape, style, color, canvas) {
  return this.offScreenCanvas[shape].call(this, style, color, canvas);
};

/**
 * object of shapes to draw
 */
Sparticles.prototype.offScreenCanvas = {};

/**
 * create, setup and render an offscreen canvas for a
 * Circle Particle of the given color
 * @param {String} style -  style (either "fill" or "stroke")
 * @param {String} color - the color to fill/stroke with
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */
Sparticles.prototype.offScreenCanvas.circle = function(style, color, canvas) {
  const ctx = canvas.getContext("2d");
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
 * create, setup and render an offscreen canvas for a
 * Square Particle of the given color
 * @param {String} style -  style (either "fill" or "stroke")
 * @param {String} color - the color to fill/stroke with
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */
Sparticles.prototype.offScreenCanvas.square = function(style, color, canvas) {
  const ctx = canvas.getContext("2d");
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
 * @param {String} style -  style (either "fill" or "stroke")
 * @param {String} color - the color to fill/stroke with
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */
Sparticles.prototype.offScreenCanvas.line = function(style, color, canvas) {
  const ctx = canvas.getContext("2d");
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
 * @param {String} style -  style (either "fill" or "stroke")
 * @param {String} color - the color to fill/stroke with
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */
Sparticles.prototype.offScreenCanvas.triangle = function(style, color, canvas) {
  const ctx = canvas.getContext("2d");
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
 * @param {String} style -  style (either "fill" or "stroke")
 * @param {String} color - the color to fill/stroke with
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */
Sparticles.prototype.offScreenCanvas.diamond = function(style, color, canvas) {
  const ctx = canvas.getContext("2d");
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
 * @param {String} style -  style (either "fill" or "stroke")
 * @param {String} color - the color to fill/stroke with
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */
Sparticles.prototype.offScreenCanvas.star = function(style, color, canvas) {
  const ctx = canvas.getContext("2d");
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
 * Custom Image Particle of the given color
 * @param {HTMLImageElement} image - the image element that has loaded
 * @param {String} color - the color to fill/stroke with
 * @param {HTMLCanvasElement} canvas - the canvas element
 * @returns {HTMLCanvasElement} - the created offscreen canvas
 */
Sparticles.prototype.drawOffscreenCanvasForImage = function(image, color, canvas) {
  const size = image.width;
  const ctx = canvas.getContext("2d");
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(image, 0, 0, size, size, 0, 0, size, size);
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  return canvas;
};

/**
 * - wipe the canvas,
 * - update each sparticle,
 * - render each sparticle
 * @returns {Array} the array of Sparticle instances
 */
Sparticles.prototype.drawFrame = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
  for (let i = 0; i < this.sparticles.length; i++) {
    let sparticle = this.sparticles[i];
    sparticle.update().render(this.canvasses);
  }
  return this.sparticles;
};

export default Sparticles;
