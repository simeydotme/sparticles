# Change log
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
