
let colorType = {
  type: "multi"
};

let colors = {
  color1: "rgba(242,210,65,1)",
  color2: "rgba(252,248,230,1)",
  color3: "rgba(255,227,241,1)",
  color4: "rgba(230,248,255,1)"
};

let options = {
  alphaSpeed: 3,
  alphaVariance: 8,
  // color: [colors.color1, colors.color2, colors.color3, colors.color4],
  randomColorCount: 3,
  composition: "source-over",
  bounce: false,
  count: 10,
  direction: 180,
  drift: 3,
  glow: 0,
  imageUrl: [
    "./snowflake.png",
    "./star.png",
    "./star.png",
    "./star.png",
    "./star.png",
    "./star.png",
    "./star.png",
    "./star.png",
    "./star.png",
    "./star.png"
  ],
  maxAlpha: 1,
  maxSize: 30,
  minAlpha: 1,
  minSize: 20,
  parallax: 2,
  rotate: false,
  rotation: 0,
  shape: ["wow"],
  speed: 5,
  style: "both",
  twinkle: false,
  xVariance: 0,
  yVariance: 0,
};

window.onload = function() {

  Sparticles.prototype.offScreenCanvas.wow = function(style, color, canvas) {
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


  initStats();
  initSparticles();
  initGui();
}

window.initSparticles = function() {
  var $main = document.querySelector("main");
  window.mySparticles = new Sparticles($main,JSON.parse(JSON.stringify(options)));
};

window.initStats = function() {
  var stats = new Stats();
  document.body.appendChild(stats.dom);
  function statsDisplay() {
    stats.begin();
    stats.end();
    requestAnimationFrame(statsDisplay);
  }
  requestAnimationFrame(statsDisplay);
};

window.initGui = function() {
  let s = window.mySparticles;
  const shapes = ["random", "circle", "square", "triangle", "diamond", "star", "line", "image"];
  const styles = ["fill", "stroke", "both"];
  const colorOptions = ["single", "multi", "random"];
  const composites = [
    "source-over",
    "source-in",
    "source-out",
    "source-atop",
    "destination-over",
    "destination-in",
    "destination-out",
    "destination-atop",
    "lighter",
    "copy",
    "xor",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity"
  ];

  const rerender = () => {
    if( window.mySparticles && window.mySparticles instanceof Sparticles ) {
      try {
        window.mySparticles.destroy();
      } catch(e) {
        document.querySelector("main").removeChild( s.canvas );
      }
    }
    window.initSparticles();
  };

  var rerenderColors = function(v) {
    if (colorType.type === "random") {
      options.color = "random";
    } else if (colorType.type === "single") {
      options.color = colors.color1;
    } else {
      options.color = Object.keys(colors).map(i => {
        return colors[i];
      });
    }
    rerender();
  };

  const gui = new dat.GUI({ load: options });
  const part = gui.addFolder("Particles");
  part.open();
  part.add(options, "count", 1, 500, 1).onFinishChange(rerender);
  part.add(options, "shape", shapes).onFinishChange(rerender);
  part.add(options, "style", styles).onFinishChange(rerender);
  part.add(options, "rotate").onFinishChange(rerender);
  part.add(options, "bounce").onFinishChange(rerender);
  const image = part.addFolder("Image");
  // image.add(options, "imageUrl").onFinishChange(rerender);
  part.add(options, "minSize", 1, 50, 1).onFinishChange(rerender);
  part.add(options, "maxSize", 1, 50, 1).onFinishChange(rerender);
  const anim = gui.addFolder("Animation");
  anim.add(options, "direction", 0, 360, 1).onFinishChange(rerender);
  anim.add(options, "speed", 0, 100, 0.1).onFinishChange(rerender);
  anim.add(options, "rotation", 0, 100, 0.1).onFinishChange(rerender);
  const move = anim.addFolder("Movement");
  move.add(options, "parallax", 0, 10, 0.1).onFinishChange(rerender);
  move.add(options, "drift", 0, 30, 0.01).onFinishChange(rerender);
  move.add(options, "xVariance", 0, 20, 0.1).onFinishChange(rerender);
  move.add(options, "yVariance", 0, 20, 0.1).onFinishChange(rerender);
  const vis = gui.addFolder("Visual");
  vis.add(options, "glow", 0,150).onFinishChange(rerender);
  vis.add(options, "composition", composites).onFinishChange(rerender);
  const alpha = vis.addFolder("Alpha");
  alpha.add(options, "twinkle").onFinishChange(rerender);
  alpha.add(options, "minAlpha", -2, 2, 0.1).onFinishChange(rerender);
  alpha.add(options, "maxAlpha", -2, 2, 0.1).onFinishChange(rerender);
  alpha.add(options, "alphaSpeed", 0, 50, 1).onFinishChange(rerender);
  alpha.add(options, "alphaVariance", 0, 20, 1).onFinishChange(rerender);
  const color = vis.addFolder("Color");
  color.open();
  color.add(colorType, "type", colorOptions).onFinishChange(rerenderColors);
  color.addColor(colors, "color1").onFinishChange(rerenderColors);
  color.addColor(colors, "color2").onFinishChange(rerenderColors);
  color.addColor(colors, "color3").onFinishChange(rerenderColors);
  color.addColor(colors, "color4").onFinishChange(rerenderColors);
  const control = gui.addFolder("Controls");
  control.add(s,"start");
  control.add(s,"stop");
};
