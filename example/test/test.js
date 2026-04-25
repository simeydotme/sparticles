
let colorType = {
  type: "single"
};

let colors = {
  color1: "rgba(244,0,0,1)",
  color2: "rgba(252,248,230,1)",
  color3: "rgba(255,227,241,1)",
  color4: "rgba(230,248,255,1)"
};

let options = {
  alphaSpeed: 3,
  alphaVariance: 8,
  color: colors.color1,
  randomColorCount: 7,
  composition: "source-over",
  bounce: false,
  count: 200,
  direction: 180,
  drift: 0,
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
  maxSize: 50,
  minAlpha: 1,
  minSize: 20,
  parallax: 0,
  rotate: false,
  rotation: 0,
  shape: ["star"],
  speed: 1,
  spawnArea: 20,
  spawnLocations: [[50, 50]],
  spawnFromPoint: false,
  spawnFromCenter: false,
  staggerSpawn: 0,
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
};

window.updateSpawnDebugDots = function() {
  const $main = document.querySelector("main");
  if (!$main) return;
  const centerDot = document.getElementById("spawn-center-dot");
  const offsetDot = document.getElementById("spawn-offset-dot");
  if (!centerDot || !offsetDot) return;

  const show = !!options.spawnFromPoint;
  centerDot.style.display = show ? "block" : "none";
  offsetDot.style.display = show ? "block" : "none";
  if (!show) return;

  const rect = $main.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const loc =
    Array.isArray(options.spawnLocations) &&
    Array.isArray(options.spawnLocations[0]) &&
    options.spawnLocations[0].length >= 2
      ? options.spawnLocations[0]
      : [50, 50];
  const locX = (loc[0] / 100) * rect.width;
  const locY = (loc[1] / 100) * rect.height;

  centerDot.style.left = `${centerX}px`;
  centerDot.style.top = `${centerY}px`;
  offsetDot.style.left = `${locX}px`;
  offsetDot.style.top = `${locY}px`;
};

window.ensureSpawnDebugDots = function() {
  const $main = document.querySelector("main");
  if (!$main) return;
  $main.style.position = "relative";

  if (!document.getElementById("spawn-center-dot")) {
    const centerDot = document.createElement("div");
    centerDot.id = "spawn-center-dot";
    centerDot.style.position = "absolute";
    centerDot.style.width = "12px";
    centerDot.style.height = "12px";
    centerDot.style.borderRadius = "50%";
    centerDot.style.background = "rgba(0,255,80,0.95)";
    centerDot.style.border = "1px solid rgba(0,0,0,0.4)";
    centerDot.style.transform = "translate(-50%, -50%)";
    centerDot.style.pointerEvents = "none";
    centerDot.style.zIndex = "5";
    $main.appendChild(centerDot);
  }

  if (!document.getElementById("spawn-offset-dot")) {
    const offsetDot = document.createElement("div");
    offsetDot.id = "spawn-offset-dot";
    offsetDot.style.position = "absolute";
    offsetDot.style.width = "8px";
    offsetDot.style.height = "8px";
    offsetDot.style.borderRadius = "50%";
    offsetDot.style.background = "rgba(255,230,0,0.95)";
    offsetDot.style.border = "1px solid rgba(0,0,0,0.45)";
    offsetDot.style.transform = "translate(-50%, -50%)";
    offsetDot.style.pointerEvents = "none";
    offsetDot.style.zIndex = "6";
    $main.appendChild(offsetDot);
  }

  window.updateSpawnDebugDots();
};

window.addEventListener("resize", () => {
  window.updateSpawnDebugDots();
});

window.initSparticles = function() {
  var $main = document.querySelector("main");
  window.ensureSpawnDebugDots();
  window.mySparticles = new Sparticles($main,JSON.parse(JSON.stringify(options)));
  window.updateSpawnDebugDots();
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
    window.updateSpawnDebugDots();
  };

  const existing = Array.isArray(options.spawnLocations) ? options.spawnLocations : [];
  const spawnLocationsConfig = {
    location1Enabled: true,
    location1X: Array.isArray(existing[0]) ? existing[0][0] : 50,
    location1Y: Array.isArray(existing[0]) ? existing[0][1] : 50,
    location2Enabled: Array.isArray(existing[1]),
    location2X: Array.isArray(existing[1]) ? existing[1][0] : 50,
    location2Y: Array.isArray(existing[1]) ? existing[1][1] : 50,
    location3Enabled: Array.isArray(existing[2]),
    location3X: Array.isArray(existing[2]) ? existing[2][0] : 50,
    location3Y: Array.isArray(existing[2]) ? existing[2][1] : 50,
  };

  const rerenderSpawnLocations = () => {
    const nextLocations = [];
    if (spawnLocationsConfig.location1Enabled) {
      nextLocations.push([spawnLocationsConfig.location1X, spawnLocationsConfig.location1Y]);
    }
    if (spawnLocationsConfig.location2Enabled) {
      nextLocations.push([spawnLocationsConfig.location2X, spawnLocationsConfig.location2Y]);
    }
    if (spawnLocationsConfig.location3Enabled) {
      nextLocations.push([spawnLocationsConfig.location3X, spawnLocationsConfig.location3Y]);
    }
    options.spawnLocations = nextLocations.length > 0 ? nextLocations : [[50, 50]];
    rerender();
    window.updateSpawnDebugDots();
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
  part.add(options, "minSize", 1, 250, 1).onFinishChange(rerender);
  part.add(options, "maxSize", 1, 250, 1).onFinishChange(rerender);
  const anim = gui.addFolder("Animation");
  anim.add(options, "direction", 0, 360, 1).onFinishChange(rerender);
  anim.add(options, "speed", 0, 100, 0.1).onFinishChange(rerender);
  anim.add(options, "rotation", 0, 20, 0.1).onFinishChange(rerender);
  const move = anim.addFolder("Movement");
  move.add(options, "parallax", 0, 100, 1).onFinishChange(rerender);
  move.add(options, "drift", 0, 300, 0.01).onFinishChange(rerender);
  move.add(options, "xVariance", 0, 20, 0.1).onFinishChange(rerender);
  move.add(options, "yVariance", 0, 20, 0.1).onFinishChange(rerender);
  const spawn = anim.addFolder("From center");
  spawn.add(options, "spawnFromPoint").onFinishChange(rerender);
  spawn.add(options, "spawnArea", 0, 90, 1).onFinishChange(rerender);
  const spawnLocationsFolder = spawn.addFolder("spawnLocations");
  const loc1 = spawnLocationsFolder.addFolder("Location 1");
  loc1.add(spawnLocationsConfig, "location1Enabled").name("enabled").onFinishChange(rerenderSpawnLocations);
  loc1.add(spawnLocationsConfig, "location1X", 0, 100, 1).name("x").onFinishChange(rerenderSpawnLocations);
  loc1.add(spawnLocationsConfig, "location1Y", 0, 100, 1).name("y").onFinishChange(rerenderSpawnLocations);
  const loc2 = spawnLocationsFolder.addFolder("Location 2");
  loc2.add(spawnLocationsConfig, "location2Enabled").name("enabled").onFinishChange(rerenderSpawnLocations);
  loc2.add(spawnLocationsConfig, "location2X", 0, 100, 1).name("x").onFinishChange(rerenderSpawnLocations);
  loc2.add(spawnLocationsConfig, "location2Y", 0, 100, 1).name("y").onFinishChange(rerenderSpawnLocations);
  const loc3 = spawnLocationsFolder.addFolder("Location 3");
  loc3.add(spawnLocationsConfig, "location3Enabled").name("enabled").onFinishChange(rerenderSpawnLocations);
  loc3.add(spawnLocationsConfig, "location3X", 0, 100, 1).name("x").onFinishChange(rerenderSpawnLocations);
  loc3.add(spawnLocationsConfig, "location3Y", 0, 100, 1).name("y").onFinishChange(rerenderSpawnLocations);
  spawn.add(options, "staggerSpawn", 0, 20, 0.1).onFinishChange(rerender);
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
