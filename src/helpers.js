export const radian = angle => {
    return (angle * Math.PI) / 180;
  };
  
  export const cartesian = angle => {
    return [Math.cos(radian(angle - 90)), Math.sin(radian(angle - 90))];
  };
  
  /**
   * round a Float to the nearest Integer value
   * @param {Number} num value to round to the nearest integer
   * @returns {Number} the input num rounded to the nearest integer
   */
  export const round = num => {
    return (0.5 + num) | 0;
  };
  
  /**
   * clamp the input number to the min/max values
   * @param {Number} num value to clamp between min and max
   * @param {Number} min minimum value possible
   * @param {Number} max maximum value possible
   * @returns {Number} the input num clamped between min/max
   */
  export const clamp = (num, min = 0, max = 1) => {
    return Math.max(min, Math.min(max, num));
  };
  
  /**
   *
   * @param {Number} min minimum value
   * @param {Number} max maximum value
   * @param {Boolean} rounded should the result be rounded
   * @returns {Number} a random number between min and max
   */
  export const random = (min = 0, max = 1, rounded = false) => {
    let value = max;
    if ((min !== 0 || max !== 1) && max > min) {
      value = Math.random() * (max - min) + min;
    }
    if (rounded) {
      value = round(value);
    }
    return value;
  };
  
  export const randomArray = array => {
    return array[Math.floor(random(0, array.length))];
  };
  
  export const randomHsl = () => {
    const h = random(0, 360, true);
    const s = random(90, 100, true);
    const l = random(45, 85, true);
    return `hsl(${h},${s}%,${l}%)`;
  };
  
  /**
   * return a boolean to pass a dice roll
   * @param {Number} odds a fraction to use as the probability, can be supplied as "1/2"
   * @returns {Boolean}
   */
  export const roll = odds => {
    return odds > random();
  };
  
  export const easeInOutCubic = function(t, b, c, d) {
    if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
    return (c / 2) * ((t -= 2) * t * t + 2) + b;
  };
  