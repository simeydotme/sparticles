# Sparticles
**Lightweight, _High Performance_ Particles in Canvas.**  
Designed for those occasions when you ***just have to have*** sparkles, snow, or stars on your homepage.

# installation

Depending on how your project looks, you may want to [include a direct link to the script](#vanilla) and 
then initialise the sparkles _(for example [on a wordpress site, or inside a CMS](#jquery))_ or you may want
to [import the module in to your application](#bundler) for a morer modern approach.

## vanilla

## jquery

## bundler

### example with rollup/svelte

# usage

# styling

# options

A brief look at all the options, with more details below.

option                             | type              | default         | description
|----------------------------------|-------------------|-----------------|-----------------------------------------------------|
**[composition](#composition)**     | `String`          | `source-over`   | canvas globalCompositeOperation value for particles
**[count](#count)**                 | `Number`          | `50`            | number of particles on the canvas simultaneously
**[speed](#speed)**                 | `Number`          | `10`            | default velocity of every particle
**[parallax](#parallax)**           | `Number`          | `1`             | speed multiplier effect for larger particles (0 = none)
**[direction](#direction)**         | `Number`          | `180`           | default direction of particles in degrees (0 = ↑, 180 = ↓)
**[xVariance](#xVariance)**         | `Number`          | `2`             | random deviation of particles on x-axis from default direction
**[yVariance](#yVariance)**         | `Number`          | `2`             | random deviation of particles on y-axis from default direction
**[rotate](#rotate)**               | `Boolean`         | `true`          | can particles rotate
**[rotation](#rotation)**           | `Number`          | `1`             | default rotational speed for every particle
**[alphaSpeed](#alphaSpeed)**       | `Number`          | `10`            | rate of change in alpha over time
**[alphaVariance](#alphaVariance)** | `Number`          | `1`             | random deviation of alpha change
**[minAlpha](#minAlpha)**           | `Number`          | `0`             | minumum alpha value of every particle
**[maxAlpha](#maxAlpha)**           | `Number`          | `1`             | maximum alpha value of every particle
**[minSize](#minSize)**             | `Number`          | `1`             | minimum size of every particle
**[maxSize](#maxSize)**             | `Number`          | `10`            | maximum size of every particle
**[style](#style)**                 | `String`          | `fill`          | fill style of particles (one of; "fill", "stroke" or "both")
**[bounce](#bounce)**               | `Boolean`         | `false`         | should the particles bounce off edge of canvas
**[drift](#drift)**                 | `Number`          | `1`             | the "driftiness" of particles which have a horizontal/vertical direction
**[glow](#glow)**                   | `Number`          | `0`             | the glow effect size of each particle
**[twinkle](#twinkle)**             | `Boolean`         | `false`         | particles to exhibit an alternative alpha transition as "twinkling"
**[color](#color)**                 | `String`/`Array`  | `white`         | css color as string, or array of color strings (can also be "rainbow")
**[shape](#shape)**                 | `String`/`Array`  | `circle`        | shape of particles (any of; circle, square, triangle, diamond, line, image) or "random"
**[imageUrl](#imageUrl)**           | `String`/`Array`  |                 | if shape is "image", define an image url (can be data-uri, should be square (1:1 ratio))

---

## `composition`
- Type: `String` 
- Default: `source-over`
- Possible: [`see list here`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)

The [global render composition](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)
when rendering particles on top of one-another. This, however, is a very expensive operation when set to anything
other than the default value (`source-over`), and will ultimately degrade performance, especially with many particles.

Will accept [any of the values that are provided as part of the Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)

## `count`
- Type: `Number`
- Default: `50`
- Range: `1 - 10000`

Simply the number of particles drawn to the screen.  
Values over `500` may begin to degrade performance.

## `speed`
- Type: `Number`
- Default: `10`
- Range: `0 - 100`

The base value of speed across all particles. This is modified by options such as 
`parallax` and `[x/y]Variance` to determine the final velocity of each individual particle.
A speed of `0` will render particles stationary before applying `[x/y]Variance`.

## `parallax`
- Type: `Number`
- Default: `1`
- Range: `0 - 20`

A value to apply more speed to larger particles, and less speed to smaller particles, creating
an effect which makes larger particles appear closer to the screen.

## `direction`
- Type: `Number`
- Default: `180`
- Range: `0 - 360`

The base angle (in degrees) at which the particles are travelling, so long as they have a speed value.

## `xVariance`
- Type: `Number`
- Default: `2`
- Range: `0 - 20`

How much variance is applied between particles on the `X` axis. A value of `0` will make all particles
appear to be going completely parallel, and look unnatural.

Can be used in conjunction with `speed: 0;` to make particles which float randomly in space.

## `yVariance`
- Type: `Number`
- Default: `2`
- Range: `0 - 20`

How much variance is applied between particles on the `Y` axis. A value of `0` will make all particles
appear to be going completely parallel, and look unnatural.

Can be used in conjunction with `speed: 0;` to make particles which float randomly in space.

## `rotate`
- Type: `Boolean`
- Default: `true`

Toggle whether the particles are allowed to spin about their axis.

## `rotation`
- Type: `Number`
- Default: `1`
- Range: `0 - 20`

How fast the particles can spin about their axis, this has a random multiplier added per-particle
which prevents a completely unnatural spinning effect.

## `alphaSpeed`
- Type: `Number`
- Default: `10`
- Range: `0 - 50`

Rate of change for the alpha value of all particles. A higher value will encourage the particles
to flicker like candle lights. A value of `0` will disable alpha change.

## `alphaVariance`
- Type: `Number`
- Default: `2`
- Range: `0 - 10`

How much variance is applied between each particle on the alpha value change over time. A value
of `0` will cause all particles to change alpha at the same rate, a higher value will introduce more
variety.

## `minAlpha`
- Type: `Number`
- Default: `0`
- Range: `-5 - +1`

The minimum alpha value a particle can change to. The lower the number the longer it will stay invisible
on the canvas, this could be useful in some scenarios where the particle should fade out for a while.

Must be lower than the `maxAlpha` value.

## `maxAlpha`
- Type: `Number`
- Default: `0`
- Range: `0 - +5`

The maximum alpha value a particle can change to. The higher the number the longer it will stay visible
on the canvas, this could be useful in some scenarios where the particle should stay at max alpha for a time.

Must be higher than the `minAlpha` value.

## `minSize`

## `maxSize`

## `style`

## `bounce`

## `drift`

## `glow`

## `twinkle`

## `color`

## `shape`

## `imageUrl`
