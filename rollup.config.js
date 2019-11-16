import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import filesize from "rollup-plugin-filesize";

export default {
  input: "src/sparticles.js",
  plugins: [babel({
    babelrc: false,
    exclude: "node_modules/**"
  })],
  output: [{
    name: "sparticles",
    file: "dist/sparticles.js",
    format: "umd",
    plugins: [filesize()]
  },{
    name: "sparticles",
    file: "dist/sparticles.min.js",
    format: "umd",
    plugins: [terser()]
  }],
  watch: {
    include: "src/**"
  }
};
