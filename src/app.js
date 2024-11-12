const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const dotenv = require("dotenv");
const receiptRoutes = require("./routes/receiptRoutes");
const swaggerDocs = require("./swagger");

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use("/swagger-api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Setup Swagger UI

// Swagger documentation for the root route
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

app.use("/receipts", receiptRoutes); // Route for receipt processing

module.exports = app;
