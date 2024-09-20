import postCSSPresetEnv from 'postcss-preset-env'

export default {
  plugins: [
    postCSSPresetEnv({
      stage: 3,
    }),
  ],
}
