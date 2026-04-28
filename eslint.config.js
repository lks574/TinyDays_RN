const expoConfig = require("eslint-config-expo/flat");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: [
      "coverage/",
      "dist/",
      "node_modules/",
      "tmp/",
      "web-build/",
    ],
  },
]);
