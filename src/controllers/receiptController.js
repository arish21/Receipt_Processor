const uuid = require("uuid");
const receiptService = require("../services/receiptService");

// In-memory store for receipt data
const receiptDataStore = {};

/**
 * Process the receipt, validate the data, and calculate points
 * @param req
 * @param res
 */
exports.processReceipt = (req, res) => {
  const receipt = req.body;
  const missingFields = [];

  // Check for missing required fields and collect them
  if (!receipt.retailer) missingFields.push("retailer");
  if (!receipt.purchaseDate) missingFields.push("purchaseDate");
  if (!receipt.purchaseTime) missingFields.push("purchaseTime");
  if (!receipt.items) missingFields.push("items");
  if (!receipt.total) missingFields.push("total");

  // If any fields are missing, return a detailed error
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    const receiptId = uuid.v4();
    const points = receiptService.calculatePoints(receipt);

    // Store the receipt data in memory
    receiptDataStore[receiptId] = {
      receipt,
      points,
    };

    res.json({ id: receiptId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Retrieve points for a specific receipt
 * @param req
 * @param res
 */
exports.getReceiptPoints = (req, res) => {
  const receiptId = req.params.id;

  // Check if the receipt ID exists in the in-memory store
  if (!receiptDataStore[receiptId]) {
    return res.status(404).json({ error: "Receipt not found" });
  }

  // Return the points for the receipt
  res.status(200).json({ points: receiptDataStore[receiptId].points });
};
