const pointsCalculator = require("../utils/pointsCalculator");

/**
 * Calculate the points based on receipt data
 * @param receipt
 * @returns {number}
 */
exports.calculatePoints = (receipt) => {
  return pointsCalculator.calculatePoints(receipt);
};
