const express = require("express");
const app = require("./app"); // Import the app from app.js
const PORT = process.env.PORT || 3000;

// Only listen for requests if NODE_ENV is not "test"
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app; // Export app for testing purposes
