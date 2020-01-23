module.exports = {
  version: '1.3.0',
  init: function (pluginContext) {
    pluginContext.registerPolicy(require('./policies/jaeger-policy'));
  },
  policies:['jaeger-policy'] // this is for CLI to automatically add to "policies" whitelist in gateway.config
};
