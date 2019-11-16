/**
 * Limited Animation Frame method, to allow running
 * a given handler at the maximum desired frame rate.
 * @param {Number} fps how many frames to render every second
 * @param {Function} handler method to execute upon every frame
 */
export const AnimationFrame = function(fps = 60, handler = () => {}) {
    this.fps = fps;
    this.handler = handler;
    let renderId = 0;
  
    /**
     * begin the animation loop which is assigned
     * to the instance in the constructor
     */
    this.start = function() {
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
    };
  
    /**
     * stop the currently running animation loop
     */
    this.stop = function() {
      cancelAnimationFrame(renderId);
    };
  };
  
  export default AnimationFrame;
  