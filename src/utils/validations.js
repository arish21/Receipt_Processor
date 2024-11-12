// Utility function to validate and parse numbers safely
exports.parseFloatSafe = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

// Utility function to validate time format (HH:MM)
exports.isValidTime = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
  return timeRegex.test(time);
};

// Utility function to validate date format (YYYY-MM-DD)
exports.isValidDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};
