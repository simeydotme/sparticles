/**
 * return the cartesian x/y delta value from a degree
 * eg: 90 (→) = [1,0]
 * @param {Number} angle angle in degrees
 * @returns {Number[]} cartesian delta values
 */
export const cartesian = angle => {
  return [Math.cos(radian(angle - 90)), Math.sin(radian(angle - 90))];
};

/**
 * clamp the input number to the min/max values
 * @param {Number} value value to clamp between min and max
 * @param {Number} min minimum value possible
 * @param {Number} max maximum value possible
 * @returns {Number} the input num clamped between min/max
 */
export const clamp = (value, min = 0, max = 1) => {
  return Math.max(min, Math.min(max, value));
};
/**
 * return the radian equivalent to a degree value
 * @param {Number} angle angle in degrees
 * @returns {Number} radian equivalent
 */
export const radian = angle => {
  return (angle * Math.PI) / 180;
};

/**
 * return random number between a min and max value
 * @param {Number} min minimum value
 * @param {Number} max maximum value
 * @param {Boolean} rounded should the result be rounded
 * @returns {Number} a random number between min and max
 */
export const random = (min = 0, max = 1, value = Math.random()) => {
  if (max <= min) {
    value = min;
  } else if ((min !== 0 || max !== 1) && max > min) {
    value = value * (max - min) + min;
  }
  return value;
};

/**
 * return a random value from an array
 * @param {Array} array an array to get random value from
 * @returns {*} random value from array
 */
export const randomArray = array => {
  return array[Math.floor(random(0, array.length))];
};

/**
 * return a random HSL colour string for use in random color effect
 * @returns {String} "hsl(100,100,80)"
 */
export const randomHsl = () => {
  const h = round(random(0, 360));
  const s = round(random(90, 100));
  const l = round(random(45, 85));
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

/**
 * round a number to the nearest integer value
 * @param {Number} value value to round to the nearest integer
 * @returns {Number} nearest integer
 */
export const round = value => {
  return (0.5 + value) | 0;
};
