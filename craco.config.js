const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: webpackConfig => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: false,
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
        buffer: require.resolve('buffer/'),
        fs: false,
        process: require.resolve('process/browser'), // Polyfill process
      };

      // Fix fully specified issue for 'process/browser'
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': require.resolve('process/browser'),
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      );

      // Fix ESM extensionless imports in @aparajita packages
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
      });

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
