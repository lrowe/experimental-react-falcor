function dataUrlFromRequire(name) {
  const m = require(name);
  const source =
    typeof m !== "object" ||
    m === null ||
    Array.isArray(m) ||
    Object.keys(m).length === 0
      ? `export default require(${JSON.stringify(name)});`
      : `
const __m = require(${JSON.stringify(name)});
export const { ${Object.keys(m).join(", ")} } = __m;
export default ${m.default !== undefined ? "default" : "__m"};
`;
  return `data:application/javascript,${encodeURI(source)}`;
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
