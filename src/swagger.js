const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0", // OpenAPI version
    info: {
      title: "Receipt Processor API",
      version: "1.0.0",
      description: "API to process receipts and calculate points",
    },
    servers: [
      {
        url: "http://localhost:3000", // Define your server URL
      },
    ],
  },
  apis: [
    path.join(__dirname, "routes", "receiptRoutes.js"), // Ensure correct path to routes
    path.join(__dirname, "app.js"), // Ensure app.js is included
  ],
};

const swaggerDocs = swaggerJsdoc(options);

module.exports = swaggerDocs;
