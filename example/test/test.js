
let colorType = {
  type: "multi"
};

let colors = {
  color1: "hsl(10,70%,50%)",
  color2: "rgba(252,248,230,1)",
  color3: "rgba(255,227,241,1)",
  color4: "rgba(230,248,255,1)"
};

let options = {
  alphaSpeed: 0,
  alphaVariance: 1,
  color: [colors.color1, colors.color2, colors.color3, colors.color4],
  composition: "source-over",
  bounce: true,
  count: 100,
  direction: 180,
  drift: 0,
  glow: 0,
  imageUrl: [
    "./snowflake.png",
    "https://image.flaticon.com/icons/svg/23/23858.svg",
    "https://image.flaticon.com/icons/svg/23/23883.svg",
    "https://image.flaticon.com/icons/svg/23/23889.svg",
    "https://image.flaticon.com/icons/svg/24/24296.svg",
    "https://image.flaticon.com/icons/svg/23/23901.svg",
    "https://image.flaticon.com/icons/svg/24/24286.svg"
  ],
  maxAlpha: 1,
  maxSize: 10,
  minAlpha: 0,
  minSize: 10,
  parallax: 0,
  rotate: true,
  rotation: 0,
  shape: "star",
  speed: 0,
  style: "fill",
  twinkle: false,
  xVariance: 5,
  yVariance: 5,
};

window.onload = function() {
  initStats();
  initSparticles();
  initGui();
}

window.initSparticles = function() {
  var $main = document.querySelector("main");
  window.mySparticles = new Sparticles($main,options);
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
  const shapes = ["circle", "square", "triangle", "diamond", "star", "line", "image"];
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
    s.createColorArray();
    s.createShapeArray();
    s.setupOffscreenCanvasses(function() {
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
  part.add(s.settings, "rotate").onFinishChange(rerender);
  part.add(s.settings, "bounce").onFinishChange(rerender);
  const image = part.addFolder("Image");
  // image.add(s.settings, "imageUrl").onFinishChange(rerender);
  part.add(s.settings, "minSize", 1, 50, 1).onFinishChange(rerender);
  part.add(s.settings, "maxSize", 1, 50, 1).onFinishChange(rerender);
  const anim = gui.addFolder("Animation");
  anim.add(s.settings, "direction", 0, 360, 1).onFinishChange(rerender);
  anim.add(s.settings, "speed", 0, 100, 0.1).onFinishChange(rerender);
  anim.add(s.settings, "rotation", 0, 100, 0.1).onFinishChange(rerender);
  const move = anim.addFolder("Movement");
  move.add(s.settings, "parallax", 0, 10, 0.1).onFinishChange(rerender);
  move.add(s.settings, "drift", 0, 10, 0.01).onFinishChange(rerender);
  move.add(s.settings, "xVariance", 0, 10, 0.1).onFinishChange(rerender);
  move.add(s.settings, "yVariance", 0, 10, 0.1).onFinishChange(rerender);
  const vis = gui.addFolder("Visual");
  vis.add(s.settings, "glow", 0,150).onFinishChange(rerender);
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
