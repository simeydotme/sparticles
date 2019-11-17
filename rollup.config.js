import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import filesize from "rollup-plugin-filesize";

export default [{
  input: "src/sparticles.js",
  plugins: [babel({
    babelrc: false,
    exclude: "node_modules/**"
  })],
  output: [{
    name: "sparticles",
    file: "dist/sparticles.js",
    format: "iife",
    plugins: [filesize()]
  }, {
    name: "sparticles",
    file: "dist/sparticles.min.js",
    format: "iife",
    plugins: [terser()]
  }],
  watch: {
    include: "src/**"
  }
}];
