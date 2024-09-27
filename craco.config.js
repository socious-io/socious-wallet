const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
        fs: false,
        process: require.resolve('process/browser'),  // Polyfill process
      };

      // Fix fully specified issue for 'process/browser'
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': require.resolve('process/browser'),
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',  // Ensure process is available globally
        })
      );

      return webpackConfig;
    },
  },
  style: {
    sass: {
      loaderOptions: {
        additionalData: `@import "src/styles/global/_global.scss";`,
      },
    },
  },
};
