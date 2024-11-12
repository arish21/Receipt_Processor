// utils/PointsCalculator.js

const {
  parseFloatSafe,
  isValidTime,
  isValidDate,
} = require("../utils/validations");

// Define constants for points
const ROUND_DOLLAR_POINTS = 50;
const MULTIPLE_OF_25_POINTS = 25;
const PAIR_OF_ITEMS_POINTS = 5;
const ODD_DAY_POINTS = 6;
const AFTERNOON_POINTS = 10;

/**
 * Validates the receipt object
 * @param receipt
 * @throws {Error} if validation fails
 */
const isRequestValid = (receipt) => {
  // Validate retailer name
  if (typeof receipt.retailer !== "string" || !receipt.retailer.trim()) {
    throw new Error("Retailer name is required and must be a non-empty string");
  }

  // Validate total
  const total = parseFloatSafe(receipt.total);
  if (total === null) {
    throw new Error("Invalid total value. Must be a numeric string.");
  }

  // Validate items array
  if (!Array.isArray(receipt.items)) {
    throw new Error("Items array must be a non-empty array");
  }
  receipt.items.forEach((item) => {
    if (
      typeof item.shortDescription !== "string" ||
      !item.shortDescription.trim()
    ) {
      throw new Error("Each item must have a non-empty description");
    }
    const price = parseFloatSafe(item.price);
    if (price === null) {
      throw new Error("Item price must be a valid number");
    }
  });

  // Validate purchase date and time
  if (!isValidDate(receipt.purchaseDate)) {
    throw new Error("Invalid date format. Must be YYYY-MM-DD");
  }
  if (!isValidTime(receipt.purchaseTime)) {
    throw new Error("Invalid time format. Must be HH:MM");
  }

  return true; // All validations passed
};

/**
 * Calculate points based on business rules
 * @param receipt
 * @returns {number} points
 */
exports.calculatePoints = (receipt) => {
  // 1. Validate the request before proceeding with any calculations
  isRequestValid(receipt);

  let points = 0;

  // 2. Points for alphanumeric characters in retailer name
  points += receipt.retailer.replace(/[^a-zA-Z0-9]/g, "").length;

  // 3. Points for round dollar total
  const total = parseFloatSafe(receipt.total);

  // Check if total is zero and return zero points
  if (total === 0) {
    return 0;
  }

  // Only add points if total is not zero and is a round dollar amount
  if (total === parseInt(receipt.total)) {
    points += ROUND_DOLLAR_POINTS; // ROUND_DOLLAR_POINTS
  }

  // 4. Points for total being a multiple of 0.25
  if (total % 0.25 === 0) {
    points += MULTIPLE_OF_25_POINTS; // MULTIPLE_OF_25_POINTS
  }

  // 5. Points for every two items
  points += Math.floor(receipt.items.length / 2) * PAIR_OF_ITEMS_POINTS; // PAIR_OF_ITEMS_POINTS

  // 6. Points for item descriptions with length multiple of 3
  receipt.items.forEach((item) => {
    const descriptionLength = item.shortDescription.trim().length;
    if (descriptionLength % 3 === 0) {
      const price = parseFloatSafe(item.price);
      points += Math.ceil(price * 0.2);
    }
  });

  // 7. Points for odd day
  const [year, month, day] = receipt.purchaseDate.split("-");
  if (parseInt(day, 10) % 2 !== 0) {
    points += ODD_DAY_POINTS; // ODD_DAY_POINTS
  }

  // 8. Points for purchase time between 2:00pm and 4:00pm
  const purchaseTime = new Date(`1970-01-01T${receipt.purchaseTime}:00`);
  if (purchaseTime.getHours() >= 14 && purchaseTime.getHours() < 16) {
    points += AFTERNOON_POINTS; // AFTERNOON_POINTS
  }

  return points;
};
