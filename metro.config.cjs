const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const resolveFrom = require("resolve-from");

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
  };

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (
      // If the bundle is resolving "event-target-shim" from a module that is part of "react-native-webrtc".
      moduleName.startsWith("event-target-shim") &&
      context.originModulePath.includes("react-native-webrtc")
    ) {
      // Resolve event-target-shim relative to the react-native-webrtc package to use v6.
      // React Native requires v5 which is not compatible with react-native-webrtc.
      const targetModuleName =
        moduleName === "event-target-shim/index"
          ? "event-target-shim"
          : moduleName;
      const eventTargetShimPath = resolveFrom(
        context.originModulePath,
        targetModuleName
      );

      return {
        filePath: eventTargetShimPath,
        type: "sourceFile",
      };
    }

    // Ensure you call the default resolver.
    return context.resolveRequest(context, moduleName, platform);
  };

  return config;
})();

const path = require("path");

module.exports = withNativeWind(config, { input: path.resolve(__dirname, "./src/styles/global.css") });
