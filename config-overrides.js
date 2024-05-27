const { override } = require('customize-cra');

const removeForkTsCheckerWebpackPlugin = () => config => {
  config.plugins = config.plugins.filter(
    plugin => !(plugin.constructor && plugin.constructor.name === 'ForkTsCheckerWebpackPlugin')
  );
  return config;
};

module.exports = override(
  removeForkTsCheckerWebpackPlugin()
);
