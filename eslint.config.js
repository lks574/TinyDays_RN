const expoConfig = require("eslint-config-expo/flat");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: [
      "coverage/",
      "dist/",
      "docs/design/prototype/",
      "node_modules/",
      "supabase/functions/",
      "tmp/",
      "web-build/",
    ],
  },
]);
