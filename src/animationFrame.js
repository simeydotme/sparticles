/**
 * Limited Animation Frame method, to allow running
 * a given handler at the maximum desired frame rate.
 * inspired from https://gist.github.com/addyosmani/5434533
 * @param {Function} handler method to execute upon every frame
 * @param {Number} fps how many frames to render every second
 */
export const AnimationFrame = function(handler = () => {}, fps = 60) {
  this.fps = fps;
  this.handler = handler;
  let renderId = 0;

  /**
   * begin the animation loop which is assigned
   * to the instance in the constructor
   */
  this.start = function() {
    if (!this.started) {
      let then = performance.now();
      const interval = 1000 / this.fps;
      const tolerance = 0;

      const loop = now => {
        const delta = now - then;
        renderId = requestAnimationFrame(loop);
        if (delta >= interval - tolerance) {
          this.handler(delta);
          then = now - (delta % interval);
        }
      };

      renderId = requestAnimationFrame(loop);
      this.started = true;
    }
  };

  /**
   * stop the currently running animation loop
   */
  this.stop = function() {
    cancelAnimationFrame(renderId);
    this.started = false;
  };
};

export default AnimationFrame;
