const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();

const { v4: uuidv4 } = require("uuid");
const swaggerOptions = {
  definition: {
    openapi: "3.0.0", // Use OpenAPI 3.0 for documentation
    info: {
      title: "Receipt Processor API",
      version: "1.0.0",
      description: "WebService for processing receipts and calculating points",
    },
  },
  apis: ["server.js"], // Files that contain the API routes and documentation
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// In-memory storage for receipts
const receipts = {};

// Constants for point values
const ROUND_DOLLAR_POINTS = 50;
const MULTIPLE_OF_25_POINTS = 25;
const ODD_DAY_POINTS = 6;
const AFTERNOON_POINTS = 10;
const PAIR_OF_ITEMS_POINTS = 5;

// Utility function to validate and parse numbers safely
function parseFloatSafe(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

// Utility function to validate time format (HH:MM)
function isValidTime(time) {
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}

// Utility function to validate date format (YYYY-MM-DD)
function isValidDate(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  // Split the date into components and check if it forms a valid date
  const [year, month, day] = date.split("-").map(Number);
  const dateObject = new Date(year, month - 1, day);

  // Check if the date object corresponds to the input date
  return (
    dateObject.getFullYear() === year &&
    dateObject.getMonth() === month - 1 &&
    dateObject.getDate() === day
  );
}

// Utility function to calculate points based on business rules
function calculatePoints(receipt) {
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
    points += ROUND_DOLLAR_POINTS;
  }

  // 3. Points for total being a multiple of 0.25
  if (total % 0.25 === 0) {
    points += MULTIPLE_OF_25_POINTS;
  }

  // 4. Points for every two items
  if (!Array.isArray(receipt.items)) {
    throw new Error("Items array must be a non-empty array");
  }
  points += Math.floor(receipt.items.length / 2) * PAIR_OF_ITEMS_POINTS;

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
    points += ODD_DAY_POINTS;
  }

  // 7. Points for purchase time between 2:00pm and 4:00pm
  if (!isValidTime(receipt.purchaseTime)) {
    throw new Error("Invalid time format. Must be HH:MM");
  }
  const purchaseTime = new Date(`1970-01-01T${receipt.purchaseTime}:00`);
  if (purchaseTime.getHours() >= 14 && purchaseTime.getHours() < 16) {
    points += AFTERNOON_POINTS;
  }

  return points;
}

// GET Endpoint to check server status
/**
 * @swagger
 * /:
 *   get:
 *     summary: Check the server status
 *     description: This endpoint checks if the server is up and running.
 *     responses:
 *       200:
 *         description: Server is up and running
 */
app.get("/", (req, res) => {
  res.send("Server is up and running!\n");
});

/**
 * @swagger
 * /receipts/process:
 *   post:
 *     summary: Process a receipt and calculate points
 *     description: This endpoint processes a receipt, validates the fields, and calculates points based on various criteria.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               retailer:
 *                 type: string
 *                 description: Name of the retailer
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *                 description: The purchase date in YYYY-MM-DD format
 *               purchaseTime:
 *                 type: string
 *                 format: time
 *                 description: The time of purchase in HH:MM format
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     shortDescription:
 *                       type: string
 *                       description: Short description of the item
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: Price of the item
 *               total:
 *                 type: string
 *                 description: Total amount of the receipt
 *     responses:
 *       200:
 *         description: Successfully processed the receipt
 *       400:
 *         description: Bad request, missing or invalid fields
 */
// POST Endpoint for submitting receipts
app.post("/receipts/process", (req, res) => {
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
    const receiptId = uuidv4();
    const points = calculatePoints(receipt);
    receipts[receiptId] = { ...receipt, points };
    res.json({ id: receiptId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET Endpoint to fetch points for a given receipt ID
/**
 * @swagger
 * /receipts/{id}/points:
 *   get:
 *     summary: Get points for a specific receipt
 *     description: This endpoint retrieves the points for a given receipt using the receipt ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the receipt
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the points for the receipt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: integer
 *                   description: The total points calculated for the receipt
 *       404:
 *         description: Receipt not found
 */
app.get("/receipts/:id/points", (req, res) => {
  const receiptId = req.params.id;
  const receiptData = receipts[receiptId];

  if (!receiptData) {
    return res.status(404).json({ error: "Receipt not found" });
  }

  res.status(200).json({ points: receiptData.points });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = { calculatePoints };
