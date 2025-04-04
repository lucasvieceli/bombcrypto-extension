const gulp = require("gulp");
const terser = require("gulp-terser");
const rename = require("gulp-rename");
const javascriptObfuscator = require("gulp-javascript-obfuscator");

// Função para lidar com erros
function handleError(err) {
  console.error(err.toString());
  this.emit("end");
}

// Tarefa para minificar e ofuscar o JavaScript
gulp.task("minify-obfuscate-js", function (done) {
  return (
    gulp
      .src(["public/content.js", "public/second.js", "public/background.js"]) // Caminho para o arquivo JS de origem
      .pipe(
        terser({
          mangle: {
            toplevel: true,
          },
        }).on("error", handleError)
      ) // Minifica o JavaScript, incluindo renomeação de variáveis
      // .pipe(
      //   javascriptObfuscator({
      //     compact: true,
      //     // controlFlowFlattening: true,
      //     // deadCodeInjection: true,
      //     debugProtection: true,
      //     // disableConsoleOutput: true,
      //     identifierNamesGenerator: "hexadecimal",
      //     selfDefending: true,
      //     stringArray: true,
      //     stringArrayEncoding: ["base64"],
      //     target: "browser",
      //   }).on("error", handleError)
      // )

      .pipe(terser())
      .pipe(gulp.dest("out")) // Caminho para a pasta de destino
      .on("end", done)
  ); // Sinaliza a conclusão da tarefa
});

// Tarefa padrão para rodar a tarefa de minificação e ofuscação
gulp.task("default", gulp.series("minify-obfuscate-js"));
