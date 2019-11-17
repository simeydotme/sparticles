import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import filesize from "rollup-plugin-filesize";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";

const dev = process.env.ROLLUP_WATCH;
const prod = !dev;

export default [
  {
    input: "src/sparticles.js",
    plugins: [
      babel({
        babelrc: false,
        exclude: "node_modules/**",
      }),
      dev &&
        serve({
          contentBase: "",
          host: "localhost",
          openPage: "/example/vanilla/vanilla.html",
          port: 5555,
        }),
      dev && livereload(),
    ],
    output: [
      {
        name: "sparticles",
        file: "dist/sparticles.js",
        format: "iife",
        plugins: [filesize()],
      },
      {
        name: "sparticles",
        file: "dist/sparticles.min.js",
        format: "iife",
        plugins: [prod && terser()],
      },
    ],
    watch: {
      include: "src/**",
    },
  },
];
