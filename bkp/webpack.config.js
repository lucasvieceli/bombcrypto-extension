const path = require("path");

module.exports = {
  entry: "./src/background.js", // Seu script de entrada
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "background.bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
