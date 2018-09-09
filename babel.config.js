module.exports = {
  presets: [
    [
      "@babel/env",
      {
        targets: {
          browsers: [
            /* 
              FIXME: webpack
            */
            process.env.BABEL_ENV === "commonjs"
              ? "ie 11"
              : "last 2 Chrome versions"
          ]
        },
        useBuiltIns: "usage"
      }
    ]
  ],
};