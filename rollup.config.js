import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";

export default {
  input: "socket.js", // Seu arquivo de entrada
  output: {
    file: "dist/bundle.js", // Arquivo de saída
    format: "esm", // Formato ES Module
  },
  plugins: [
    resolve({ browser: true, preferBuiltins: false }),
    commonjs(),
    builtins(),
    globals(),
  ],
};
