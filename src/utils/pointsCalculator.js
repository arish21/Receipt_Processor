// utils/PointsCalculator.js
const {
  parseFloatSafe,
  isValidTime,
  isValidDate,
} = require("../utils/validations");

const {
  ROUND_DOLLAR_POINTS,
  MULTIPLE_OF_25_POINTS,
  PAIR_OF_ITEMS_POINTS,
  ODD_DAY_POINTS,
  AFTERNOON_POINTS,
} = require("./constants");

/**
 * Calculate points based on business rules
 * @param receipt
 * @returns {number} points
 */
exports.calculatePoints = (receipt) => {
  let points = 0;

  // 1. Points for alphanumeric characters in retailer name
  if (typeof receipt.retailer !== "string" || !receipt.retailer.trim()) {
    throw new Error("Retailer name is required and must be a non-empty string");
  }
  points += receipt.retailer.replace(/[^a-zA-Z0-9]/g, "").length;

  // 2. Points for round dollar total
  const total = parseFloatSafe(receipt.total);
  if (total === null) {
    throw new Error("Invalid total value. Must be a numeric string.");
  }

  // Check if total is zero and return zero points
  if (total === 0) {
    return 0;
  }

  // Only add points if total is not zero and is a round dollar amount
  if (total === parseInt(receipt.total)) {
    points += ROUND_DOLLAR_POINTS; // ROUND_DOLLAR_POINTS
  }

  // 3. Points for total being a multiple of 0.25
  if (total % 0.25 === 0) {
    points += MULTIPLE_OF_25_POINTS; // MULTIPLE_OF_25_POINTS
  }

  // 4. Points for every two items
  if (!Array.isArray(receipt.items)) {
    throw new Error("Items array must be a non-empty array");
  }
  points += Math.floor(receipt.items.length / 2) * PAIR_OF_ITEMS_POINTS; // PAIR_OF_ITEMS_POINTS

  // 5. Points for item descriptions with length multiple of 3
  receipt.items.forEach((item) => {
    if (
      typeof item.shortDescription !== "string" ||
      !item.shortDescription.trim()
    ) {
      throw new Error("Each item must have a non-empty description");
    }
    const descriptionLength = item.shortDescription.trim().length;
    if (descriptionLength % 3 === 0) {
      const price = parseFloatSafe(item.price);
      if (price === null) {
        throw new Error("Item price must be a valid number");
      }
      points += Math.ceil(price * 0.2);
    }
  });

  // 6. Points for odd day
  if (!isValidDate(receipt.purchaseDate)) {
    throw new Error("Invalid date format. Must be YYYY-MM-DD");
  }
  const [year, month, day] = receipt.purchaseDate.split("-");
  if (parseInt(day, 10) % 2 !== 0) {
    points += ODD_DAY_POINTS; // ODD_DAY_POINTS
  }

  // 7. Points for purchase time between 2:00pm and 4:00pm
  if (!isValidTime(receipt.purchaseTime)) {
    throw new Error("Invalid time format. Must be HH:MM");
  }
  const purchaseTime = new Date(`1970-01-01T${receipt.purchaseTime}:00`);
  if (purchaseTime.getHours() >= 14 && purchaseTime.getHours() < 16) {
    points += AFTERNOON_POINTS; // AFTERNOON_POINTS
  }

  return points;
};
