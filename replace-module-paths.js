function dataUrlFromRequire(name) {
  const __m = require(name);
  const defaultExport = `
const __m = require('${name}');
export default __m;`;
  const value =
    typeof __m !== "object" || __m === null || Array.isArray(__m)
      ? defaultExport
      : `${defaultExport}
export const { ${Object.keys(__m).join(", ")} } = __m;`;
  return `data:application/javascript,${encodeURI(value)}`;
}

module.exports = function replaceImport(
  originalPath,
  callingFileName,
  options
) {
  return originalPath.startsWith(".")
    ? undefined
    : dataUrlFromRequire(originalPath);
};
