module.exports = {
  entry: {
    app: ["./index.js"]
  },
  output: {
    library: 'cerebralFalcorModule',
    libraryTarget: 'commonjs2',
    filename: 'dist/index.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel",
        query: {
          optional: ["runtime"],
          stage: 0
        }
      }
    ]
  },
  resolve: {
    extensions: ["", ".js"]
  }
};
