const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
    // Force Metro to use the CommonJS build of packages that ship
    // untranspiled ESM, which causes "Unexpected token" parse errors.
    unstable_enablePackageExports: false,
  };

  return config;
})();

module.exports = withNativeWind(config, { input: "./src/styles/global.css" });

