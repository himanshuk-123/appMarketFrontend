module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Required by react-native-reanimated 4 / react-native-worklets.
    // Must be the LAST plugin in the list.
    plugins: ['react-native-worklets/plugin'],
  };
};
