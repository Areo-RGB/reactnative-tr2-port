const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude native build directories from being watched
config.resolver.blockList = [
    /android\/.*/,
    /ios\/.*/,
];

module.exports = config;
