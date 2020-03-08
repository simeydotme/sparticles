import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import filesize from "rollup-plugin-filesize";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";
import pkg from "./package.json";

const dev = process.env.ROLLUP_WATCH;
const prod = !dev;
const banner = () => `/**!
 * Sparticles - ${pkg.description}
 * @version ${pkg.version}
 * @license ${pkg.license}
 * @author ${pkg.author}
 * @website ${pkg.homepage}
 * @repository ${pkg.repository}
 */
`;

export default [
  {
    input: "src/sparticles.js",
    output: [
      {
        file: "dist/sparticles.esm.js",
        format: "esm",
        banner: banner(),
        plugins: [filesize()],
      },
      {
        name: "Sparticles",
        file: "dist/sparticles.js",
        format: "iife",
        banner: banner(),
        plugins: [filesize()],
      },
      {
        name: "Sparticles",
        file: "dist/sparticles.min.js",
        format: "iife",
        banner: banner(),
        plugins: [prod && terser()],
      },
    ],
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
    watch: {
      include: "src/**",
    },
  },
];
