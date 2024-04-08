module.exports = {
  webpack: {
    configure: webpackConfig => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: false,
        stream: false,
        path: false,
        fs: false,
        vm: false,
      };
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
