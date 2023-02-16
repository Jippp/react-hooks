const path = require('path')
const { override, addWebpackAlias, addLessLoader, adjustStyleLoaders } = require('customize-cra')

module.exports = override(
  // 别名
  addWebpackAlias({
    '@': path.join(__dirname, '/src')
  }),
  addLessLoader({
    // @6版本之上，需要使用lessOptions包裹
    lessOptions: {
      javascriptEnabled: true,
      cssLoaderOptions: {}, // .less file used css-loader option, not all CSS file.
    },
    cssModules: {
      // if you use CSS Modules, and custom `localIdentName`, default is '[local]--[hash:base64:5]'.
      localIdentName: "[path][name]__[local]--[hash:base64:5]", 
    },
  }),
  /**
   * lessloader 最新版基于webpack5开发，而react-app-rewired基于webpack4，所以需要注意版本
   * 但是即使将lessloader版本降低也可能会有相同问题，需要加上以下配置，该配置加上之后less-loader版本可以不用降低
   * https://github.com/arackaf/customize-cra/issues/315
   */
  adjustStyleLoaders(({ use: [, , postcss] }) => {
    const postcssOptions = postcss.options;
    postcss.options = { postcssOptions };
  })
)