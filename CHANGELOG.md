# Change log

## 2.0.0

- **Rotation:** Particle spin is gentler for the same setting. A rotation value of 10 (or 20) now spins about half as fast as before, so the 0–20 range is easier to use without things looking too frantic. If you upgrade and your particles feel too slow, try doubling your `rotation` value.

- **Parallax:** Parallax is easier to control and no longer makes the whole scene much faster when you turn it up. Small particles move a bit slower and large ones a bit faster for a subtle depth effect, while the overall speed stays similar. It's off by default; use values like 10–50 for a noticeable effect. If you had parallax on in 1.x, try something like 10 or 20 to get a similar look.

- **Spawn from center:** You can have particles burst outward from the middle of the canvas. Set `spawnFromCenter: true` and they'll appear in a circle at the center and move outward. Use `spawnArea` to set the size of that starting circle as a percentage of the canvas width (0–90%, default 20). In this mode, `direction` is ignored; speed, drift, bounce, and fade-in still work as usual.

- **Staggered spawn:** When using spawn from center, you can spread out when particles first appear. Set `staggerSpawn` to a number of seconds (e.g. 2) and particles will appear one after another over that time instead of all at once. When they come back from the edges, they respawn right away with no extra delay.

- **spawnArea:** The option is now a **percentage of the canvas width** (0–90), default 20, instead of a pixel diameter. Values are clamped to 0–90. If you previously used a pixel value (e.g. 50), use a percentage instead (e.g. 10–25 for a small circle, depending on canvas size).

---

## 1.1.0

- shapes and images can now be used together in an array to mix basic shapes and custom images;
  ```js
  let mySparticles = new Sparticles( el, {

    shape: ["circle", "image"],
    imageUrl: "./snowflake.png"

  })
  ```

- fixed some performance / looping errors
- refactored/renamed a lot of prototype methods

- added the ability to write custom shapes in the off-chance that's
  better/easier than using a custom svg-image
  ```js
    // first make sure the Sparticles is ready in page.
    // then you can add a custom offScreenCanvas before initialising.
    Sparticles.prototype.offScreenCanvas.doge = function(style, color, canvas) {
      // code for custom shape here, access to "this" object
      // which is the Sparticles prototype.
    };
    // then initialise your sparticles instance with the custom shape
    let mySparticles = new Sparticles( el, { shape: "doge" });

  
  ```
