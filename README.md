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
**[rotate](#rotate)**               | `Number`          | `true`          | can particles rotate
**[rotation](#rotation)**           | `Number`          | `1`             | default rotational speed for every particle
**[alphaSpeed](#alphaSpeed)**       | `Number`          | `10`            | rate of change in alpha over time
**[alphaVariance](#alphaVariance)** | `Number`          | `1`             | random deviation of alpha change
**[minAlpha](#minAlpha)**           | `Number`          | `0`             | minumum alpha value of every particle
**[maxAlpha](#maxAlpha)**           | `Number`          | `1`             | maximum alpha value of every particle
**[minSize](#minSize)**             | `Number`          | `1`             | minimum size of every particle
**[maxSize](#maxSize)**             | `Number`          | `10`            | maximum size of every particle
**[style](#style)**                 | `String`          | `fill`          | fill style of particles (one of; "fill", "stroke")
**[bounce](#bounce)**               | `Boolean`         | `false`         | should the particles bounce off edge of canvas
**[drift](#drift)**                 | `Number`          | `1`             | the "driftiness" of particles which have a direction at a 90 degree value (±20)
**[glow](#glow)**                   | `Number`          | `0`             | the glow effect size of each particle
**[twinkle](#twinkle)**             | `Boolean`         | `false`         | particles to exhibit an alternative alpha transition as "twinkling"
**[color](#color)**                 | `String`/`Array`  | `white`         | css color as string, or array or color strings (can also be "rainbow")
**[shape](#shape)**                 | `String`/`Array`  | `circle`        | shape of particles (any of; circle, square, triangle, diamond, line, image) or "random"
**[imageUrl](#imageUrl)**           | `String`/`Array`  |                 | if shape is "image", define an image url (can be data-uri, should be square (1:1 ratio))

---

## `composition`

## `count`

## `speed`

## `parallax`

## `direction`

## `xVariance`

## `yVariance`

## `rotate`

## `rotation`

## `alphaSpeed`

## `alphaVarianc`

## `minAlpha`

## `maxAlpha`

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
