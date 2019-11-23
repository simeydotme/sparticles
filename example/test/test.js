
let colorType = {
  type: "multi"
};

let colors = {
  color1: "rgba(0,255,173,1)",
  color2: "rgba(210,88,109,1)",
  color3: "rgba(210,88,109,1)",
  color4: "rgba(210,88,109,1)"
};

let options = {
  alphaSpeed: 10,
  alphaVariance: 1,
  color: [colors.color1, colors.color2, colors.color3, colors.color4],
  composition: "screen",
  count: 100,
  direction: 180,
  float: 1,
  imageUrl: "",
  maxAlpha: 1,
  maxSize: 10,
  minAlpha: 0,
  minSize: 1,
  parallax: 1,
  rotation: 1,
  shape: "line",
  speed: 0,
  style: "fill",
  twinkle: false,
  xVariance: 2,
  yVariance: 2,
};

window.onload = function() {
  initStats();
  initSparticles();
  initGui();
}

window.initSparticles = function() {
  var $main = document.querySelector("main");
  window.mySparticles = new sparticles.Sparticles($main,options);
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
  const s = window.mySparticles;
  const shapes = ["circle", "square", "triangle", "line", "image"];
  const styles = ["fill", "stroke", "both"];
  const colorOptions = ["single", "multi", "rainbow"];
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
    s.setupColors();
    s.setupSparticleColors(function() {
      s.createSparticles();
    });
  };
  var rerenderColors = function(v) {
    if (colorType.type === "rainbow") {
      s.settings.color = "rainbow";
    } else if (colorType.type === "single") {
      s.settings.color = colors.color1;
    } else {
      s.settings.color = Object.keys(colors).map(i => {
        return colors[i];
      });
    }
    rerender();
  };

  const gui = new dat.GUI({ load: options });
  const part = gui.addFolder("Particles");
  part.open();
  part.add(s.settings, "count", 1, 500, 1).onFinishChange(rerender);
  part.add(s.settings, "shape", shapes).onFinishChange(rerender);
  part.add(s.settings, "style", styles).onFinishChange(rerender);
  const image = part.addFolder("Image");
  image.add(s.settings, "imageUrl").onFinishChange(rerender);
  part.add(s.settings, "minSize", 1, 50, 1).onFinishChange(rerender);
  part.add(s.settings, "maxSize", 1, 50, 1).onFinishChange(rerender);
  const anim = gui.addFolder("Animation");
  anim.add(s.settings, "direction", 0, 360, 1).onFinishChange(rerender);
  anim.add(s.settings, "speed", 0, 100, 0.1).onFinishChange(rerender);
  anim.add(s.settings, "rotation", 0, 100, 0.1).onFinishChange(rerender);
  const move = anim.addFolder("Movement");
  move.add(s.settings, "parallax", 0, 10, 0.1).onFinishChange(rerender);
  move.add(s.settings, "float", 0, 10, 0.1).onFinishChange(rerender);
  move.add(s.settings, "xVariance", 0, 10, 0.1).onFinishChange(rerender);
  move.add(s.settings, "yVariance", 0, 10, 0.1).onFinishChange(rerender);
  const vis = gui.addFolder("Visual");
  vis.add(s.settings, "composition", composites).onFinishChange(rerender);
  const alpha = vis.addFolder("Alpha");
  alpha.add(s.settings, "twinkle").onFinishChange(rerender);
  alpha.add(s.settings, "minAlpha", -2, 2, 0.1).onFinishChange(rerender);
  alpha.add(s.settings, "maxAlpha", -2, 2, 0.1).onFinishChange(rerender);
  alpha.add(s.settings, "alphaSpeed", 0, 50, 1).onFinishChange(rerender);
  alpha.add(s.settings, "alphaVariance", 0, 20, 1).onFinishChange(rerender);
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
