// config-overrides.js
const { override, overrideDevServer } = require("customize-cra");

const devServerConfig = () => config => {
  config.allowedHosts = ['all']; // 👈 Fix the schema error here
  return config;
};

module.exports = {
  webpack: override(),
  devServer: overrideDevServer(devServerConfig())
};
