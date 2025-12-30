const tsConfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');
const path = require('path');

const { baseUrl, paths, outDir } = tsConfig.compilerOptions;

// Calculate the absolute path to the 'dist' directory
const absoluteBaseUrlForDist = path.join(__dirname, outDir);

// Register tsconfig-paths with the baseUrl pointing to the 'dist' directory
// and the original paths. This makes tsconfig-paths resolve aliases relative to 'dist'.
tsConfigPaths.register({
    baseUrl: absoluteBaseUrlForDist,
    paths: paths,
});

// Now, require the main entry point of your compiled application
require('./dist/core/index.js');
