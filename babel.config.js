module.exports ={
  presets: [
    ['@babel/env', { targets: { node: '10' } }],
    '@babel/typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/proposal-object-rest-spread',
  ],
}