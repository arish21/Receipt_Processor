const express = require("express");
const router = express.Router();
const receiptController = require("../controllers/receiptController");

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
router.post("/process", receiptController.processReceipt);

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
 *       404:
 *         description: Receipt not found
 */
router.get("/:id/points", receiptController.getReceiptPoints);

module.exports = router;
