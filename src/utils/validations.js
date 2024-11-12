// Utility function to validate and parse numbers safely
exports.parseFloatSafe = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};
