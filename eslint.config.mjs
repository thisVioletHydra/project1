// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: {
    overrides: {
      'no-console': 'off',
    },
  },
})
